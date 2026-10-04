import { Router } from 'express';
import {
  getWorkoutPlans,
  getWorkoutPlanById,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  getTodayWorkout,
  logWorkout,
  getWorkoutLogs,
} from '../controllers/workoutController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = Router();

router.use(authenticateToken);

// Plans
router.get('/plans', getWorkoutPlans);
router.get('/plans/:id', getWorkoutPlanById);
router.post('/plans', authorizeRoles('trainer', 'admin'), createWorkoutPlan);
router.put('/plans/:id', authorizeRoles('trainer', 'admin'), updateWorkoutPlan);
router.delete('/plans/:id', authorizeRoles('trainer', 'admin'), deleteWorkoutPlan);

// Member logs & today routine
router.get('/today', getTodayWorkout);
router.post('/logs', logWorkout);
router.get('/logs', getWorkoutLogs);

export default router;
