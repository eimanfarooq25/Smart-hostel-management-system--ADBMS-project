const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const {
  registerGuest,
  getGuestRegistrations,
  getGuestRegistrationById,
  updateGuestStatus
} = require('../controllers/guestController');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validator');

// Validation rules
const validateGuestRegistration = [
  body('guest_name').trim().notEmpty().withMessage('Guest name required'),
  body('guest_phone').optional().matches(/^03[0-9]{9}$/).withMessage('Valid phone number required'),
  body('relationship').trim().notEmpty().withMessage('Relationship required'),
  body('check_in_date').isISO8601().withMessage('Valid check-in date required'),
  body('check_out_date').isISO8601().withMessage('Valid check-out date required')
];

const validateStatus = [
  body('status').isIn(['approved', 'rejected', 'checked_in', 'checked_out']).withMessage('Valid status required')
];

// All routes require authentication
router.use(authenticateToken);

// Student routes
router.post('/', checkRole('student'), validateGuestRegistration, handleValidationErrors, registerGuest);

// View registrations (students see own, wardens see all)
router.get('/', checkRole('student', 'warden', 'super_admin'), getGuestRegistrations);
router.get('/:guest_id', checkRole('student', 'warden', 'super_admin'), getGuestRegistrationById);

// Update status (wardens only)
router.put('/:guest_id/status', checkRole('warden', 'super_admin'), validateStatus, handleValidationErrors, updateGuestStatus);

module.exports = router;