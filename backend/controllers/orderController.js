const Order = require('../models/Order');
const BatchLot = require('../models/BatchLot');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateOrderNumber } = require('../utils/tokenHelper');

// @desc    Create new Escrow Allocation Order
// @route   POST /api/orders
// @access  Private (Buyers)
const createOrder = async (req, res, next) => {
  try {
    const { batchId, quantityKg, reservationToken, shippingAddress } = req.body;
    const requestedQty = Number(quantityKg);

    if (!requestedQty || requestedQty < 5) {
      return res.status(400).json({
        success: false,
        message: 'Minimum wholesale allocation contract size is 5 kg',
      });
    }

    const batch = await BatchLot.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch lot not found' });
    }

    batch.cleanupExpiredReservations();

    // Check if coming from a reservation
    let hadReservation = false;
    if (reservationToken) {
      const resIndex = batch.activeReservations.findIndex((r) => r.reservationToken === reservationToken);
      if (resIndex !== -1) {
        hadReservation = true;
        batch.activeReservations.splice(resIndex, 1);
      }
    }

    // If no valid reservation existed, ensure enough unreserved stock
    if (!hadReservation) {
      if (batch.availableKg < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory: Only ${batch.availableKg} kg available.`,
        });
      }
      batch.availableKg -= requestedQty;
    }

    // Update allocated counter on batch
    batch.allocatedKg += requestedQty;
    if (batch.availableKg <= 0) {
      batch.status = 'sold_out';
    }
    await batch.save();

    // Calculate buyer pricing & tier discounts
    const buyer = await User.findById(req.user._id);
    let discountPercent = 0;
    if (buyer.tier === 'Gold Reserve') discountPercent = 10;
    else if (buyer.tier === 'Silver') discountPercent = 5;

    const subtotal = requestedQty * batch.pricePerKg;
    const discountAmount = Math.round((subtotal * (discountPercent / 100)) * 100) / 100;
    const totalAmount = Math.round((subtotal - discountAmount) * 100) / 100;

    // Update buyer used quota
    buyer.usedQuotaKg += requestedQty;
    await buyer.save();

    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      buyer: buyer._id,
      roaster: batch.roaster,
      batchLot: batch._id,
      quantityKg: requestedQty,
      unitPricePerKg: batch.pricePerKg,
      subtotal,
      tierDiscountPercent: discountPercent,
      discountAmount,
      totalAmount,
      escrowStatus: 'escrow_held',
      shippingAddress: shippingAddress || {
        street: '450 Specialty Avenue',
        city: 'Portland',
        state: 'OR',
        postalCode: '97201',
        country: 'USA',
      },
      qualityCertificateHash: batch.qrHash,
      milestones: [
        {
          status: 'escrow_held',
          note: `Escrow funds of $${totalAmount.toFixed(2)} secured in multi-sig vault. Awaiting roast schedule.`,
          updatedBy: buyer._id,
          timestamp: new Date(),
        },
      ],
    });

    await AuditLog.create({
      action: 'ESCROW_ORDER_CREATED',
      user: buyer._id,
      entityType: 'Order',
      entityId: order._id,
      details: {
        orderNumber: order.orderNumber,
        batchLot: batch.lotNumber,
        totalAmount,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Escrow contract generated and locked in allocation ledger',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders (buyer or roaster)
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'buyer') {
      query.buyer = req.user._id;
    } else if (req.user.role === 'roaster') {
      query.roaster = req.user._id;
    }

    const orders = await Order.find(query)
      .populate('buyer', 'name company email tier')
      .populate('roaster', 'name company email')
      .populate('batchLot', 'lotNumber name origin scaScore scaClassification roastProfile pricePerKg')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name company email tier')
      .populate('roaster', 'name company email')
      .populate('batchLot');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Advance escrow status along state machine
// @route   PATCH /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const allowedTransitions = {
      escrow_held: ['roasting_scheduled', 'cancelled'],
      roasting_scheduled: ['cupping_verified', 'cancelled'],
      cupping_verified: ['dispatched', 'cancelled'],
      dispatched: ['delivered'],
      delivered: ['escrow_released'],
      escrow_released: [],
      cancelled: [],
    };

    const validNextStates = allowedTransitions[order.escrowStatus] || [];
    if (!validNextStates.includes(status) && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Invalid state transition from '${order.escrowStatus}' to '${status}'. Valid transitions: ${validNextStates.join(', ')}`,
      });
    }

    order.escrowStatus = status;
    order.milestones.push({
      status,
      note: note || `Order advanced to ${status.replace('_', ' ')}`,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await order.save();

    await AuditLog.create({
      action: 'ESCROW_STATUS_TRANSITION',
      user: req.user._id,
      entityType: 'Order',
      entityId: order._id,
      details: { newStatus: status, orderNumber: order.orderNumber },
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get verified Lot Certificate
// @route   GET /api/orders/:id/certificate
// @access  Public
const getCertificateData = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name company tier')
      .populate('roaster', 'name company')
      .populate('batchLot');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const lot = order.batchLot;

    const certificate = {
      certificateId: `CERT-${order.orderNumber}`,
      issuedDate: order.createdAt,
      digitalSealHash: order.qualityCertificateHash,
      lotNumber: lot.lotNumber,
      lotName: lot.name,
      origin: lot.origin,
      scaScore: lot.scaScore,
      scaClassification: lot.scaClassification,
      cuppingRadar: lot.cuppingScores,
      flavorNotes: lot.flavorNotes,
      roastProfile: lot.roastProfile,
      roaster: order.roaster,
      buyer: order.buyer,
      quantityKg: order.quantityKg,
      escrowStatus: order.escrowStatus,
      trackingNumber: order.trackingNumber,
      verificationUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/${order.qualityCertificateHash}`,
    };

    res.status(200).json({
      success: true,
      certificate,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getCertificateData,
};
