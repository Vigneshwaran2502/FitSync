const express = require('express');
const router = express.Router();
const { getDashboardStats, getMembers } = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(protect);
router.use(roleMiddleware('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/members', getMembers);

module.exports = router;
