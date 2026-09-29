const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async (data) => {
  try {
    if (data.eventKey) {
      const existing = await Notification.findOne({ eventKey: data.eventKey });
      if (existing) return existing;
    }
    return await Notification.create(data);
  } catch (error) {
    if (error.code === 11000) return null; // Duplicate key
    console.error('Error creating notification:', error);
    return null;
  }
};

const notifySubscriptionExpiry = async (memberId, daysRemaining, subscriptionId) => {
  const eventKey = `subscriptionExpiry:${subscriptionId}:${daysRemaining}days`;
  let title = 'Subscription Expiring Soon';
  let message = `Your membership expires in ${daysRemaining} days.`;
  let type = 'subscription_expiring';
  let priority = 'normal';

  if (daysRemaining === 0) {
    title = 'Subscription Expired';
    message = 'Your membership has expired today.';
    type = 'subscription_expired';
    priority = 'high';
    eventKey = `subscriptionExpired:${subscriptionId}`;
  } else if (daysRemaining === 1) {
    priority = 'high';
  }

  return await createNotification({
    recipientId: memberId,
    type,
    title,
    message,
    relatedEntityType: 'Subscription',
    relatedEntityId: subscriptionId,
    priority,
    eventKey
  });
};

const notifyWorkoutAssignment = async (memberId, workoutPlanId) => {
  return await createNotification({
    recipientId: memberId,
    type: 'workout_assigned',
    title: 'New Workout Plan',
    message: 'A new workout plan has been assigned to you.',
    relatedEntityType: 'WorkoutPlan',
    relatedEntityId: workoutPlanId,
    priority: 'normal',
    eventKey: `workout_assigned:${workoutPlanId}`
  });
};

const notifyGoalAchieved = async (memberId, goalId, goalTitle) => {
  return await createNotification({
    recipientId: memberId,
    type: 'goal_achieved',
    title: 'Goal Achieved! 🎉',
    message: `Congratulations! You achieved your fitness goal: ${goalTitle}.`,
    relatedEntityType: 'FitnessGoal',
    relatedEntityId: goalId,
    priority: 'high',
    eventKey: `goal_achieved:${goalId}`
  });
};

const notifyAttendanceRecorded = async (memberId, attendanceId, time) => {
  const dateStr = new Date().toISOString().split('T')[0];
  return await createNotification({
    recipientId: memberId,
    type: 'attendance_recorded',
    title: 'Attendance Recorded',
    message: `Your attendance was successfully recorded at ${time}.`,
    relatedEntityType: 'Attendance',
    relatedEntityId: attendanceId,
    priority: 'low',
    eventKey: `attendance_recorded:${memberId}:${dateStr}`
  });
};

const notifySystemAlert = async (title, message, priority, target) => {
  try {
    let filter = {};
    if (target === 'members') filter.role = 'member';
    if (target === 'trainers') filter.role = 'trainer';

    const users = await User.find(filter).select('_id');
    const notifications = users.map(u => ({
      recipientId: u._id,
      type: 'system',
      title,
      message,
      priority,
      eventKey: `system:${Date.now()}:${u._id}`
    }));

    await Notification.insertMany(notifications, { ordered: false });
  } catch (error) {
    console.error('Error creating system notifications:', error);
  }
};

module.exports = {
  createNotification,
  notifySubscriptionExpiry,
  notifyWorkoutAssignment,
  notifyGoalAchieved,
  notifyAttendanceRecorded,
  notifySystemAlert
};
