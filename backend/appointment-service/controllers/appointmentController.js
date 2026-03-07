const Appointment = require('../models/Appointment');
require('../models/User');
const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const { generateQueueNumber, getDateRange } = require('../services/queueService');
const {
  CACHE_KEYS,
  CACHE_TTL_SECONDS,
  getCache,
  setCache,
  invalidateAppointmentCache
} = require('../services/cacheService');
const { publishEvent } = require('../events/eventPublisher');
const logger = require('../observability/logger');

const bookAppointment = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Unauthorized', 401);
    }

    const { date, timeSlot } = req.body;
    const appointmentDate = new Date(date);
    const { startOfDay, endOfDay } = getDateRange(appointmentDate);

    const existingAppointment = await Appointment.findOne({
      userId: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot
    });

    if (existingAppointment) {
      throw new AppError('You already booked this time slot for this date', 400);
    }

    const queueNumber = await generateQueueNumber(appointmentDate, timeSlot);

    const appointment = await Appointment.create({
      userId: req.user.id,
      date: startOfDay,
      timeSlot,
      queueNumber
    });

    await invalidateAppointmentCache();

    logger.info(
      { appointmentId: appointment._id, userId: appointment.userId },
      '[saga][appointment-service] step=appointment.created'
    );
    await publishEvent('appointment.created', {
      appointmentId: appointment._id,
      userId: appointment.userId,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      queueNumber: appointment.queueNumber,
      createdAt: appointment.createdAt
    });

    return res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('Duplicate booking detected. Please retry.', 409));
    }

    return next(error);
  }
};

const getMyAppointments = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Unauthorized', 401);
    }

    const appointments = await Appointment.find({ userId: req.user.id }).sort({
      date: -1,
      createdAt: -1
    });

    return res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    return next(error);
  }
};

const getTodayAppointments = async (req, res, next) => {
  try {
    const cachedAppointments = await getCache(CACHE_KEYS.APPOINTMENTS_TODAY);
    if (cachedAppointments) {
      return res.status(200).json({
        success: true,
        data: cachedAppointments
      });
    }

    const { startOfDay, endOfDay } = getDateRange(new Date());

    const appointments = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate('userId', 'name email role')
      .sort({ timeSlot: 1, queueNumber: 1 });

    await setCache(CACHE_KEYS.APPOINTMENTS_TODAY, appointments, CACHE_TTL_SECONDS);

    return res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    return next(error);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['waiting', 'serving', 'completed'];

    if (!allowedStatuses.includes(status)) {
      throw new AppError('Invalid status value', 400);
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      throw new AppError('Appointment not found', 404);
    }

    await invalidateAppointmentCache();

    return res.status(200).json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getTodayAppointments,
  updateAppointmentStatus
};
