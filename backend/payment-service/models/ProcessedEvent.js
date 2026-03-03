const mongoose = require('mongoose');

const processedEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventName: { type: String, required: true },
    source: { type: String, default: null },
    status: {
      type: String,
      enum: ['processing', 'processed', 'failed'],
      default: 'processing'
    },
    processedAt: { type: Date, default: null },
    lastError: { type: String, default: null }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('ProcessedEvent', processedEventSchema);
