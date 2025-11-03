import express from "express";
import { NODE_ENV, PORT } from "./config/env.ts";

const app = express();

app.use(express.json());

app.get("/", (req, res) => res.json({ message: "backend/domainak.store working fine!!" }));


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} in ${NODE_ENV} mode`);
});

