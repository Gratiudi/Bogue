import { Router } from "express";
import { db } from "../db.js";
import { ensureCommerceSchema } from "../commerce-schema.js";
import { requireCsrf, requireCustomer } from "./auth.js";

export const cartRouter = Router();

cartRouter.use(async (_req, _res, next) => {
  try {
    await ensureCommerceSchema();
    next();
  } catch (error) {
    next(error);
  }
});
cartRouter.use(requireCustomer);

async function readCart(customerId) {
  const [items] = await db.execute(
    `SELECT p.id AS productId, p.name, p.image, p.price, ci.quantity,
            ROUND(p.price * ci.quantity, 2) AS lineTotal
     FROM bogue_cart_items ci JOIN products p ON p.id = ci.product_id
     WHERE ci.customer_id = ? ORDER BY ci.created_at DESC`,
    [customerId]
  );
  const subtotalCents = items.reduce((total, item) => total + Math.round(Number(item.price) * 100) * item.quantity, 0);
  return {
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: (subtotalCents / 100).toFixed(2)
  };
}

cartRouter.get("/", async (req, res, next) => {
  try {
    res.json(await readCart(req.customer.id));
  } catch (error) {
    next(error);
  }
});

cartRouter.post("/items", requireCsrf, async (req, res, next) => {
  try {
    const productId = Number(req.body?.productId);
    const quantity = req.body?.quantity === undefined ? 1 : Number(req.body.quantity);
    if (!Number.isSafeInteger(productId) || productId < 1 || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return res.status(400).json({ message: "Choose a valid product and quantity (1–99)." });
    }
    const [products] = await db.execute("SELECT id FROM products WHERE id = ? LIMIT 1", [productId]);
    if (!products.length) return res.status(404).json({ message: "That product is no longer available." });

    await db.execute(
      `INSERT INTO bogue_cart_items (customer_id, product_id, quantity) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = LEAST(quantity + ?, 99)`,
      [req.customer.id, productId, quantity, quantity]
    );
    res.status(201).json(await readCart(req.customer.id));
  } catch (error) {
    next(error);
  }
});

cartRouter.put("/items/:productId", requireCsrf, async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const quantity = Number(req.body?.quantity);
    if (!Number.isSafeInteger(productId) || productId < 1 || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return res.status(400).json({ message: "Quantity must be a whole number from 1 to 99." });
    }
    const [result] = await db.execute(
      "UPDATE bogue_cart_items SET quantity = ? WHERE customer_id = ? AND product_id = ?",
      [quantity, req.customer.id, productId]
    );
    if (!result.affectedRows) {
      const [items] = await db.execute(
        "SELECT 1 FROM bogue_cart_items WHERE customer_id = ? AND product_id = ? LIMIT 1",
        [req.customer.id, productId]
      );
      if (!items.length) return res.status(404).json({ message: "That cart item was not found." });
    }
    res.json(await readCart(req.customer.id));
  } catch (error) {
    next(error);
  }
});

cartRouter.delete("/items/:productId", requireCsrf, async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    if (!Number.isSafeInteger(productId) || productId < 1) {
      return res.status(400).json({ message: "A valid product ID is required." });
    }
    await db.execute("DELETE FROM bogue_cart_items WHERE customer_id = ? AND product_id = ?", [req.customer.id, productId]);
    res.json(await readCart(req.customer.id));
  } catch (error) {
    next(error);
  }
});
