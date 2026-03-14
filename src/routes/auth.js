const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateRegister,
  validateLogin, 
  handleValidationErrors 
} = require('../middleware/validator');

// POST /api/v1/auth/register
router.post(
  '/register', 
  validateRegister, 
  handleValidationErrors, 
  register
);

// POST /api/v1/auth/login
router.post(
  '/login', 
  validateLogin, 
  handleValidationErrors, 
  login
);

// GET /api/v1/auth/profile (Protected route)
router.get('/profile', authenticateToken, getProfile);

module.exports = router;