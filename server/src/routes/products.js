import { Router } from "express";
import { db } from "../db.js";

export const productsRouter = Router();

productsRouter.get("/", async (req, res, next) => {
  try {
    const categories = String(req.query.categories ?? "")
      .split(",")
      .map((category) => category.trim())
      .filter(Boolean);
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 100);

    let sql = "SELECT id, name, description, price, image, category FROM products";
    const values = [];
    if (categories.length) {
      sql += " WHERE category IN (?)";
      values.push(categories);
    }
    sql += " ORDER BY id DESC LIMIT ?";
    values.push(limit);

    const [products] = await db.query(sql, values);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "A valid product ID is required." });
    }

    const [products] = await db.execute(
      "SELECT id, name, description, price, image, category FROM products WHERE id = ?",
      [id]
    );
    if (!products.length) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json(products[0]);
  } catch (error) {
    next(error);
  }
});
