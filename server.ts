import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

// Ensure compatibility for ES Module variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Simple API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Seth Capital Loan Manager" });
  });

  // Serve with Vite in development, serve compiled folder in production
  if (process.env.NODE_ENV !== "production") {
    console.log("Launching with dynamic Vite Dev Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Launching in Production environment...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Explicit static file server with precise MIME-type header mappings
    app.use(express.static(distPath, {
      maxAge: "1d",
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript");
        } else if (filePath.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css");
        } else if (filePath.endsWith(".svg")) {
          res.setHeader("Content-Type", "image/svg+xml");
        }
      }
    }));
    
    // SPA single page routing fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server active and listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start custom Express-Vite backend:", err);
  process.exit(1);
});
