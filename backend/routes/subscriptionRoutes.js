import { Router } from "express";
import {
  getSubscriptions,
  getMySubscription,
  createSubscription,
  requestFreeze,
  handleFreezeDecision,
  unfreezeSubscription,
  renewSubscription,
  createRazorpayOrder,
  verifyRazorpayPayment
} from "../controllers/subscriptionController.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
const router = Router();
router.use(authenticateToken);
router.get("/my", getMySubscription);
router.post("/freeze/:id", requestFreeze);
router.post("/", createSubscription);
router.post("/razorpay/order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);
router.get("/", authorizeRoles("admin"), getSubscriptions);
router.post("/freeze/:id/decision", authorizeRoles("admin"), handleFreezeDecision);
router.post("/unfreeze/:id", authorizeRoles("admin"), unfreezeSubscription);
router.post("/renew/:id", authorizeRoles("admin"), renewSubscription);
var stdin_default = router;
export {
  stdin_default as default
};
