import { useEffect, useMemo, useState } from "react";
import { ProductGrid } from "../components/ProductGrid.jsx";
import { getProducts } from "../api/products.js";

export function ProductListPage({ title, categories, limit, order }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getProducts({ categories, limit, order })
      .then((nextProducts) => { if (active) setProducts(nextProducts); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [categories?.join(","), limit, order]);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    const matches = products.filter((product) =>
      !term || [product.name, product.category, product.description]
        .some((value) => String(value ?? "").toLocaleLowerCase().includes(term))
    );

    if (sort === "name") return [...matches].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "price-asc") return [...matches].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price-desc") return [...matches].sort((a, b) => Number(b.price) - Number(a.price));
    return matches;
  }, [products, search, sort]);

  return <section className="page-section">
    <h1>{title}</h1>
    {loading && <p>Loading products…</p>}
    {error && <p className="error-message">{error}</p>}
    {!loading && !error && <>
      <div className="catalog-toolbar">
        <label>Search products
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, category, or details"
          />
        </label>
        <label>Sort by
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="default">Featured</option>
            <option value="name">Name</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
        <p className="catalog-count" aria-live="polite">
          {visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}
        </p>
      </div>
      <ProductGrid products={visibleProducts} />
    </>}
  </section>;
}
