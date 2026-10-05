import { Router } from "express";
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment
} from "../controllers/appointmentController.js";
import { authenticateToken } from "../middleware/auth.js";
const router = Router();
router.use(authenticateToken);
router.get("/", getAppointments);
router.post("/", createAppointment);
router.put("/:id/status", updateAppointmentStatus);
router.delete("/:id", cancelAppointment);
var stdin_default = router;
export {
  stdin_default as default
};
