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

module.exports = { adminDashboard };
