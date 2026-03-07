const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { adminDashboard, getAllAppointments, updateStatus } = require('../controllers/adminController');

const { strictLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.get('/admin/dashboard', authMiddleware, roleMiddleware('admin'), strictLimiter, adminDashboard);
router.get('/admin/appointments', authMiddleware, roleMiddleware('admin'), strictLimiter, getAllAppointments);
router.patch('/admin/appointments/:id', authMiddleware, roleMiddleware('admin'), strictLimiter, updateStatus);

module.exports = router;
