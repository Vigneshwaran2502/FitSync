const express = require('express');
const router = express.Router();
const {
  createSubscription,
  getSubscriptions,
  getMySubscription,
  getSubscriptionById,
  renewSubscription,
  requestFreeze,
  approveFreeze,
  rejectFreeze,
  getDashboard
} = require('../controllers/subscriptionController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protect all routes
router.use(protect);

// Dashboard (Must be before /:id to avoid matching 'dashboard' as an ID)
router.get('/dashboard', roleMiddleware('admin'), getDashboard);
router.get('/my', roleMiddleware('member'), getMySubscription);

router.route('/')
  .post(roleMiddleware('admin'), createSubscription)
  .get(roleMiddleware('admin', 'trainer'), getSubscriptions);

router.route('/:id')
  .get(getSubscriptionById);

router.post('/:id/renew', roleMiddleware('admin'), renewSubscription);
router.post('/:id/freeze-request', roleMiddleware('member'), requestFreeze);
router.put('/:id/freeze/approve', roleMiddleware('admin'), approveFreeze);
router.put('/:id/freeze/reject', roleMiddleware('admin'), rejectFreeze);

module.exports = router;
