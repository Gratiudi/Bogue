import mysql from "mysql2/promise";
import "dotenv/config";

export const db = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3307),
  database: process.env.DB_NAME ?? "clothing_store",
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  waitForConnections: true,
  connectionLimit: 10
});
