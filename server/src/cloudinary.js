import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

export function getCloudinaryClient() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  const missing = [
    ["CLOUDINARY_CLOUD_NAME", CLOUDINARY_CLOUD_NAME],
    ["CLOUDINARY_API_KEY", CLOUDINARY_API_KEY],
    ["CLOUDINARY_API_SECRET", CLOUDINARY_API_SECRET]
  ].filter(([, value]) => !value);

  if (missing.length) {
    throw new Error(`Missing Cloudinary settings: ${missing.map(([name]) => name).join(", ")}`);
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
  });

  return cloudinary;
}
