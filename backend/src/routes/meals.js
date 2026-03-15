const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const {
  getAllMealPlans,
  subscribeMealPlan,
  getUserSubscriptions
} = require('../controllers/mealController');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validator');

const validateSubscription = [
  body('meal_plan_id').isInt().withMessage('Valid meal plan ID required'),
  body('start_date').isISO8601().withMessage('Valid start date required'),
  body('end_date').isISO8601().withMessage('Valid end date required')
];

router.get('/', getAllMealPlans);

router.post('/subscribe', authenticateToken, checkRole('student'), validateSubscription, handleValidationErrors, subscribeMealPlan);
router.get('/subscriptions', authenticateToken, checkRole('student'), getUserSubscriptions);

module.exports = router;