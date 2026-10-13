import path from "node:path";
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { db } from "../db.js";
import { getCloudinaryClient } from "../cloudinary.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = path.resolve(scriptDirectory, "../../uploads");

function describeError(error) {
  if (typeof error === "string") return error;

  const message = error?.message ?? error?.error?.message ?? error?.response?.body?.error?.message;
  const code = error?.code ?? error?.http_code ?? error?.error?.http_code;
  const connectionErrors = Array.isArray(error?.errors)
    ? error.errors.map((item) => [item?.code, item?.address && `${item.address}:${item.port}`].filter(Boolean).join(" ")).filter(Boolean).join(", ")
    : undefined;
  const details = [error?.name, message, code ? `code ${code}` : undefined, connectionErrors].filter(Boolean);

  if (details.length) return details.join(": ");
  if (error == null) return String(error);
  return `Unrecognized error (${Object.prototype.toString.call(error)}; fields: ${Object.keys(error).join(", ") || "none"})`;
}

async function migrateImages() {
  let stage = "connecting to Cloudinary";
  const cloudinary = getCloudinaryClient();
  stage = "reading products from MySQL";
  let products;
  try {
    [products] = await db.query("SELECT id, image FROM products ORDER BY id");
  } catch (error) {
    throw new Error(`${stage}: ${describeError(error)}`, { cause: error });
  }
  let migrated = 0;
  let skipped = 0;
  let missing = 0;

  for (const product of products) {
    if (!product.image || /^https?:\/\//i.test(product.image)) {
      skipped += 1;
      continue;
    }

    const relativeImagePath = String(product.image)
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .replace(/^(?:uploads\/)+/i, "");
    const localPath = path.resolve(uploadsDirectory, relativeImagePath);
    const resolvedRelativePath = path.relative(uploadsDirectory, localPath);
    if (!resolvedRelativePath || resolvedRelativePath === ".." || resolvedRelativePath.startsWith(`..${path.sep}`) || path.isAbsolute(resolvedRelativePath)) {
      throw new Error(`Product ${product.id} has an unsafe image path: ${product.image}`);
    }
    const publicId = `bogue/products/${product.id}`;

    try {
      await access(localPath);
    } catch (error) {
      if (error?.code === "ENOENT") {
        missing += 1;
        console.warn(`Skipped product ${product.id}: local image not found (${relativeImagePath})`);
        continue;
      }
      throw error;
    }

    try {
      stage = `uploading ${relativeImagePath} for product ${product.id} to Cloudinary`;
      const uploaded = await cloudinary.uploader.upload(localPath, {
        public_id: publicId,
        overwrite: true,
        resource_type: "image"
      });
      stage = `saving the Cloudinary URL for product ${product.id} in MySQL`;
      await db.execute("UPDATE products SET image = ? WHERE id = ?", [uploaded.secure_url, product.id]);
      migrated += 1;
      console.log(`Migrated product ${product.id}: ${relativeImagePath}`);
    } catch (error) {
      throw new Error(`${stage}: ${describeError(error)}`, { cause: error });
    }
  }

  console.log(`Cloudinary migration complete: ${migrated} migrated, ${skipped} already remote or empty, ${missing} local images missing.`);
}

try {
  await migrateImages();
} catch (error) {
  console.error(`Cloudinary image migration failed: ${describeError(error)}`);
  process.exitCode = 1;
} finally {
  await db.end();
}
