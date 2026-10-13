export function getProductImageUrl(image) {
  if (/^https?:\/\//i.test(image ?? "")) return image;
  return `/uploads/${encodeURIComponent(image ?? "")}`;
}
