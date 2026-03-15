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

const validateBooking = [
  body('bed_id').isInt().withMessage('Valid bed ID required'),
  body('booking_start_date').isISO8601().withMessage('Valid start date required (YYYY-MM-DD)'),
  body('booking_end_date').isISO8601().withMessage('Valid end date required (YYYY-MM-DD)'),
  body('amenity_ids').optional().isArray().withMessage('Amenity IDs must be array')
];

router.use(authenticateToken);

router.post('/', checkRole('student'), validateBooking, handleValidationErrors, createBooking);
router.get('/', checkRole('student'), getUserBookings);
router.get('/:booking_id', checkRole('student'), getBookingById);
router.delete('/:booking_id', checkRole('student'), cancelBooking);

module.exports = router;