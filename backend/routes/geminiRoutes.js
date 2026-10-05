import { Router } from "express";
import { chatWithGemini, getCoachRoles } from "../controllers/geminiController.js";
import { authenticateToken } from "../middleware/auth.js";
const router = Router();
router.use(authenticateToken);
router.post("/chat", chatWithGemini);
router.get("/roles", getCoachRoles);
var stdin_default = router;
export {
  stdin_default as default
};
