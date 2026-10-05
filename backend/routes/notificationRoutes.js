import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  broadcastAnnouncement
} from "../controllers/notificationController.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
const router = Router();
router.use(authenticateToken);
router.get("/", getNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);
router.post("/broadcast", authorizeRoles("admin"), broadcastAnnouncement);
var stdin_default = router;
export {
  stdin_default as default
};
