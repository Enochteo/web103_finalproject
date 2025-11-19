import express from "express";
import router from "./routes/services.js";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// Allow trusting proxy when deployed (Render sits behind a proxy)
app.set("trust proxy", 1);

// In production we'll serve the built client from the server itself.
// During development, allow the Vite dev server origin via CORS.
const CLIENT_ORIGIN = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SECRET_KEY || process.env.SESSION_SECRET || "change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure cookies in production
      secure: process.env.NODE_ENV === "production",
      // if you host frontend on a different domain, you may need `sameSite: 'none'`
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// API routes
app.use("/api", router);

// Serve client static files when built
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fs from "fs";

// Try several possible build output locations (Render may place files under different roots)
const possibleClientDist = [
  path.join(__dirname, "../client/vite-project/dist"),
  path.join(__dirname, "../../client/vite-project/dist"),
  path.join(process.cwd(), "client/vite-project/dist"),
  path.join(process.cwd(), "src/client/vite-project/dist"),
];

let clientDist = null;
for (const p of possibleClientDist) {
  if (fs.existsSync(p)) {
    clientDist = p;
    break;
  }
}

if (clientDist && process.env.NODE_ENV === "production") {
  console.log("Serving client from:", clientDist);
  app.use(express.static(clientDist));
  // fallback to index.html for SPA routes — use middleware instead of a route pattern
  app.use((req, res, next) => {
    // only serve index.html for non-API GET requests
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    const indexPath = path.join(clientDist, "index.html");
    if (!fs.existsSync(indexPath)) return next();
    res.sendFile(indexPath, (err) => {
      if (err) next(err);
    });
  });
} else if (!clientDist) {
  console.warn(
    "Client build not found in any expected locations. Skipping static file serving."
  );
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
