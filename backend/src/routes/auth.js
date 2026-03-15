const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateRegister,
  validateLogin, 
  handleValidationErrors 
} = require('../middleware/validator');

router.post(
  '/register', 
  validateRegister, 
  handleValidationErrors, 
  register
);

router.post(
  '/login', 
  validateLogin, 
  handleValidationErrors, 
  login
);

router.get('/profile', authenticateToken, getProfile);

module.exports = router;