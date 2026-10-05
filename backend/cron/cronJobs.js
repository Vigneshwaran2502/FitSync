import cron from "node-cron";
import { Subscription } from "../models/Subscription.js";
import { Notification } from "../models/Notification.js";
import { QRSession } from "../models/QRSession.js";
function initializeCronJobs() {
  console.log("[Cron] Initializing FitSync background scheduled tasks...");
  cron.schedule("5 0 * * *", async () => {
    try {
      console.log("[Cron] Running daily subscription audit...");
      const now = /* @__PURE__ */ new Date();
      const threeDaysAhead = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1e3);
      const expiredSubs = await Subscription.find({
        status: "active",
        endDate: { $lt: now }
      });
      for (const sub of expiredSubs) {
        sub.status = "expired";
        await sub.save();
        await Notification.create({
          userId: sub.userId,
          title: "Membership Expired",
          message: "Your FitSync membership subscription has reached its end date. Please renew to keep full gym access.",
          type: "subscription",
          actionUrl: "/member/membership"
        });
      }
      const expiringSoonSubs = await Subscription.find({
        status: "active",
        endDate: { $gte: now, $lte: threeDaysAhead }
      });
      for (const sub of expiringSoonSubs) {
        const existingNotif = await Notification.findOne({
          userId: sub.userId,
          type: "subscription",
          title: "Membership Expiring Soon",
          createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1e3) }
        });
        if (!existingNotif) {
          await Notification.create({
            userId: sub.userId,
            title: "Membership Expiring Soon",
            message: `Your membership expires in less than 3 days (${sub.endDate.toLocaleDateString()}). Renew now to maintain uninterrupted access.`,
            type: "subscription",
            actionUrl: "/member/membership"
          });
        }
      }
      await QRSession.updateMany(
        { isActive: true, expiresAt: { $lt: now } },
        { isActive: false }
      );
      console.log(`[Cron] Audit complete. Expired ${expiredSubs.length} subscriptions. Warned ${expiringSoonSubs.length} members.`);
    } catch (err) {
      console.error("[Cron] Error running subscription cron task:", err.message);
    }
  });
  console.log("[Cron] Background jobs scheduled successfully.");
}
export {
  initializeCronJobs
};
