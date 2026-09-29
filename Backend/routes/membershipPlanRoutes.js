const express = require('express');
const router = express.Router();
const {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deactivatePlan
} = require('../controllers/membershipPlanController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protect all routes
router.use(protect);

router.route('/')
  .post(roleMiddleware('admin'), createPlan)
  .get(getAllPlans);

router.route('/:id')
  .get(getPlanById)
  .put(roleMiddleware('admin'), updatePlan)
  .delete(roleMiddleware('admin'), deactivatePlan);

module.exports = router;
