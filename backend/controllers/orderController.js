const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateOrderNumber } = require('../utils/tokenHelper');

// @desc    Place a new bakery order (Daily bakes or custom cakes)
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      fulfillmentType,
      scheduledSlot,
      deliveryAddress,
      couponCode,
      useLoyaltyPoints,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before checking out.',
      });
    }

    const customer = await User.findById(req.user._id);
    let subtotal = 0;
    const orderItems = [];

    // Verify stock and calculate subtotal
    for (const item of items) {
      if (item.isCustomCake) {
        // Custom cake item
        subtotal += Number(item.price);
        orderItems.push({
          name: item.name || 'Custom Artisan Cake',
          price: Number(item.price),
          quantity: Number(item.quantity) || 1,
          isCustomCake: true,
          cakeDetails: item.cakeDetails,
          imageEmoji: '🎂',
        });
      } else {
        // Standard bakery product
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product '${item.name}' no longer available`,
          });
        }

        const qty = Number(item.quantity) || 1;
        if (product.availableStock < qty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Only ${product.availableStock} remaining today.`,
          });
        }

        // Decrement stock
        product.availableStock -= qty;
        await product.save();

        const lineTotal = product.price * qty;
        subtotal += lineTotal;

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: qty,
          isCustomCake: false,
          imageEmoji: product.imageEmoji,
        });
      }
    }

    // Coupon discount logic
    let discountAmount = 0;
    let couponApplied = '';
    if (couponCode && couponCode.toUpperCase() === 'GOLDEN10') {
      discountAmount = Math.round((subtotal * 0.1) * 100) / 100;
      couponApplied = 'GOLDEN10 (10% Off)';
    }

    // Loyalty points deduction (10 points = $1 off)
    let loyaltyDiscount = 0;
    let pointsUsed = 0;
    if (useLoyaltyPoints && customer.loyaltyPoints >= 10) {
      const maxPointDiscount = Math.floor(customer.loyaltyPoints / 10);
      const pointsToDeduct = Math.min(maxPointDiscount, Math.floor(subtotal - discountAmount));
      loyaltyDiscount = pointsToDeduct;
      pointsUsed = pointsToDeduct * 10;
      customer.loyaltyPoints -= pointsUsed;
    }

    const totalDiscount = discountAmount + loyaltyDiscount;
    const totalAmount = Math.max(0, Math.round((subtotal - totalDiscount) * 100) / 100);

    // Award loyalty points for purchase (1 point per $1 spent)
    const pointsEarned = Math.floor(totalAmount);
    customer.loyaltyPoints += pointsEarned;
    await customer.save();

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer: customer._id,
      items: orderItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(totalDiscount * 100) / 100,
      couponApplied,
      loyaltyPointsUsed: pointsUsed,
      totalAmount,
      fulfillmentType: fulfillmentType || 'pickup',
      scheduledSlot: scheduledSlot || 'Today: Warm Oven Batch Slot (3:00 PM)',
      deliveryAddress: deliveryAddress || customer.address,
      status: 'placed',
      milestones: [
        {
          status: 'placed',
          note: `Order received and confirmed in GoldenCrust kitchen queue.`,
          updatedBy: customer._id,
          timestamp: new Date(),
        },
      ],
    });

    await AuditLog.create({
      action: 'ORDER_PLACED',
      user: customer._id,
      entityType: 'Order',
      entityId: order._id,
      details: { orderNumber: order.orderNumber, total: order.totalAmount, pointsEarned },
    });

    res.status(201).json({
      success: true,
      message: `Order #${order.orderNumber} placed! Earned ${pointsEarned} loyalty points.`,
      order,
      loyaltyPointsBalance: customer.loyaltyPoints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's order history
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.product', 'name price imageEmoji category')
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

// @desc    Get all orders for kitchen prep queue (Baker / Admin)
// @route   GET /api/orders/kitchen
// @access  Private (Baker / Admin)
const getKitchenOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
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

// @desc    Advance kitchen order status (State Machine)
// @route   PATCH /api/orders/:id/status
// @access  Private (Baker / Admin / Customer for cancel)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // State Machine allowed transitions
    const allowedTransitions = {
      placed: ['baking', 'cancelled'],
      baking: ['decorating', 'ready', 'cancelled'],
      decorating: ['ready', 'cancelled'],
      ready: ['completed'],
      completed: [],
      cancelled: [],
    };

    const nextStates = allowedTransitions[order.status] || [];
    if (!nextStates.includes(status) && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${order.status}' to '${status}'. Valid next stages: ${nextStates.join(', ')}`,
      });
    }

    order.status = status;
    order.milestones.push({
      status,
      note: note || `Order advanced to ${status.toUpperCase()} in kitchen pipeline`,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await order.save();

    await AuditLog.create({
      action: 'ORDER_STATUS_TRANSITION',
      user: req.user._id,
      entityType: 'Order',
      entityId: order._id,
      details: { newStatus: status, orderNumber: order.orderNumber },
    });

    res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} updated to ${status.toUpperCase()}`,
      order,
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
    const order = await Order.findById(req.params.id).populate('customer', 'name email phone');
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

module.exports = {
  createOrder,
  getMyOrders,
  getKitchenOrders,
  updateOrderStatus,
  getOrderById,
};
