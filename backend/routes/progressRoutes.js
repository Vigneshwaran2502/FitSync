import { Router } from "express";
import {
  getFitnessProfile,
  updateFitnessProfile,
  getMeasurements,
  addMeasurement,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getProgressDashboard
} from "../controllers/progressController.js";
import { authenticateToken } from "../middleware/auth.js";
const router = Router();
router.use(authenticateToken);
router.get("/profile/:userId?", getFitnessProfile);
router.put("/profile", updateFitnessProfile);
router.get("/measurements", getMeasurements);
router.post("/measurements", addMeasurement);
router.get("/goals", getGoals);
router.post("/goals", createGoal);
router.put("/goals/:id", updateGoal);
router.delete("/goals/:id", deleteGoal);
router.get("/dashboard", getProgressDashboard);
var stdin_default = router;
export {
  stdin_default as default
};
