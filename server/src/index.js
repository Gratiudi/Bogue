import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
import { productsRouter } from "./routes/products.js";
import { authRouter } from "./routes/auth.js";
import { cartRouter } from "./routes/cart.js";
import { ordersRouter } from "./routes/orders.js";

const app = express();
const port = Number(process.env.PORT ?? 5000);
const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

app.use(express.json());
app.use((req, _res, next) => {
  const cookieHeader = req.headers.cookie ?? "";
  req.cookies = Object.fromEntries(cookieHeader.split(";").flatMap((cookie) => {
    const separator = cookie.indexOf("=");
    if (separator < 0) return [];
    const name = cookie.slice(0, separator).trim();
    try {
      return [[name, decodeURIComponent(cookie.slice(separator + 1).trim())]];
    } catch {
      return [];
    }
  }));
  next();
});
app.use("/uploads", express.static(path.join(serverDirectory, "uploads")));

app.get("/api/health", async (_req, res, next) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "The server could not complete that request." });
});

app.listen(port, () => {
  console.log(`Bogue API listening on http://localhost:${port}`);
});
