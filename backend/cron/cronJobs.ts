import cron from 'node-cron';
import { Subscription } from '../models/Subscription.js';
import { Notification } from '../models/Notification.js';
import { QRSession } from '../models/QRSession.js';

export function initializeCronJobs() {
  console.log('[Cron] Initializing FitSync background scheduled tasks...');

  // Daily task at 00:05 to check expiring/expired subscriptions and alert users
  cron.schedule('5 0 * * *', async () => {
    try {
      console.log('[Cron] Running daily subscription audit...');
      const now = new Date();
      const threeDaysAhead = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      // 1. Mark expired subscriptions
      const expiredSubs = await Subscription.find({
        status: 'active',
        endDate: { $lt: now },
      });

      for (const sub of expiredSubs) {
        sub.status = 'expired';
        await sub.save();

        await Notification.create({
          userId: sub.userId,
          title: 'Membership Expired',
          message: 'Your FitSync membership subscription has reached its end date. Please renew to keep full gym access.',
          type: 'subscription',
          actionUrl: '/member/membership',
        });
      }

      // 2. Warn users expiring in 3 days
      const expiringSoonSubs = await Subscription.find({
        status: 'active',
        endDate: { $gte: now, $lte: threeDaysAhead },
      });

      for (const sub of expiringSoonSubs) {
        // Prevent duplicate spam if notification already exists within 24h
        const existingNotif = await Notification.findOne({
          userId: sub.userId,
          type: 'subscription',
          title: 'Membership Expiring Soon',
          createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        });

        if (!existingNotif) {
          await Notification.create({
            userId: sub.userId,
            title: 'Membership Expiring Soon',
            message: `Your membership expires in less than 3 days (${sub.endDate.toLocaleDateString()}). Renew now to maintain uninterrupted access.`,
            type: 'subscription',
            actionUrl: '/member/membership',
          });
        }
      }

      // 3. Deactivate expired QR sessions
      await QRSession.updateMany(
        { isActive: true, expiresAt: { $lt: now } },
        { isActive: false }
      );

      console.log(`[Cron] Audit complete. Expired ${expiredSubs.length} subscriptions. Warned ${expiringSoonSubs.length} members.`);
    } catch (err: any) {
      console.error('[Cron] Error running subscription cron task:', err.message);
    }
  });

  console.log('[Cron] Background jobs scheduled successfully.');
}
