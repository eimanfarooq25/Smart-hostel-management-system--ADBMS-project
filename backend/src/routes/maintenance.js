const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const {
  createMaintenanceRequest,
  getMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceStatus
} = require('../controllers/maintenanceController');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validator');

// Validation rules
const validateMaintenanceRequest = [
  body('room_id').isInt().withMessage('Valid room ID required'),
  body('issue_description').trim().notEmpty().withMessage('Issue description required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
];

const validateStatus = [
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Valid status required')
];

// All routes require authentication
router.use(authenticateToken);

// Create request (students can create)
router.post('/', checkRole('student', 'warden'), validateMaintenanceRequest, handleValidationErrors, createMaintenanceRequest);

// View requests (all authenticated users)
router.get('/', getMaintenanceRequests);
router.get('/:request_id', getMaintenanceRequestById);

// Update status (wardens only)
router.put('/:request_id/status', checkRole('warden', 'super_admin'), validateStatus, handleValidationErrors, updateMaintenanceStatus);

module.exports = router;