# Bogue: React and Node migration

The original PHP application remains in `php/`, `admin/`, and `includes/`. The migration lives in `client/` (React) and `server/` (Express).

## First-time setup

1. Copy `server/.env.example` to `server/.env` and supply the MySQL credentials if they differ from the existing PHP settings. The defaults match `includes/db.php`: MySQL at `localhost:3307`, database `clothing_store`, user `root`, and an empty password.
2. Run `npm.cmd install` in the repository root.
3. Run `npm.cmd run install:all`.
4. Run `npm.cmd run dev`.

Open `http://localhost:5173`. The React app proxies `/api` and `/uploads` to the Express API on port 5000.

If `/api/health` returns an error, start MySQL first or update `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASSWORD` in `server/.env`. The API does not start or manage MySQL for you.

## Current migration scope

The public catalogue is migrated: home/featured products, all products, category pages, and product details. The API reads the existing `clothing_store.products` table and serves the existing `uploads/` directory.

Authentication, cart, checkout, and administration remain in PHP for now and should be migrated next, in that order.
