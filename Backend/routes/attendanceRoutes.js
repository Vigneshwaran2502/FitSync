const express = require('express');
const router = express.Router();
const {
  generateQRSession,
  checkIn,
  checkOut,
  getMyAttendance,
  getMyAttendanceSummary,
  getAllAttendance,
  getTrainerMembersAttendance,
  manualAttendance
} = require('../controllers/attendanceController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(protect);

// QR specific
router.post('/qr/generate', roleMiddleware('admin'), generateQRSession);

// Check-in / Check-out
router.post('/check-in', roleMiddleware('member'), checkIn);
router.post('/check-out', roleMiddleware('member'), checkOut);

// Member views
router.get('/my', roleMiddleware('member'), getMyAttendance);
router.get('/my/summary', roleMiddleware('member'), getMyAttendanceSummary);

// Admin view and manual
router.get('/', roleMiddleware('admin'), getAllAttendance);
router.post('/manual', roleMiddleware('admin'), manualAttendance);

// Trainer view
router.get('/trainer/members', roleMiddleware('trainer'), getTrainerMembersAttendance);

module.exports = router;
