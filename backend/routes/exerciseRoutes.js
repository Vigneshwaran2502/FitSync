import { Router } from "express";
import {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise
} from "../controllers/exerciseController.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
const router = Router();
router.use(authenticateToken);
router.get("/", getExercises);
router.get("/:id", getExerciseById);
router.post("/", authorizeRoles("trainer", "admin"), createExercise);
router.put("/:id", authorizeRoles("trainer", "admin"), updateExercise);
router.delete("/:id", authorizeRoles("trainer", "admin"), deleteExercise);
var stdin_default = router;
export {
  stdin_default as default
};
