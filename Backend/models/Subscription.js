const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  membershipPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipPlan',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  originalEndDate: {
    type: Date,
    required: true
  },
  currentEndDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'frozen', 'cancelled'],
    default: 'active'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  pricePaid: {
    type: Number,
    required: true
  },
  freezeRequested: {
    type: Boolean,
    default: false
  },
  freezeStatus: {
    type: String,
    enum: ['none', 'requested', 'approved', 'rejected'],
    default: 'none'
  },
  freezeStartDate: {
    type: Date
  },
  freezeEndDate: {
    type: Date
  },
  freezeReason: {
    type: String
  },
  totalFrozenDays: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;
