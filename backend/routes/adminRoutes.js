const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { adminDashboard } = require('../controllers/adminController');

const { standardLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.get('/admin/dashboard', authMiddleware, roleMiddleware('admin'), standardLimiter, adminDashboard);

module.exports = router;
