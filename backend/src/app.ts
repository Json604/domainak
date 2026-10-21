import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { NODE_ENV, PORT } from "./config/env.js";
import { searchRouter } from "./routes/search.route.js";
import { closeBrowser, getBrowser } from "./services/browser.js";
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

// Only the local dev frontend calls across origins (`npm start` serves the app
// from this same server). No websites: this server drives a real Chrome.
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// No rate limit: the server only listens on this machine, so every request is
// the person using it, and a limit would only break their searches
app.use(express.json());

app.use('/', searchRouter)

// Lets `npm start` tell this server apart from anything else on the port
app.get('/health', (req, res) => res.json({ app: 'domainak' }))

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
// Ctrl+C, a closed terminal window (SIGHUP) and Ctrl+Break on Windows all count
let closing = false
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK'] as const) {
  process.on(signal, async () => {
    if (closing) return
    closing = true
    await closeBrowser()
    process.exit(0)
  })
}

// Launch Chrome before accepting requests: launching is the one moment it can
// take focus, so it's over before anyone (or `npm start`) opens the site
await getBrowser().catch((err) => console.error('🔴 Chrome failed to launch:', err.message))

// Loopback only: this server drives a real Chrome, so nobody else on the network
// should reach it (also avoids the macOS "accept incoming connections?" prompt).
// Both IPv4 and IPv6 loopback, so "localhost" reaches us whichever it resolves to.
const listen = (host: string, required: boolean) => app.listen(Number(PORT), host, async (error) => {
  if (error) {
    // No IPv6 on this machine: IPv4 is enough
    if (!required && (error as NodeJS.ErrnoException).code !== 'EADDRINUSE') return
    console.error(`🔴 Can't start on port ${PORT}: ${error.message}.`);
    console.error(`   Is Domainak already running? Otherwise pick another port: PORT=8001 npm start (PowerShell: $env:PORT=8001; npm.cmd start)`);
    await closeBrowser()
    process.exit(1)
  }
  if (required) console.log(`Server running on http://localhost:${PORT} in ${NODE_ENV} mode`);
});
listen('127.0.0.1', true)
listen('::1', false)