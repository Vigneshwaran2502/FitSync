const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  durationInDays: {
    type: Number,
    required: [true, 'Duration in days is required'],
    min: 1
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  features: {
    type: [String],
    default: []
  },
  maxTrainerSessions: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
module.exports = MembershipPlan;
