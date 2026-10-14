import { Router } from "express";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "../db.js";

export const authRouter = Router();
const SESSION_COOKIE = "bogue_session";
const SESSION_DAYS = 30;
const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60 * 1000;

let schemaReady;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.query(`CREATE TABLE IF NOT EXISTS customers (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(254) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
      await db.query(`CREATE TABLE IF NOT EXISTS customer_sessions (
        token_hash CHAR(64) NOT NULL PRIMARY KEY,
        csrf_token CHAR(64) NOT NULL,
        customer_id BIGINT UNSIGNED NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_customer_sessions_expiry (expires_at),
        INDEX idx_customer_sessions_customer (customer_id),
        CONSTRAINT fk_customer_sessions_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    })().catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  return schemaReady;
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function setSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE
  });
}

function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
}

async function createSession(res, customerId) {
  await db.execute("DELETE FROM customer_sessions WHERE expires_at <= NOW()");
  const token = randomBytes(32).toString("base64url");
  const csrfToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE);
  await db.execute(
    "INSERT INTO customer_sessions (token_hash, csrf_token, customer_id, expires_at) VALUES (?, ?, ?, ?)",
    [hash(token), csrfToken, customerId, expiresAt]
  );
  setSessionCookie(res, token);
  return csrfToken;
}

function publicCustomer(customer) {
  return { id: customer.id, name: customer.name, email: customer.email };
}

function csrfMatches(expected, provided) {
  if (typeof provided !== "string") return false;
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer);
}

authRouter.post("/register", async (req, res, next) => {
  try {
    await ensureSchema();
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (name.length < 2 || name.length > 120) {
      return res.status(400).json({ message: "Enter a name between 2 and 120 characters." });
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: "Password must be between 8 and 72 characters." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await db.execute(
      "INSERT INTO customers (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );
    const customer = { id: result.insertId, name, email };
    const csrfToken = await createSession(res, customer.id);
    res.status(201).json({ user: publicCustomer(customer), csrfToken });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "An account with that email already exists." });
    }
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    await ensureSchema();
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const [customers] = await db.execute(
      "SELECT id, name, email, password_hash FROM customers WHERE email = ? LIMIT 1",
      [email]
    );
    const customer = customers[0];
    const passwordMatches = Boolean(customer && password.length <= 72 && await bcrypt.compare(password, customer.password_hash));
    if (!passwordMatches) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }
    const csrfToken = await createSession(res, customer.id);
    res.json({ user: publicCustomer(customer), csrfToken });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", async (req, res, next) => {
  try {
    await ensureSchema();
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) return res.json({ user: null, csrfToken: null });
    const [sessions] = await db.execute(
      `SELECT c.id, c.name, c.email, s.csrf_token
       FROM customer_sessions s JOIN customers c ON c.id = s.customer_id
       WHERE s.token_hash = ? AND s.expires_at > NOW() LIMIT 1`,
      [hash(token)]
    );
    const session = sessions[0];
    if (!session) {
      clearSessionCookie(res);
      return res.json({ user: null, csrfToken: null });
    }
    res.json({ user: publicCustomer(session), csrfToken: session.csrf_token });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    await ensureSchema();
    const token = req.cookies?.[SESSION_COOKIE];
    if (token) {
      const [sessions] = await db.execute(
        "SELECT csrf_token FROM customer_sessions WHERE token_hash = ? AND expires_at > NOW() LIMIT 1",
        [hash(token)]
      );
      if (sessions[0] && !csrfMatches(sessions[0].csrf_token, req.get("X-CSRF-Token"))) {
        return res.status(403).json({ message: "Your session security check failed. Refresh and try again." });
      }
      await db.execute("DELETE FROM customer_sessions WHERE token_hash = ?", [hash(token)]);
    }
    clearSessionCookie(res);
    res.json({ user: null, csrfToken: null });
  } catch (error) {
    next(error);
  }
});
