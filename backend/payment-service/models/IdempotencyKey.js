const mongoose = require('mongoose');

const idempotencyKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    requestHash: { type: String, required: true },
    statusCode: { type: Number, required: true },
    responseBody: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('IdempotencyKey', idempotencyKeySchema);
