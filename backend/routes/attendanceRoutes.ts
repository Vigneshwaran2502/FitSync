import { Router } from 'express';
import {
  getActiveQRSession,
  generateNewQRSession,
  checkIn,
  checkOut,
  getAttendanceHistory,
  getTodayPresent,
} from '../controllers/attendanceController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = Router();

router.use(authenticateToken);

// QR Sessions
router.get('/qr/active', getActiveQRSession);
router.post('/qr/generate', authorizeRoles('admin'), generateNewQRSession);

// Check-in / Check-out
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);

// History & monitoring
router.get('/history', getAttendanceHistory);
router.get('/today', authorizeRoles('admin', 'trainer'), getTodayPresent);

export default router;
