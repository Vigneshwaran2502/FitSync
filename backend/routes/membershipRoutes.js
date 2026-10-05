import { Router } from "express";
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
} from "../controllers/membershipController.js";
import { authenticateToken, optionalAuthenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
const router = Router();
router.get("/", optionalAuthenticateToken, getPlans);
router.get("/:id", optionalAuthenticateToken, getPlanById);
router.post("/", authenticateToken, authorizeRoles("admin"), createPlan);
router.put("/:id", authenticateToken, authorizeRoles("admin"), updatePlan);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deletePlan);
var stdin_default = router;
export {
  stdin_default as default
};
