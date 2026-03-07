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

const router = express.Router();

router.post('/appointments', authMiddleware, validateBookingInput, bookAppointment);
router.get('/appointments/my', authMiddleware, getMyAppointments);
router.get('/appointments/user', authMiddleware, getMyAppointments);
router.get('/appointments/today', authMiddleware, roleMiddleware('staff', 'admin'), getTodayAppointments);
router.put('/appointments/:id', authMiddleware, roleMiddleware('staff'), updateAppointmentStatus);

module.exports = router;
