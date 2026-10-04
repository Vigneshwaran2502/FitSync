import { Router } from 'express';
import {
  getFitnessProfile,
  updateFitnessProfile,
  getMeasurements,
  addMeasurement,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getProgressDashboard,
} from '../controllers/progressController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Fitness profile
router.get('/profile/:userId?', getFitnessProfile);
router.put('/profile', updateFitnessProfile);

// Measurements
router.get('/measurements', getMeasurements);
router.post('/measurements', addMeasurement);

// Goals
router.get('/goals', getGoals);
router.post('/goals', createGoal);
router.put('/goals/:id', updateGoal);
router.delete('/goals/:id', deleteGoal);

// Dashboard
router.get('/dashboard', getProgressDashboard);

export default router;
