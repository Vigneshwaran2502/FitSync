import { Router } from "express";
import {
  getAdminDashboardStats,
  getTrainerDashboardStats,
  getAdminReports
} from "../controllers/reportController.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
const router = Router();
router.use(authenticateToken);
router.get("/admin/stats", authorizeRoles("admin"), getAdminDashboardStats);
router.get("/trainer/stats", authorizeRoles("trainer", "admin"), getTrainerDashboardStats);
router.get("/admin/data", authorizeRoles("admin"), getAdminReports);
var stdin_default = router;
export {
  stdin_default as default
};
