const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  imageEmoji: {
    type: String,
    default: '🥐',
  },
  isCustomCake: {
    type: Boolean,
    default: false,
  },
  cakeDetails: {
    sizeName: String,
    spongeName: String,
    frostingName: String,
    customMessage: String,
    dietary: String,
    decorTheme: String,
  },
});

const orderMilestoneSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponApplied: {
      type: String,
      default: '',
    },
    loyaltyPointsUsed: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    fulfillmentType: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'pickup',
    },
    scheduledSlot: {
      type: String,
      default: 'Today: 2:00 PM - 3:00 PM (Warm Oven Batch)',
    },
    deliveryAddress: {
      street: { type: String, default: '45 Artisan Way, Apt 3B' },
      city: { type: String, default: 'Sunnyvale' },
      postalCode: { type: String, default: '94086' },
      phone: { type: String, default: '+1 (555) 234-5678' },
    },
    status: {
      type: String,
      enum: ['placed', 'baking', 'decorating', 'ready', 'completed', 'cancelled'],
      default: 'placed',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      default: 'razorpay',
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    milestones: [orderMilestoneSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
