const cron = require('node-cron');
const Subscription = require('./models/Subscription');
const { notifySubscriptionExpiry } = require('./services/notificationService');

const startCronJobs = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running daily subscription expiry check...');
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const activeSubs = await Subscription.find({ status: 'active' });
      
      for (const sub of activeSubs) {
        if (!sub.currentEndDate) continue;
        
        const endDate = new Date(sub.currentEndDate);
        endDate.setHours(0,0,0,0);
        
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 7 || diffDays === 3 || diffDays === 1 || diffDays === 0) {
          await notifySubscriptionExpiry(sub.member, diffDays, sub._id);
        } else if (diffDays < 0) {
          // If expired, maybe we update status to 'expired' and notify
          sub.status = 'expired';
          await sub.save();
          await notifySubscriptionExpiry(sub.member, 0, sub._id);
        }
      }
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
};

module.exports = startCronJobs;
