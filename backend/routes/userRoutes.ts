import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignTrainer,
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = Router();

router.use(authenticateToken);

// Admin-only user management
router.get('/', authorizeRoles('admin'), getUsers);
router.get('/:id', authorizeRoles('admin', 'trainer'), getUserById);
router.post('/', authorizeRoles('admin'), createUser);
router.put('/:id', authorizeRoles('admin'), updateUser);
router.put('/:id/assign-trainer', authorizeRoles('admin'), assignTrainer);
router.delete('/:id', authorizeRoles('admin'), deleteUser);

export default router;
