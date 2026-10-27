const mongoose = require('mongoose');

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
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roaster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    batchLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BatchLot',
      required: true,
    },
    quantityKg: {
      type: Number,
      required: [true, 'Quantity in kg is required'],
      min: [5, 'Minimum wholesale allocation order is 5 kg'],
    },
    unitPricePerKg: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    tierDiscountPercent: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    escrowStatus: {
      type: String,
      enum: [
        'escrow_held',
        'roasting_scheduled',
        'cupping_verified',
        'dispatched',
        'delivered',
        'escrow_released',
        'cancelled',
      ],
      default: 'escrow_held',
    },
    shippingAddress: {
      street: { type: String, default: 'Craft Roastery Row, Suite 400' },
      city: { type: String, default: 'Portland' },
      state: { type: String, default: 'OR' },
      postalCode: { type: String, default: '97201' },
      country: { type: String, default: 'USA' },
    },
    trackingNumber: {
      type: String,
      default: function () {
        return 'TRK-EXP-' + Math.floor(10000000 + Math.random() * 90000000);
      },
    },
    qualityCertificateHash: {
      type: String,
      required: true,
    },
    milestones: [orderMilestoneSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
