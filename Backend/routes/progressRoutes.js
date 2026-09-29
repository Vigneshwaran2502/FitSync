const express = require('express');
const router = express.Router();
const {
  createOrUpdateProfile,
  getProfile,
  addMeasurement,
  getLatestMeasurement,
  getWeightHistory,
  getMeasurementHistory,
  createGoal,
  getGoals,
  updateGoal,
  getDashboard,
  getTrainerMemberProgress,
  getAdminMemberProgress
} = require('../controllers/progressController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(protect);

// Profile
router.post('/profile', roleMiddleware('member'), createOrUpdateProfile);
router.put('/profile', roleMiddleware('member'), createOrUpdateProfile);
router.get('/profile', roleMiddleware('member'), getProfile);

// Measurements
router.post('/measurements', addMeasurement); // Roles checked in controller
router.get('/measurements', roleMiddleware('member'), getMeasurementHistory);
router.get('/latest', roleMiddleware('member'), getLatestMeasurement);
router.get('/weight-history', roleMiddleware('member'), getWeightHistory);

// Goals
router.post('/goals', roleMiddleware('member'), createGoal);
router.get('/goals', roleMiddleware('member'), getGoals);
router.put('/goals/:id', roleMiddleware('member'), updateGoal);

// Dashboard
router.get('/dashboard', roleMiddleware('member'), getDashboard);

// Trainer & Admin Views
router.get('/member/:memberId', roleMiddleware('trainer'), getTrainerMemberProgress);
router.get('/admin/member/:memberId', roleMiddleware('admin'), getAdminMemberProgress);

module.exports = router;
