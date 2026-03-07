const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateBookingInput } = require('../middleware/validationMiddleware');
const {
  bookAppointment,
  getMyAppointments,
  getTodayAppointments,
  updateAppointmentStatus
} = require('../controllers/appointmentController');

const { standardLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.post('/appointments', authMiddleware, standardLimiter, validateBookingInput, bookAppointment);
router.get('/appointments/my', authMiddleware, standardLimiter, getMyAppointments);
router.get('/appointments/user', authMiddleware, standardLimiter, getMyAppointments);
router.get('/appointments/today', authMiddleware, standardLimiter, roleMiddleware('staff', 'admin'), getTodayAppointments);
router.put('/appointments/:id', authMiddleware, standardLimiter, roleMiddleware('staff'), updateAppointmentStatus);

module.exports = router;
