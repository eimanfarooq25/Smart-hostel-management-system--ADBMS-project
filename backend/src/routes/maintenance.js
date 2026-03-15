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

const validateMaintenanceRequest = [
  body('room_id').isInt().withMessage('Valid room ID required'),
  body('issue_description').trim().notEmpty().withMessage('Issue description required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
];

const validateStatus = [
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Valid status required')
];

router.use(authenticateToken);

router.post('/', checkRole('student', 'warden'), validateMaintenanceRequest, handleValidationErrors, createMaintenanceRequest);

router.get('/', getMaintenanceRequests);
router.get('/:request_id', getMaintenanceRequestById);

router.put('/:request_id/status', checkRole('warden', 'super_admin'), validateStatus, handleValidationErrors, updateMaintenanceStatus);

module.exports = router;