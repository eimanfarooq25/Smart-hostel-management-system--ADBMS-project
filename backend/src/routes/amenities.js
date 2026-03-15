const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const {
  getAllAmenities,
  getAmenityById,
  createAmenity,
  updateAmenity,
  deleteAmenity
} = require('../controllers/amenityController');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validator');

// Validation rules
const validateAmenity = [
  body('amenity_name').trim().notEmpty().withMessage('Amenity name required'),
  body('base_price_monthly').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('category').isIn(['comfort', 'utility', 'service', 'entertainment']).withMessage('Valid category required')
];

// Public routes
router.get('/', getAllAmenities);
router.get('/:amenity_id', getAmenityById);

// Protected routes (owner/admin only)
router.post('/', authenticateToken, checkRole('hostel_owner', 'super_admin'), validateAmenity, handleValidationErrors, createAmenity);
router.put('/:amenity_id', authenticateToken, checkRole('hostel_owner', 'super_admin'), validateAmenity, handleValidationErrors, updateAmenity);
router.delete('/:amenity_id', authenticateToken, checkRole('super_admin'), deleteAmenity);

module.exports = router;