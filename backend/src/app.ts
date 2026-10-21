import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { NODE_ENV, PORT } from "./config/env.js";
import { searchRouter } from "./routes/search.route.js";
import { closeBrowser, getBrowser } from "./services/browser.js";
import {rateLimit} from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import type { ServiceError } from "./types/index.ts";

const app = express();

// Global error handlers to prevent crash
process.on('uncaughtException', (err) => {
  console.error('🔴 Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Behind Caddy in production: use the real client IP for rate limiting
app.set('trust proxy', 1);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://domainak.store',
    'https://www.domainak.store',
    'https://domainak.netlify.app',
  ],
  credentials: true
}));

const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	limit: 15, // Limit each IP to 15 requests per `window` (here, per 1 minute).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
})

app.use('/search', limiter)
app.use(express.json());

app.use('/', searchRouter)

// Local one-command mode (`npm start` at the repo root): serve the built frontend too
const frontendDist = fileURLToPath(new URL('../../frontend/dist/', import.meta.url));
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('/results', (req, res) => res.sendFile(`${frontendDist}index.html`));
}

app.get("/", (req, res) => res.json({ message: "backend/domainak.store working fine!!" }));

// Express error handler middleware
app.use((err: ServiceError, req:Request, res:Response, next:NextFunction) => {
  console.error('🔴 Express error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Close Chrome with the server (it runs detached, so it would outlive us otherwise)
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    await closeBrowser()
    process.exit(0)
  })
}

// Launch Chrome before accepting requests: launching is the one moment it can
// take focus, so it's over before anyone (or `npm start`) opens the site
await getBrowser().catch((err) => console.error('🔴 Chrome failed to launch:', err.message))

app.listen(PORT, async (error) => {
  if (error) {
    console.error(`🔴 Can't start on port ${PORT}: ${error.message}. Is Domainak already running?`);
    await closeBrowser()
    process.exit(1)
  }
  console.log(`Server running on http://localhost:${PORT} in ${NODE_ENV} mode`);
});