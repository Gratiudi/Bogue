async function request(path) {
  const response = await fetch(path);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to load products.");
  }
  return response.json();
}

export function getProducts({ categories, limit } = {}) {
  const query = new URLSearchParams();
  if (categories?.length) query.set("categories", categories.join(","));
  if (limit) query.set("limit", String(limit));
  const suffix = query.size ? `?${query}` : "";
  return request(`/api/products${suffix}`);
}

export function getProduct(id) {
  return request(`/api/products/${id}`);
}
