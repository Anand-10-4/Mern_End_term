const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  buyerName: String,
  amountKg: {
    type: Number,
    required: true,
  },
  reservedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  reservationToken: {
    type: String,
    required: true,
  },
});

const batchLotSchema = new mongoose.Schema(
  {
    lotNumber: {
      type: String,
      required: [true, 'Lot number identifier is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Batch / Lot name is required'],
      trim: true,
    },
    origin: {
      country: { type: String, required: true },
      region: { type: String, required: true },
      estate: { type: String, default: 'Independent Cooperative' },
      altitudeMeters: { type: Number, default: 1850 },
      varietal: { type: String, default: 'Heirloom / Bourbon' },
      processMethod: {
        type: String,
        enum: ['Washed', 'Natural', 'Honey (Yellow/Red/Black)', 'Anaerobic Slow Dry', 'Thermal Shock'],
        default: 'Washed',
      },
    },
    roaster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roastProfile: {
      type: String,
      enum: ['Light Cinnamon', 'Medium City+', 'Full City', 'Omni-Roast', 'Nordic Filter'],
      default: 'Medium City+',
    },
    greenWeightKg: {
      type: Number,
      required: true,
      min: [1, 'Green coffee weight must be at least 1 kg'],
    },
    roastedWeightKg: {
      type: Number,
      required: true,
      min: [1, 'Roasted coffee weight must be at least 1 kg'],
    },
    availableKg: {
      type: Number,
      required: true,
      min: [0, 'Available weight cannot be negative'],
    },
    allocatedKg: {
      type: Number,
      default: 0,
    },
    pricePerKg: {
      type: Number,
      required: true,
      min: [5, 'Price per kg must be at least $5'],
    },
    moistureContentPercent: {
      type: Number,
      default: 11.2,
    },
    densityGramsPerLiter: {
      type: Number,
      default: 720,
    },
    defectCount: {
      type: Number,
      default: 0,
    },
    scaScore: {
      type: Number,
      default: 86.5,
      min: 0,
      max: 100,
    },
    scaClassification: {
      type: String,
      default: 'Excellent Specialty',
    },
    cuppingScores: {
      fragrance: { type: Number, default: 8.5 },
      flavor: { type: Number, default: 8.75 },
      aftertaste: { type: Number, default: 8.25 },
      acidity: { type: Number, default: 8.75 },
      body: { type: Number, default: 8.5 },
      balance: { type: Number, default: 8.5 },
      uniformity: { type: Number, default: 10.0 },
      cleanCup: { type: Number, default: 10.0 },
      sweetness: { type: Number, default: 10.0 },
      overall: { type: Number, default: 8.75 },
    },
    flavorNotes: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'sensory_evaluation', 'approved', 'allocated', 'sold_out', 'archived'],
      default: 'approved',
    },
    activeReservations: [reservationSchema],
    qrHash: {
      type: String,
      required: true,
      unique: true,
    },
    roastDate: {
      type: Date,
      default: Date.now,
    },
    harvestSeason: {
      type: String,
      default: '2025/2026 Crop',
    },
    certifications: [{ type: String }], // e.g. 'Rainforest Alliance', 'Organic Fair Trade', 'Direct Trade'
    story: {
      type: String,
      default: 'Hand-picked micro-lot harvested at peak ripeness and processed under controlled temperature fermentation.',
    },
  },
  { timestamps: true }
);

// Helper method to clear expired reservations and restore availableKg
batchLotSchema.methods.cleanupExpiredReservations = function () {
  const now = new Date();
  const valid = [];
  let restoredWeight = 0;

  for (const res of this.activeReservations) {
    if (res.expiresAt > now) {
      valid.push(res);
    } else {
      restoredWeight += res.amountKg;
    }
  }

  if (restoredWeight > 0) {
    this.availableKg += restoredWeight;
    this.activeReservations = valid;
    if (this.status === 'sold_out' && this.availableKg > 0) {
      this.status = 'approved';
    }
  }

  return restoredWeight;
};

module.exports = mongoose.model('BatchLot', batchLotSchema);
