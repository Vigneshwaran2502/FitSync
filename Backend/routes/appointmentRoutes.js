const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getTrainerAppointments,
  getAllAppointments,
  getAppointmentById,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  noShowAppointment
} = require('../controllers/appointmentController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/my', roleMiddleware('member'), getMyAppointments);
router.get('/trainer/my', roleMiddleware('trainer'), getTrainerAppointments);
router.get('/', roleMiddleware('admin'), getAllAppointments);

router.post('/', roleMiddleware('member'), createAppointment);

router.get('/:id', getAppointmentById);
router.put('/:id/confirm', roleMiddleware('trainer', 'admin'), confirmAppointment);
router.put('/:id/cancel', cancelAppointment); // Roles managed inside controller
router.put('/:id/complete', roleMiddleware('trainer', 'admin'), completeAppointment);
router.put('/:id/no-show', roleMiddleware('trainer', 'admin'), noShowAppointment);

module.exports = router;
