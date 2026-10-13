import { useEffect, useState } from "react";
import { ProductGrid } from "../components/ProductGrid.jsx";
import { getProducts } from "../api/products.js";

export function ProductListPage({ title, categories, limit, order }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts({ categories, limit, order })
      .then(setProducts)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [categories?.join(","), limit, order]);

  return <section className="page-section">
    <h1>{title}</h1>
    {loading && <p>Loading products…</p>}
    {error && <p className="error-message">{error}</p>}
    {!loading && !error && <ProductGrid products={products} />}
  </section>;
}
