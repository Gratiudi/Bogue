import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
import { productsRouter } from "./routes/products.js";

const app = express();
const port = Number(process.env.PORT ?? 5000);
const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

app.use(express.json());
app.use("/uploads", express.static(path.join(serverDirectory, "uploads")));

app.get("/api/health", async (_req, res, next) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

app.use("/api/products", productsRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "The server could not complete that request." });
});

app.listen(port, () => {
  console.log(`Bogue API listening on http://localhost:${port}`);
});
