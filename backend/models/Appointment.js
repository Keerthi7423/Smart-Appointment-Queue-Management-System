const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String,
      required: true
    },
    queueNumber: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['waiting', 'serving', 'completed'],
      default: 'waiting'
    }
  },
  { timestamps: true }
);

appointmentSchema.index({ userId: 1, date: 1, timeSlot: 1 }, { unique: true });
appointmentSchema.index({ date: 1, timeSlot: 1, queueNumber: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
