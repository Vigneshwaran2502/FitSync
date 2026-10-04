import { Router } from 'express';
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/membershipController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = Router();

// Everyone can view plans (public can view active plans, admin views all)
router.get('/', optionalAuthenticateToken, getPlans);
router.get('/:id', optionalAuthenticateToken, getPlanById);

// Admin-only management
router.post('/', authenticateToken, authorizeRoles('admin'), createPlan);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updatePlan);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deletePlan);

export default router;
