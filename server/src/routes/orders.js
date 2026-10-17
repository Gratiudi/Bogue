import { Router } from "express";
import { db } from "../db.js";
import { ensureCommerceSchema } from "../commerce-schema.js";
import { requireCsrf, requireCustomer } from "./auth.js";

export const ordersRouter = Router();

ordersRouter.use(async (_req, _res, next) => {
  try {
    await ensureCommerceSchema();
    next();
  } catch (error) {
    next(error);
  }
});
ordersRouter.use(requireCustomer);

function cleanField(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

ordersRouter.post("/", requireCsrf, async (req, res, next) => {
  const address = {
    name: cleanField(req.body?.name, 120),
    email: cleanField(req.body?.email, 254).toLowerCase(),
    phone: cleanField(req.body?.phone, 40),
    addressLine1: cleanField(req.body?.addressLine1, 180),
    addressLine2: cleanField(req.body?.addressLine2, 180),
    city: cleanField(req.body?.city, 100),
    region: cleanField(req.body?.region, 100),
    postalCode: cleanField(req.body?.postalCode, 24),
    country: cleanField(req.body?.country, 100)
  };
  const required = [address.name, address.email, address.phone, address.addressLine1, address.city, address.region, address.postalCode, address.country];
  if (required.some((field) => !field) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
    return res.status(400).json({ message: "Complete all required shipping fields with a valid email address." });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [cartItems] = await connection.execute(
      `SELECT p.id AS productId, p.name, p.image, p.price, ci.quantity
       FROM bogue_cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.customer_id = ? FOR UPDATE`,
      [req.customer.id]
    );
    if (!cartItems.length) {
      await connection.rollback();
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const subtotalCents = cartItems.reduce((total, item) => total + Math.round(Number(item.price) * 100) * item.quantity, 0);
    const subtotal = (subtotalCents / 100).toFixed(2);
    const [orderResult] = await connection.execute(
      `INSERT INTO bogue_orders
       (customer_id, status, payment_status, subtotal, shipping_name, shipping_email, shipping_phone,
        address_line1, address_line2, city, region, postal_code, country)
       VALUES (?, 'pending', 'unpaid', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.customer.id, subtotal, address.name, address.email, address.phone, address.addressLine1,
        address.addressLine2 || null, address.city, address.region, address.postalCode, address.country]
    );

    for (const item of cartItems) {
      await connection.execute(
        `INSERT INTO bogue_order_items (order_id, product_id, product_name, image, unit_price, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderResult.insertId, item.productId, item.name, item.image, item.price, item.quantity]
      );
    }
    await connection.execute("DELETE FROM bogue_cart_items WHERE customer_id = ?", [req.customer.id]);
    await connection.commit();
    res.status(201).json({ orderId: orderResult.insertId, status: "pending", paymentStatus: "unpaid", subtotal });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    next(error);
  } finally {
    connection?.release();
  }
});

ordersRouter.get("/", async (req, res, next) => {
  try {
    const [orders] = await db.execute(
      `SELECT id, status, payment_status AS paymentStatus, subtotal, shipping_name AS shippingName,
              shipping_email AS shippingEmail, shipping_phone AS shippingPhone,
              address_line1 AS addressLine1, address_line2 AS addressLine2,
              city, region, postal_code AS postalCode, country, created_at AS createdAt
       FROM bogue_orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 50`,
      [req.customer.id]
    );
    if (!orders.length) return res.json([]);
    const ids = orders.map((order) => order.id);
    const placeholders = ids.map(() => "?").join(", ");
    const [items] = await db.execute(
      `SELECT order_id AS orderId, product_id AS productId, product_name AS productName,
              image, unit_price AS unitPrice, quantity
       FROM bogue_order_items WHERE order_id IN (${placeholders}) ORDER BY id`,
      ids
    );
    const itemsByOrder = new Map(orders.map((order) => [String(order.id), []]));
    for (const item of items) itemsByOrder.get(String(item.orderId))?.push(item);
    res.json(orders.map((order) => ({ ...order, items: itemsByOrder.get(String(order.id)) })));
  } catch (error) {
    next(error);
  }
});
