const express = require('express');
const router = express.Router();
const { logWorkout, getMyWorkoutLogs, getMemberWorkoutLogs } = require('../controllers/workoutLogController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', roleMiddleware('member'), logWorkout);
router.get('/my', roleMiddleware('member'), getMyWorkoutLogs);
router.get('/member/:memberId', roleMiddleware('trainer', 'admin'), getMemberWorkoutLogs);

module.exports = router;
