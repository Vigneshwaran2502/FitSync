import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Subscription } from '../models/Subscription.js';
import { MembershipPlan } from '../models/MembershipPlan.js';
import { Notification } from '../models/Notification.js';

export async function getSubscriptions(req: AuthRequest, res: Response) {
  try {
    const { status, search } = req.query;
    const query: any = {};
    if (status) query.status = status;

    const subscriptions = await Subscription.find(query)
      .populate('userId', 'name email phone')
      .populate('planId', 'name price durationMonths tier')
      .sort({ createdAt: -1 });

    // Client-side search match by user name or email if search string provided
    let filtered = subscriptions;
    if (search) {
      const q = String(search).toLowerCase();
      filtered = subscriptions.filter((sub: any) => {
        const u = sub.userId;
        return u && (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
      });
    }

    res.json({ subscriptions: filtered });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching subscriptions.' });
  }
}

export async function getMySubscription(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    // Get current active subscription if exists
    const activeSubscription = await Subscription.findOne({
      userId: req.user._id,
      status: { $in: ['active', 'frozen'] },
    }).populate('planId');

    // Get all past subscriptions
    const history = await Subscription.find({
      userId: req.user._id,
    })
      .populate('planId')
      .sort({ createdAt: -1 });

    res.json({
      subscription: activeSubscription,
      history,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching your subscription.' });
  }
}

export async function createSubscription(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const { userId, planId, startDate } = req.body;
    // If not admin, the target user must be the requester
    const targetUserId = req.user.role === 'admin' ? (userId || req.user._id) : req.user._id;

    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Selected membership plan not found.' });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start.getTime());
    end.setMonth(end.getMonth() + plan.durationMonths);

    // Cancel or expire any previous active subscriptions for this user
    await Subscription.updateMany(
      { userId: targetUserId, status: 'active' },
      { status: 'expired' }
    );

    const subscription = await Subscription.create({
      userId: targetUserId,
      planId: plan._id,
      startDate: start,
      endDate: end,
      status: 'active',
      paymentStatus: 'paid',
      paymentAmount: plan.price,
      paymentDate: new Date(),
    });

    await Notification.create({
      userId: targetUserId,
      title: 'Subscription Activated',
      message: `Your '${plan.name}' subscription is active until ${end.toLocaleDateString()}. Enjoy your workouts!`,
      type: 'subscription',
      actionUrl: '/member/membership',
    });

    res.status(201).json({ message: 'Subscription successfully created.', subscription });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error creating subscription.' });
  }
}

export async function requestFreeze(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { reason, freezeStartDate, freezeEndDate } = req.body;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    if (req.user?.role === 'member' && subscription.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    subscription.freezeRequested = true;
    subscription.freezeReason = reason || 'Medical / Travel pause';
    if (freezeStartDate) subscription.freezeStartDate = new Date(freezeStartDate);
    if (freezeEndDate) subscription.freezeEndDate = new Date(freezeEndDate);

    // If admin is doing it directly, set status to frozen right away
    if (req.user?.role === 'admin') {
      subscription.status = 'frozen';
    }

    await subscription.save();

    res.json({ message: 'Freeze request processed.', subscription });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error requesting freeze.' });
  }
}

export async function handleFreezeDecision(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    if (action === 'approve') {
      subscription.status = 'frozen';
      subscription.freezeRequested = false;
      await Notification.create({
        userId: subscription.userId,
        title: 'Membership Freeze Approved',
        message: 'Your request to freeze your gym membership has been approved.',
        type: 'subscription',
        actionUrl: '/member/membership',
      });
    } else {
      subscription.freezeRequested = false;
      await Notification.create({
        userId: subscription.userId,
        title: 'Membership Freeze Rejected',
        message: 'Your request to freeze your gym membership was not approved. Please speak with gym administration.',
        type: 'subscription',
        actionUrl: '/member/membership',
      });
    }

    await subscription.save();
    res.json({ message: `Freeze ${action}d successfully.`, subscription });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error processing freeze decision.' });
  }
}

export async function unfreezeSubscription(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    subscription.status = 'active';
    subscription.freezeRequested = false;
    await subscription.save();

    res.json({ message: 'Subscription unfrozen and returned to active state.', subscription });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error unfreezing subscription.' });
  }
}

export async function renewSubscription(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findById(id).populate('planId');
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    const plan: any = subscription.planId;
    const currentEnd = new Date(subscription.endDate);
    const newStart = currentEnd > new Date() ? currentEnd : new Date();
    const newEnd = new Date(newStart.getTime());
    newEnd.setMonth(newEnd.getMonth() + (plan?.durationMonths || 1));

    subscription.startDate = newStart;
    subscription.endDate = newEnd;
    subscription.status = 'active';
    subscription.paymentStatus = 'paid';
    await subscription.save();

    await Notification.create({
      userId: subscription.userId,
      title: 'Subscription Renewed',
      message: `Your membership has been extended to ${newEnd.toLocaleDateString()}.`,
      type: 'subscription',
      actionUrl: '/member/membership',
    });

    res.json({ message: 'Subscription renewed successfully.', subscription });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error renewing subscription.' });
  }
}
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Subscription } from '../models/Subscription.js';
import { MembershipPlan } from '../models/MembershipPlan.js';
import { Notification } from '../models/Notification.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

export async function createRazorpayOrder(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });
    
    const { planId } = req.body;
    const plan = await MembershipPlan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({ message: 'Selected membership plan not found.' });
    }

    const options = {
      amount: plan.price * 100, // Razorpay works in paise
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    let order;
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_dummy') {
      order = await razorpay.orders.create(options);
      if (!order) return res.status(500).send("Some error occured");
    } else {
      // Dummy Simulated Order
      order = {
        id: "order_dummy_" + Date.now(),
        amount: options.amount,
        currency: options.currency,
        isDummy: true
      };
    }
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function verifyRazorpayPayment(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        planId
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
        .update(sign.toString())
        .digest("hex");

    if (razorpay_signature !== 'dummy_signature_success' && razorpay_signature !== expectedSign) {
        return res.status(400).json({ message: "Invalid signature sent!" });
    }

    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Selected membership plan not found.' });
    }

    const start = new Date();
    const end = new Date(start.getTime());
    end.setMonth(end.getMonth() + plan.durationMonths);

    await Subscription.updateMany(
      { userId: req.user._id, status: 'active' },
      { status: 'expired' }
    );

    const subscription = await Subscription.create({
      userId: req.user._id,
      planId: plan._id,
      startDate: start,
      endDate: end,
      status: 'active',
      paymentStatus: 'paid',
      paymentAmount: plan.price,
    });

    await Notification.create({
      userId: req.user._id,
      title: 'Subscription Activated',
      message: `You have successfully subscribed to the ${plan.name} plan.`,
      type: 'system'
    });

    res.status(200).json({ message: "Payment verified successfully", subscription });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
}



