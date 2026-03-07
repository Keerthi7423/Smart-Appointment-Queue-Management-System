const Appointment = require('../models/Appointment');
const { getDateRange } = require('../services/queueService');
const { CACHE_KEYS, CACHE_TTL_SECONDS, getCache, setCache } = require('../services/cacheService');

const adminDashboard = async (req, res, next) => {
  try {
    const cachedDashboard = await getCache(CACHE_KEYS.ADMIN_DASHBOARD_TODAY);
    if (cachedDashboard) {
      return res.status(200).json({
        success: true,
        data: cachedDashboard
      });
    }

    const { startOfDay, endOfDay } = getDateRange(new Date());
    const filter = { date: { $gte: startOfDay, $lte: endOfDay } };

    const [totalAppointments, waiting, serving, completed] = await Promise.all([
      Appointment.countDocuments(filter),
      Appointment.countDocuments({ ...filter, status: 'waiting' }),
      Appointment.countDocuments({ ...filter, status: 'serving' }),
      Appointment.countDocuments({ ...filter, status: 'completed' })
    ]);

    const dashboardData = {
      totalAppointments,
      waiting,
      serving,
      completed
    };

    await setCache(CACHE_KEYS.ADMIN_DASHBOARD_TODAY, dashboardData, CACHE_TTL_SECONDS);

    return res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    return next(error);
  }
};

const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('userId', 'name email')
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    return next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate Status against allowed values
    const allowedStatuses = ['waiting', 'serving', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    // Validate Mongoose ObjectId to prevent NoSQL injection/errors
    if (!require('mongoose').Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID format' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    return res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { adminDashboard, getAllAppointments, updateStatus };
