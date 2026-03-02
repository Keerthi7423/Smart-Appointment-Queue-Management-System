const AppError = require('../utils/appError');

const validateBookingInput = (req, res, next) => {
  const { date, timeSlot } = req.body;

  if (!timeSlot || typeof timeSlot !== 'string' || !timeSlot.trim()) {
    return next(new AppError('timeSlot is required', 400));
  }

  if (!date) {
    return next(new AppError('date is required', 400));
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return next(new AppError('date must be a valid date', 400));
  }

  req.body.date = parsedDate.toISOString();
  req.body.timeSlot = timeSlot.trim();

  return next();
};

module.exports = { validateBookingInput };
