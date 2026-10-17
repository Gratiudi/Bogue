import { db } from "./db.js";
import { ensureCustomerSchema } from "./routes/auth.js";

let schemaReady;

export function ensureCommerceSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await ensureCustomerSchema();
      await db.query(`CREATE TABLE IF NOT EXISTS bogue_cart_items (
        customer_id BIGINT UNSIGNED NOT NULL,
        product_id INT NOT NULL,
        quantity INT UNSIGNED NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (customer_id, product_id),
        INDEX idx_bogue_cart_items_product (product_id),
        CONSTRAINT fk_bogue_cart_items_customer FOREIGN KEY (customer_id) REFERENCES bogue_customers(id) ON DELETE CASCADE,
        CONSTRAINT fk_bogue_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
      await db.query(`CREATE TABLE IF NOT EXISTS bogue_orders (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        customer_id BIGINT UNSIGNED NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        payment_status VARCHAR(32) NOT NULL DEFAULT 'unpaid',
        subtotal DECIMAL(12,2) NOT NULL,
        shipping_name VARCHAR(120) NOT NULL,
        shipping_email VARCHAR(254) NOT NULL,
        shipping_phone VARCHAR(40) NOT NULL,
        address_line1 VARCHAR(180) NOT NULL,
        address_line2 VARCHAR(180) NULL,
        city VARCHAR(100) NOT NULL,
        region VARCHAR(100) NOT NULL,
        postal_code VARCHAR(24) NOT NULL,
        country VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_bogue_orders_customer (customer_id, created_at),
        CONSTRAINT fk_bogue_orders_customer FOREIGN KEY (customer_id) REFERENCES bogue_customers(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
      await db.query(`CREATE TABLE IF NOT EXISTS bogue_order_items (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        order_id BIGINT UNSIGNED NOT NULL,
        product_id INT NULL,
        product_name VARCHAR(255) NOT NULL,
        image VARCHAR(1024) NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        quantity INT UNSIGNED NOT NULL,
        INDEX idx_bogue_order_items_order (order_id),
        CONSTRAINT fk_bogue_order_items_order FOREIGN KEY (order_id) REFERENCES bogue_orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    })().catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  return schemaReady;
}
