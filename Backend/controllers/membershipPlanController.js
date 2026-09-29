const MembershipPlan = require('../models/MembershipPlan');

// @desc    Create a new membership plan
// @route   POST /api/membership-plans
// @access  Private/Admin
const createPlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.create(req.body);
    res.status(201).json({ success: true, message: 'Membership plan created successfully', data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all membership plans
// @route   GET /api/membership-plans
// @access  Private/Admin/Trainer/Member
const getAllPlans = async (req, res) => {
  try {
    // Members should only see active plans
    const query = req.user.role === 'member' ? { isActive: true } : {};
    const plans = await MembershipPlan.find(query);
    res.status(200).json({ success: true, message: 'Plans fetched successfully', data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get one plan
// @route   GET /api/membership-plans/:id
// @access  Private
const getPlanById = async (req, res) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Membership plan not found' });
    }
    
    // Members should only see active plans
    if (req.user.role === 'member' && !plan.isActive) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this plan' });
    }

    res.status(200).json({ success: true, message: 'Plan fetched successfully', data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid plan ID' });
  }
};

// @desc    Update a plan
// @route   PUT /api/membership-plans/:id
// @access  Private/Admin
const updatePlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Membership plan not found' });
    }

    res.status(200).json({ success: true, message: 'Plan updated successfully', data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Deactivate a plan (Soft delete)
// @route   DELETE /api/membership-plans/:id
// @access  Private/Admin
const deactivatePlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Membership plan not found' });
    }

    plan.isActive = false;
    await plan.save();

    res.status(200).json({ success: true, message: 'Membership plan deactivated successfully', data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid plan ID' });
  }
};

module.exports = {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deactivatePlan
};
