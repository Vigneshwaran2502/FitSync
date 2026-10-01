const express = require('express');
const router = express.Router();
const {
  createTrainerAccount,
  createTrainerProfile,
  getTrainers,
  getTrainerById,
  updateTrainerProfile,
  deactivateTrainer,
  getTrainerSchedule
} = require('../controllers/trainerController');
const {
  createAvailability,
  getAvailability,
  updateAvailability,
  deleteAvailability
} = require('../controllers/trainerAvailabilityController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(protect);

// Trainers
router.post('/', roleMiddleware('admin'), createTrainerAccount);
router.post('/profile', roleMiddleware('trainer'), createTrainerProfile);
router.get('/my/members', roleMiddleware('trainer'), require('../controllers/trainerController').getMyAssignedMembers);
router.get('/', getTrainers);
router.put('/profile', roleMiddleware('trainer', 'admin'), updateTrainerProfile);

// Availability
router.post('/availability', roleMiddleware('trainer', 'admin'), createAvailability);
router.get('/:trainerId/availability', getAvailability);
router.put('/availability/:id', roleMiddleware('trainer', 'admin'), updateAvailability);
router.delete('/availability/:id', roleMiddleware('trainer', 'admin'), deleteAvailability);

// Trainer specific
router.get('/:trainerId/schedule', getTrainerSchedule);
router.get('/:id', getTrainerById);
router.delete('/:id', roleMiddleware('admin'), deactivateTrainer);

module.exports = router;
