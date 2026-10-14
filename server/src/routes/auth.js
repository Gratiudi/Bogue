import { Router } from "express";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { db } from "../db.js";

export const authRouter = Router();
const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = "bogue_session";
const SESSION_DAYS = 30;
const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60 * 1000;

let schemaReady;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = Promise.all([
      db.query(`CREATE TABLE IF NOT EXISTS bogue_users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(254) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`),
      db.query(`CREATE TABLE IF NOT EXISTS bogue_sessions (
        token_hash CHAR(64) NOT NULL PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_bogue_sessions_expiry (expires_at),
        CONSTRAINT fk_bogue_sessions_user FOREIGN KEY (user_id) REFERENCES bogue_users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`)
    ]).catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  return schemaReady;
}

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE
  };
}

async function setSession(res, userId) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE);
  await db.execute(
    "INSERT INTO bogue_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
    [tokenHash(token), userId, expiresAt]
  );
  res.cookie(SESSION_COOKIE, token, cookieOptions());
}

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email };
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
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: "Password must be between 8 and 128 characters." });
    }

    const salt = randomBytes(16).toString("hex");
    const derivedKey = await scrypt(password, salt, 64);
    const [result] = await db.execute(
      "INSERT INTO bogue_users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, `${salt}:${derivedKey.toString("hex")}`]
    );
    const user = { id: result.insertId, name, email };
    await setSession(res, user.id);
    res.status(201).json({ user });
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
    const [users] = await db.execute(
      "SELECT id, name, email, password_hash FROM bogue_users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = users[0];
    let passwordMatches = false;
    if (user && password.length <= 128) {
      const [salt, storedHex] = user.password_hash.split(":");
      const stored = Buffer.from(storedHex ?? "", "hex");
      const candidate = await scrypt(password, salt, 64);
      passwordMatches = stored.length === candidate.length && timingSafeEqual(stored, candidate);
    }
    if (!passwordMatches) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }
    await setSession(res, user.id);
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", async (req, res, next) => {
  try {
    await ensureSchema();
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) return res.json({ user: null });
    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.email
       FROM bogue_sessions s JOIN bogue_users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > NOW() LIMIT 1`,
      [tokenHash(token)]
    );
    res.json({ user: rows[0] ? publicUser(rows[0]) : null });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    await ensureSchema();
    const token = req.cookies?.[SESSION_COOKIE];
    if (token) await db.execute("DELETE FROM bogue_sessions WHERE token_hash = ?", [tokenHash(token)]);
    res.clearCookie(SESSION_COOKIE, { ...cookieOptions(), maxAge: undefined });
    res.json({ user: null });
  } catch (error) {
    next(error);
  }
});
