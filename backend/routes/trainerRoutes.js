import { Router } from "express";
import {
  getTrainers,
  getTrainerById,
  updateTrainerProfile,
  getTrainerAvailability,
  setTrainerAvailability,
  getTrainerMembers
} from "../controllers/trainerController.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
const router = Router();
router.use(authenticateToken);
router.get("/", getTrainers);
router.get("/:id", getTrainerById);
router.get("/:id/availability", getTrainerAvailability);
router.put("/profile", authorizeRoles("trainer"), updateTrainerProfile);
router.put("/availability", authorizeRoles("trainer", "admin"), setTrainerAvailability);
router.get("/members/assigned", authorizeRoles("trainer", "admin"), getTrainerMembers);
var stdin_default = router;
export {
  stdin_default as default
};
