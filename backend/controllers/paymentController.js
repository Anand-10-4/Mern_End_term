const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateOrderNumber } = require('../utils/tokenHelper');

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TkQfS3DEVkqBxw';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'MRbh8un91R2oHPmoy5ZUTpKb';
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// @desc    Get Razorpay Public Key ID
// @route   GET /api/payment/config
// @access  Public
const getConfig = (req, res) => {
  res.status(200).json({
    success: true,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TkQfS3DEVkqBxw',
  });
};

// @desc    Create a Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private (Customer)
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid order amount is required',
      });
    }

    const razorpay = getRazorpayInstance();

    // Razorpay amount is in smallest currency unit (paise / cents)
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: `gc_rcpt_${Date.now()}`,
      notes: notes || {
        store: 'GoldenCrust Artisan Bakery',
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order: razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TkQfS3DEVkqBxw',
    });
  } catch (error) {
    console.error('[Razorpay Order Creation Error]', error);
    res.status(500).json({
      success: false,
      message: error.error?.description || error.message || 'Failed to create Razorpay order',
    });
  }
};

// @desc    Verify Razorpay Payment Signature and finalize order
// @route   POST /api/payment/verify
// @access  Private (Customer)
const verifyPaymentAndCreateOrder = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: missing payment signature details',
      });
    }

    // Verify HMAC SHA256 signature
    const secret = process.env.RAZORPAY_KEY_SECRET || 'MRbh8un91R2oHPmoy5ZUTpKb';
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: invalid signature',
      });
    }

    // If order details are provided, persist the verified order
    if (!orderDetails || !orderDetails.items || orderDetails.items.length === 0) {
      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Payment signature verified successfully',
      });
    }

    const {
      items,
      fulfillmentType,
      scheduledSlot,
      deliveryAddress,
      couponCode,
      useLoyaltyPoints,
    } = orderDetails;

    const customer = await User.findById(req.user._id);
    let subtotal = 0;
    const orderItems = [];

    // Verify stock and calculate subtotal
    for (const item of items) {
      if (item.isCustomCake) {
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
        const product = await Product.findById(item.productId);
        if (product) {
          const qty = Number(item.quantity) || 1;
          if (product.availableStock >= qty) {
            product.availableStock -= qty;
            await product.save();
          }
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
    }

    // Apply Coupon
    let discountAmount = 0;
    let couponApplied = '';
    if (couponCode && couponCode.toUpperCase() === 'GOLDEN10') {
      discountAmount = Math.round(subtotal * 0.1 * 100) / 100;
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

    // Award loyalty points
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
      paymentStatus: 'paid',
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      milestones: [
        {
          status: 'placed',
          note: `Payment verified via Razorpay (${razorpay_payment_id}). Order confirmed in kitchen queue.`,
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
      details: {
        orderNumber: order.orderNumber,
        total: order.totalAmount,
        paymentMethod: 'razorpay',
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    res.status(201).json({
      success: true,
      verified: true,
      message: `Payment successful! Order #${order.orderNumber} confirmed. Earned ${pointsEarned} loyalty points!`,
      order,
      loyaltyPointsBalance: customer.loyaltyPoints,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConfig,
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
};
