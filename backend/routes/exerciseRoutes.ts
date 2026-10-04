import { Router } from 'express';
import {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} from '../controllers/exerciseController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = Router();

router.use(authenticateToken);

// All logged in users can view exercises
router.get('/', getExercises);
router.get('/:id', getExerciseById);

// Trainer and Admin can manage exercises
router.post('/', authorizeRoles('trainer', 'admin'), createExercise);
router.put('/:id', authorizeRoles('trainer', 'admin'), updateExercise);
router.delete('/:id', authorizeRoles('trainer', 'admin'), deleteExercise);

export default router;
