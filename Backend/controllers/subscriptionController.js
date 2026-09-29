const Subscription = require('../models/Subscription');
const MembershipPlan = require('../models/MembershipPlan');
const User = require('../models/User');

// Helper function to check and update expired subscriptions
const checkAndExpireSubscriptions = async () => {
  const currentDate = new Date();
  await Subscription.updateMany(
    { status: 'active', currentEndDate: { $lt: currentDate } },
    { $set: { status: 'expired' } }
  );
};

// @desc    Create a subscription
// @route   POST /api/subscriptions
// @access  Private/Admin
const createSubscription = async (req, res) => {
  try {
    const { memberId, membershipPlanId, startDate, paymentStatus } = req.body;

    if (!memberId || !membershipPlanId || !startDate) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Verify member exists and is a member
    const member = await User.findById(memberId);
    if (!member || member.role !== 'member') {
      return res.status(404).json({ success: false, message: 'Valid member not found' });
    }

    // Verify plan exists and is active
    const plan = await MembershipPlan.findById(membershipPlanId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: 'Active membership plan not found' });
    }

    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(start.getDate() + plan.durationInDays);

    const subscription = await Subscription.create({
      member: memberId,
      membershipPlan: membershipPlanId,
      startDate: start,
      originalEndDate: end,
      currentEndDate: end,
      status: 'active',
      paymentStatus: paymentStatus || 'paid',
      pricePaid: plan.price
    });

    res.status(201).json({ success: true, message: 'Subscription created successfully', data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Private/Admin/Trainer
const getSubscriptions = async (req, res) => {
  try {
    await checkAndExpireSubscriptions();
    
    // Trainers can only view active or relevant ones depending on logic. Let's just return all for now as requested.
    const subscriptions = await Subscription.find().populate('member', 'name email phone').populate('membershipPlan', 'name');
    res.status(200).json({ success: true, message: 'Subscriptions fetched successfully', data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get member's own subscription(s)
// @route   GET /api/subscriptions/my
// @access  Private/Member
const getMySubscription = async (req, res) => {
  try {
    await checkAndExpireSubscriptions();

    const subscriptions = await Subscription.find({ member: req.user.id })
      .populate('membershipPlan', 'name description durationInDays features')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, message: 'Subscriptions fetched successfully', data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get a single subscription by ID
// @route   GET /api/subscriptions/:id
// @access  Private
const getSubscriptionById = async (req, res) => {
  try {
    await checkAndExpireSubscriptions();

    const subscription = await Subscription.findById(req.params.id)
      .populate('member', 'name email phone')
      .populate('membershipPlan');

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Check authorization: member can only view their own
    if (req.user.role === 'member' && subscription.member._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot access another member\'s subscription' });
    }

    res.status(200).json({ success: true, message: 'Subscription fetched successfully', data: subscription });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid subscription ID' });
  }
};

// @desc    Renew subscription
// @route   POST /api/subscriptions/:id/renew
// @access  Private/Admin
const renewSubscription = async (req, res) => {
  try {
    const { membershipPlanId } = req.body;
    
    if (!membershipPlanId) {
        return res.status(400).json({ success: false, message: 'Please provide membership plan ID' });
    }

    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    const plan = await MembershipPlan.findById(membershipPlanId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: 'Active membership plan not found' });
    }

    await checkAndExpireSubscriptions();

    let newStartDate = new Date();
    // If the subscription is still active, extend from the currentEndDate
    if (subscription.status === 'active' && new Date(subscription.currentEndDate) > new Date()) {
        newStartDate = new Date(subscription.currentEndDate);
    }
    
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newStartDate.getDate() + plan.durationInDays);

    const renewedSub = await Subscription.create({
        member: subscription.member,
        membershipPlan: plan._id,
        startDate: newStartDate,
        originalEndDate: newEndDate,
        currentEndDate: newEndDate,
        status: 'active',
        paymentStatus: 'paid',
        pricePaid: plan.price
    });

    res.status(201).json({ success: true, message: 'Subscription renewed successfully', data: renewedSub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request a subscription freeze
// @route   POST /api/subscriptions/:id/freeze-request
// @access  Private/Member
const requestFreeze = async (req, res) => {
  try {
    const { freezeStartDate, freezeEndDate, reason } = req.body;
    
    if (!freezeStartDate || !freezeEndDate || !reason) {
        return res.status(400).json({ success: false, message: 'Please provide freeze dates and reason' });
    }

    await checkAndExpireSubscriptions();

    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Validation
    if (subscription.member.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (subscription.status !== 'active') {
        return res.status(400).json({ success: false, message: 'Only active subscriptions can be frozen' });
    }

    if (subscription.freezeRequested && subscription.freezeStatus === 'requested') {
        return res.status(400).json({ success: false, message: 'A freeze request is already pending' });
    }

    const start = new Date(freezeStartDate);
    const end = new Date(freezeEndDate);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (start < today) {
        return res.status(400).json({ success: false, message: 'Freeze start date cannot be in the past' });
    }
    if (end <= start) {
        return res.status(400).json({ success: false, message: 'Freeze end date must be after start date' });
    }
    if (start > subscription.currentEndDate) {
        return res.status(400).json({ success: false, message: 'Freeze start date cannot be after subscription expiry' });
    }

    subscription.freezeRequested = true;
    subscription.freezeStatus = 'requested';
    subscription.freezeStartDate = start;
    subscription.freezeEndDate = end;
    subscription.freezeReason = reason;

    await subscription.save();

    res.status(200).json({ success: true, message: 'Freeze request submitted successfully', data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve a subscription freeze
// @route   PUT /api/subscriptions/:id/freeze/approve
// @access  Private/Admin
const approveFreeze = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.freezeStatus !== 'requested') {
        return res.status(400).json({ success: false, message: 'No pending freeze request found' });
    }

    const start = new Date(subscription.freezeStartDate);
    const end = new Date(subscription.freezeEndDate);
    const frozenDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    subscription.totalFrozenDays += frozenDays;
    
    // Extend currentEndDate
    const currentEnd = new Date(subscription.currentEndDate);
    currentEnd.setDate(currentEnd.getDate() + frozenDays);
    subscription.currentEndDate = currentEnd;

    subscription.freezeStatus = 'approved';
    subscription.status = 'frozen'; // Based on requirements, though normally it's frozen *during* the period. Let's just set it to frozen now.
    
    await subscription.save();

    res.status(200).json({ success: true, message: 'Freeze request approved successfully', data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a subscription freeze
// @route   PUT /api/subscriptions/:id/freeze/reject
// @access  Private/Admin
const rejectFreeze = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.freezeStatus !== 'requested') {
        return res.status(400).json({ success: false, message: 'No pending freeze request found' });
    }

    subscription.freezeStatus = 'rejected';
    subscription.freezeRequested = false;
    
    await subscription.save();

    res.status(200).json({ success: true, message: 'Freeze request rejected successfully', data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get subscription dashboard data
// @route   GET /api/subscriptions/dashboard
// @access  Private/Admin
const getDashboard = async (req, res) => {
  try {
    await checkAndExpireSubscriptions();

    const total = await Subscription.countDocuments();
    const active = await Subscription.countDocuments({ status: 'active' });
    const expired = await Subscription.countDocuments({ status: 'expired' });
    const frozen = await Subscription.countDocuments({ status: 'frozen' });
    const pendingFreeze = await Subscription.countDocuments({ freezeStatus: 'requested' });

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const expiringSoon = await Subscription.countDocuments({
      status: 'active',
      currentEndDate: { $lte: nextWeek }
    });

    const revenueResult = await Subscription.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$pricePaid' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      message: 'Dashboard data fetched successfully',
      data: {
        totalSubscriptions: total,
        activeSubscriptions: active,
        expiredSubscriptions: expired,
        frozenSubscriptions: frozen,
        pendingFreezeRequests: pendingFreeze,
        subscriptionsExpiringSoon: expiringSoon,
        totalSubscriptionRevenue: totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createSubscription,
  getSubscriptions,
  getMySubscription,
  getSubscriptionById,
  renewSubscription,
  requestFreeze,
  approveFreeze,
  rejectFreeze,
  getDashboard
};
