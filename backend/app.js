import express from "express";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
function createExpressApp() {
  const app = express();
  app.use((req, res, next) => {
    const originHeader = req.headers.origin;
    const forwardedHost = req.headers["x-forwarded-host"];
    const proto = req.headers["x-forwarded-proto"] || "https";
    const computedHostOrigin = forwardedHost ? `${proto}://${forwardedHost}` : req.headers.host ? `https://${req.headers.host}` : void 0;
    const origin = process.env.FRONTEND_URL || originHeader || computedHostOrigin || "https://aistudio.google.com";
    // For local dev, allow the specific origin that called us. In prod, lock this down via FRONTEND_URL.
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    const requestedHeaders = req.headers["access-control-request-headers"];
    if (requestedHeaders) {
      res.setHeader("Access-Control-Allow-Headers", requestedHeaders);
    } else {
      res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, *");
    }
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Max-Age", "86400");
      return res.sendStatus(204);
    }
    next();
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "FitSync Full-Stack API",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/memberships", membershipRoutes);
  app.use("/api/membership-plans", membershipRoutes);
  app.use("/api/subscriptions", subscriptionRoutes);
  app.use("/api/trainers", trainerRoutes);
  app.use("/api/appointments", appointmentRoutes);
  app.use("/api/workouts", workoutRoutes);
  app.use("/api/exercises", exerciseRoutes);
  app.use("/api/attendance", attendanceRoutes);
  app.use("/api/progress", progressRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/gemini", geminiRoutes);
  app.use("/api/*", (req, res) => {
    res.status(404).json({ message: `API endpoint '${req.originalUrl}' not found.` });
  });
  app.use((err, req, res, next) => {
    console.error("[API Error]:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "An unexpected internal server error occurred.";
    res.status(statusCode).json({
      error: true,
      message
    });
  });
  return app;
}
export {
  createExpressApp
};
