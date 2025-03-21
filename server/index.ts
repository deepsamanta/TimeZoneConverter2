import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize the server
const initializeServer = async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Only setup vite in development
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } 
  // Handle static serving for both Vercel and non-Vercel environments
  else {
    try {
      serveStatic(app);
    } catch (error) {
      console.warn("Warning: Static file serving failed, but continuing anyway:", error);
    }
  }

  // Serve static files
  app.use(express.static(path.join(__dirname, '../dist/public')));
  
  // Add catch-all route for SPA
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../dist/public/index.html'));
    }
  });

  return { app, server };
};

// Export for serverless and start server for deployment
const serverPromise = initializeServer();

if (process.env.VERCEL) {
  module.exports = serverPromise.then(({ app }) => app);
} else {
  (async () => {
    const { server } = await serverPromise;
    const port = process.env.PORT || 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  })();
}

export default serverPromise.then(({ app }) => app);
