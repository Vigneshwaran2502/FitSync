const express = require('express');
const router = express.Router();
const { updatePlanExercise, removePlanExercise } = require('../controllers/workoutPlanController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(protect);

router.put('/:id', roleMiddleware('trainer'), updatePlanExercise);
router.delete('/:id', roleMiddleware('trainer'), removePlanExercise);

module.exports = router;
