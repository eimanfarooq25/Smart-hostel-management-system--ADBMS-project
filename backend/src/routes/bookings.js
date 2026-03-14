const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { 
  createBooking, 
  getUserBookings,
  getBookingById,
  cancelBooking 
} = require('../controllers/bookingController');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validator');

// Validation rules
const validateBooking = [
  body('bed_id').isInt().withMessage('Valid bed ID required'),
  body('booking_start_date').isISO8601().withMessage('Valid start date required (YYYY-MM-DD)'),
  body('booking_end_date').isISO8601().withMessage('Valid end date required (YYYY-MM-DD)'),
  body('amenity_ids').optional().isArray().withMessage('Amenity IDs must be array')
];

// All booking routes require authentication
router.use(authenticateToken);

// Students can create and view their own bookings
router.post('/', checkRole('student'), validateBooking, handleValidationErrors, createBooking);
router.get('/', checkRole('student'), getUserBookings);
router.get('/:booking_id', checkRole('student'), getBookingById);
router.delete('/:booking_id', checkRole('student'), cancelBooking);

module.exports = router;