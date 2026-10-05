import { Router } from "express";
import {
  getActiveQRSession,
  generateNewQRSession,
  checkIn,
  checkOut,
  getAttendanceHistory,
  getTodayPresent
} from "../controllers/attendanceController.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
const router = Router();
router.use(authenticateToken);
router.get("/qr/active", getActiveQRSession);
router.post("/qr/generate", authorizeRoles("admin"), generateNewQRSession);
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.get("/history", getAttendanceHistory);
router.get("/today", authorizeRoles("admin", "trainer"), getTodayPresent);
var stdin_default = router;
export {
  stdin_default as default
};
