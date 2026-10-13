# Bogue: React and Node migration

The original PHP application remains in `php/`, `admin/`, and `includes/`. The migration lives in `client/` (React) and `server/` (Express).

## First-time setup

1. Copy `server/.env.example` to `server/.env` and supply the MySQL credentials if they differ from the existing PHP settings. The defaults match `includes/db.php`: MySQL at `localhost:3307`, database `clothing_store`, user `root`, and an empty password.
2. Run `npm.cmd install` in the repository root. npm workspaces install the client and server dependencies together.
3. Run `npm.cmd run dev` to start the client and API.

Use `npm.cmd run build` to build the client and `npm.cmd start` to start the API.

Open `http://localhost:5173`. The React app proxies `/api` and `/uploads` to the Express API on port 5000.

If `/api/health` returns an error, start MySQL first or update `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASSWORD` in `server/.env`. The API does not start or manage MySQL for you.

## Cloudinary product images

To move catalog images to Cloudinary, create a Cloudinary account and add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to `server/.env`. Keep the API secret private. Then run `npm.cmd run migrate:images --workspace=bogue-api` from the repository root. The migration reads product references from `clothing_store.products.image`, resolves them relative to `server/uploads/` (including subfolders such as `images/`), and replaces matching values with Cloudinary secure URLs. Products already using a URL are skipped, as are products whose referenced local image is missing; those are listed in the migration output. It migrates referenced product images, not every unreferenced file in the uploads folder. Local files are left in place as a fallback; back up the database before migrating because its image values are updated.

Cloudinary credentials are used only by the server-side migration. Product image URLs can then be delivered directly from Cloudinary.

## Current migration scope

The public catalogue is migrated: home/featured products, all products, category pages, and product details. The API reads the existing `clothing_store.products` table. Product images can use Cloudinary URLs after migration, with local images from `server/uploads/` available as a fallback.

Authentication, cart, checkout, and administration remain in PHP for now and should be migrated next, in that order.
