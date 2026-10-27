const mongoose = require('mongoose');

const cuppingSessionSchema = new mongoose.Schema(
  {
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BatchLot',
      required: [true, 'Cupping session must reference a batch lot'],
    },
    evaluator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionTitle: {
      type: String,
      default: 'Official SCA Sensory Protocol Cupping Session',
    },
    waterTempCelsius: {
      type: Number,
      default: 93.5, // Standard SCA cupping temp is 93.3°C (200°F)
    },
    grindMicrons: {
      type: Number,
      default: 850, // Standard SCA cupping grind size
    },
    waterMineralPpm: {
      type: Number,
      default: 150, // SCA standard ~125-175 ppm
    },
    // The 10 SCA Attributes (6.00 to 10.00 scale)
    fragrance: { type: Number, required: true, min: 6, max: 10, default: 8.0 },
    flavor: { type: Number, required: true, min: 6, max: 10, default: 8.0 },
    aftertaste: { type: Number, required: true, min: 6, max: 10, default: 8.0 },
    acidity: { type: Number, required: true, min: 6, max: 10, default: 8.0 },
    body: { type: Number, required: true, min: 6, max: 10, default: 8.0 },
    balance: { type: Number, required: true, min: 6, max: 10, default: 8.0 },
    uniformity: { type: Number, required: true, min: 0, max: 10, default: 10.0 },
    cleanCup: { type: Number, required: true, min: 0, max: 10, default: 10.0 },
    sweetness: { type: Number, required: true, min: 0, max: 10, default: 10.0 },
    overall: { type: Number, required: true, min: 6, max: 10, default: 8.0 },
    // Defect Deductions
    defectCups: { type: Number, default: 0, min: 0, max: 5 },
    defectIntensity: { type: Number, default: 2, enum: [2, 4] }, // 2 = taint, 4 = fault
    defectDeduction: { type: Number, default: 0 },
    // Calculated Outputs
    totalScore: { type: Number, required: true },
    classification: { type: String, required: true },
    tastingNotes: [{ type: String }],
    descriptors: {
      aromaNotes: [String],
      acidityType: { type: String, default: 'Citric & Malic' },
      bodyTexture: { type: String, default: 'Silky / Juicy' },
    },
    isApprovedForMarketplace: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CuppingSession', cuppingSessionSchema);
