const Appointment = require('../models/Appointment');
const AppError = require('../utils/appError');

const SLOT_CAPACITY = 10;

const getDateRange = (date) => {
  const parsedDate = new Date(date);
  const startOfDay = new Date(parsedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(parsedDate);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

const generateQueueNumber = async (date, timeSlot, session = null) => {
  const { startOfDay, endOfDay } = getDateRange(date);

  const count = await Appointment.countDocuments({
    date: { $gte: startOfDay, $lte: endOfDay },
    timeSlot
  }).session(session);

  if (count >= SLOT_CAPACITY) {
    throw new AppError('Slot Full', 400);
  }

  return count + 1;
};

module.exports = { generateQueueNumber, getDateRange, SLOT_CAPACITY };
