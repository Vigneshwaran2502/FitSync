import { Router } from 'express';
import { chatWithGemini, getCoachRoles } from '../controllers/geminiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Allow authenticated users to chat with the AI Coach
router.use(authenticateToken);

router.post('/chat', chatWithGemini);
router.get('/roles', getCoachRoles);

export default router;
