const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const {
  submitComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus
} = require('../controllers/complaintController');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validator');

// Validation rules
const validateComplaint = [
  body('hostel_id').isInt().withMessage('Valid hostel ID required'),
  body('category').isIn(['cleanliness', 'noise', 'staff', 'maintenance', 'food', 'security', 'other']).withMessage('Valid category required'),
  body('subject').trim().notEmpty().withMessage('Subject required'),
  body('description').trim().notEmpty().withMessage('Description required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
];

const validateStatus = [
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Valid status required')
];

// All routes require authentication
router.use(authenticateToken);

// Student routes
router.post('/', checkRole('student'), validateComplaint, handleValidationErrors, submitComplaint);

// Students and wardens can view complaints
router.get('/', checkRole('student', 'warden', 'super_admin'), getComplaints);
router.get('/:complaint_id', checkRole('student', 'warden', 'super_admin'), getComplaintById);

// Only wardens can update status
router.put('/:complaint_id/status', checkRole('warden', 'super_admin'), validateStatus, handleValidationErrors, updateComplaintStatus);

module.exports = router;