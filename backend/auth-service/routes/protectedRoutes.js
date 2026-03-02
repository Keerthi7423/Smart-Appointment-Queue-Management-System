const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', authMiddleware, (req, res) => {
  return res.status(200).json({
    message: 'Profile fetched successfully',
    user: req.user
  });
});

module.exports = router;
