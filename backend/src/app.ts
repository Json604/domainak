import express from "express";
import { NODE_ENV, PORT } from "./config/env.ts";
import { searchRouter } from "./routes/search.route.ts";
import {rateLimit} from "express-rate-limit";

const app = express();

const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	limit: 15, // Limit each IP to 15 requests per `window` (here, per 1 minute).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
})

app.use(limiter)

app.use(express.json());

app.use('/', searchRouter)

app.get("/", (req, res) => res.json({ message: "backend/domainak.store working fine!!" }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} in ${NODE_ENV} mode`);
});