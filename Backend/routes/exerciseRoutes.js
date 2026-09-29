const express = require('express');
const router = express.Router();
const {
  createExercise,
  getExercises,
  getExerciseById,
  updateExercise,
  deleteExercise
} = require('../controllers/exerciseController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', roleMiddleware('admin', 'trainer'), createExercise);
router.get('/', getExercises);
router.get('/:id', getExerciseById);
router.put('/:id', roleMiddleware('admin', 'trainer'), updateExercise);
router.delete('/:id', roleMiddleware('admin', 'trainer'), deleteExercise);

module.exports = router;
