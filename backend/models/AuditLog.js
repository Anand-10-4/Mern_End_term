const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    entityType: {
      type: String,
      enum: ['BatchLot', 'CuppingSession', 'Order', 'User', 'System'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
