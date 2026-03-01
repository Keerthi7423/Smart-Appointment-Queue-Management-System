const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { adminDashboard } = require('../controllers/adminController');

const router = express.Router();

router.get('/admin/dashboard', authMiddleware, roleMiddleware('admin'), adminDashboard);

module.exports = router;
