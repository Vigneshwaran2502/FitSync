import { Router } from 'express';
import {
  getTrainers,
  getTrainerById,
  updateTrainerProfile,
  getTrainerAvailability,
  setTrainerAvailability,
  getTrainerMembers,
} from '../controllers/trainerController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = Router();

router.use(authenticateToken);

// Public to authenticated users (e.g. members booking or viewing)
router.get('/', getTrainers);
router.get('/:id', getTrainerById);
router.get('/:id/availability', getTrainerAvailability);

// Trainer routes
router.put('/profile', authorizeRoles('trainer'), updateTrainerProfile);
router.put('/availability', authorizeRoles('trainer', 'admin'), setTrainerAvailability);
router.get('/members/assigned', authorizeRoles('trainer', 'admin'), getTrainerMembers);

export default router;
