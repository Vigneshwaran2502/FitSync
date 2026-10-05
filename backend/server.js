import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { initializeCronJobs } from "./cron/cronJobs.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function startServer() {
  const portArgIndex = process.argv.indexOf("--port");
  const PORT = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? Number(process.argv[portArgIndex + 1]) : 5000;
  const isProduction = process.env.NODE_ENV === "production";
  await connectDB();
  initializeCronJobs();
  const app = createExpressApp();
  if (isProduction) {
    const distPath = path.resolve(__dirname, "../frontend/dist");
    const express = (await import("express")).default;
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`[FitSync Server] Running on http://localhost:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("[FitSync Server] Fatal error starting server:", err);
  process.exit(1);
});
