const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'subscription_expiring', 'subscription_expired', 'subscription_frozen', 'subscription_renewed',
      'appointment_upcoming', 'appointment_cancelled', 'appointment_confirmed', 'appointment_rescheduled',
      'workout_assigned', 'workout_updated', 'workout_reminder',
      'attendance_reminder', 'attendance_recorded', 'attendance_rejected',
      'goal_achieved', 'progress_update', 'system'
    ]
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedEntityType: { type: String },
  relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  eventKey: { type: String } // For duplicate prevention
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ eventKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Notification', notificationSchema);
