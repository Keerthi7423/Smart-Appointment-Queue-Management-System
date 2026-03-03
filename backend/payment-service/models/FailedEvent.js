const mongoose = require('mongoose');

const failedEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, index: true },
    eventName: { type: String, required: true },
    source: { type: String, default: null },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    errorMessage: { type: String, required: true },
    attempts: { type: Number, required: true, default: 0 },
    failedAt: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('FailedEvent', failedEventSchema);
