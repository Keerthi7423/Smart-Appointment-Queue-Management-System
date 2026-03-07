const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { adminDashboard, getAllAppointments, updateStatus } = require('../controllers/adminController');

const router = express.Router();

router.get('/admin/dashboard', authMiddleware, roleMiddleware('admin'), adminDashboard);
router.get('/admin/appointments', authMiddleware, roleMiddleware('admin'), getAllAppointments);
router.patch('/admin/appointments/:id', authMiddleware, roleMiddleware('admin'), updateStatus);

module.exports = router;
