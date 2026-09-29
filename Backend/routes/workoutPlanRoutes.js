const express = require('express');
const router = express.Router();
const {
  createWorkoutPlan,
  getTrainerWorkoutPlans,
  getMemberWorkoutPlans,
  getWorkoutPlanById,
  updateWorkoutPlan,
  addExerciseToPlan,
  getPlanExercises,
  getPlanProgress
} = require('../controllers/workoutPlanController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(protect);

// Plans
router.post('/', roleMiddleware('trainer'), createWorkoutPlan);
router.get('/my', roleMiddleware('member'), getMemberWorkoutPlans);
router.get('/trainer/my', roleMiddleware('trainer'), getTrainerWorkoutPlans);
router.get('/:id', getWorkoutPlanById);
router.put('/:id', roleMiddleware('trainer', 'admin'), updateWorkoutPlan);
router.get('/:id/progress', getPlanProgress);

// Exercises in plans
router.post('/:id/exercises', roleMiddleware('trainer'), addExerciseToPlan);
router.get('/:id/exercises', getPlanExercises);

module.exports = router;
