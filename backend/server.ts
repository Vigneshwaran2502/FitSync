import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createExpressApp } from './app.js';
import { connectDB } from './config/db.js';
import { initializeCronJobs } from './cron/cronJobs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Dev server must strictly run on port 3000 per AI Studio environment constraints
  const portArgIndex = process.argv.indexOf('--port');
  const PORT = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? Number(process.argv[portArgIndex + 1]) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Connect to Database (with automatic MongoMemoryServer fallback & seed)
  await connectDB();

  // 2. Start Background Cron Tasks
  initializeCronJobs();

  // 3. Create Express App with RESTful APIs
  const app = createExpressApp();

  // 4. Mount Vite Dev Middleware in development, or Static Files in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const express = (await import('express')).default;
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 5. Listen on Port 3000
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[FitSync Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[FitSync Server] Fatal error starting server:', err);
  process.exit(1);
});
