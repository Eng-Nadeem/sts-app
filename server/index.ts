import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { registerMockRoutes } from "./mockRoutes";
import { registerMongoRoutes } from "./mongoRoutes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToDatabase } from "../db/mongodb";

// Using MongoDB as our database
let DATABASE_OPTION = 'mongodb';

// Create application
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

(async () => {
  // Select database implementation based on DATABASE_OPTION
  let server;
  
  // Try to connect to MongoDB first if that's the intended option
  if (DATABASE_OPTION === 'mongodb') {
    try {
      // Check if MONGODB_URI is set
      if (!process.env.MONGODB_URI) {
        log('MONGODB_URI is not set. Please provide a valid MongoDB connection string.', 'mongodb');
        log('Falling back to mock data for now.', 'mongodb');
        server = await registerMockRoutes(app);
      } else {
        // Attempt MongoDB connection
        const isConnected = await connectToDatabase();
        
        if (isConnected) {
          log('MongoDB connected successfully, using MongoDB routes', 'mongodb');
          server = await registerMongoRoutes(app);
        } else {
          // Fall back to mock data if MongoDB connection fails
          log('Failed to connect to MongoDB, falling back to mock data', 'mongodb');
          server = await registerMockRoutes(app);
        }
      }
    } catch (error) {
      log(`MongoDB error: ${error}. Falling back to mock data`, 'mongodb');
      server = await registerMockRoutes(app);
    }
  } else if (DATABASE_OPTION === 'mock') {
    server = await registerMockRoutes(app);
  } else if (DATABASE_OPTION === 'postgresql') {
    server = await registerRoutes(app);
  } else {
    // Default to mock if undefined
    server = await registerMockRoutes(app);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    log(`Using ${DATABASE_OPTION.toUpperCase()} database`);
  });
})();
