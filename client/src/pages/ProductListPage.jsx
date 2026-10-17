import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ProductGrid } from "../components/ProductGrid.jsx";
import { getProducts } from "../api/products.js";

export function ProductListPage({ title, categories, limit, order }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const isFeatured = Boolean(limit);

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

  const Heading = isFeatured ? "h2" : "h1";

  return <section className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${isFeatured ? "py-16 sm:py-20 lg:py-24" : "py-10 sm:py-14"}`}>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-900">{isFeatured ? "Selected for you" : categories?.length ? "The collection" : "Discover Bogue"}</p>
        <Heading className="mt-2 font-serif text-4xl tracking-tight text-stone-950 sm:text-5xl">{isFeatured ? "Featured pieces" : title}</Heading>
        {isFeatured && <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">A few favorites to start your next outfit inspiration.</p>}
      </div>
      {isFeatured && <Link className="inline-flex items-center gap-2 pb-1 text-sm font-semibold text-stone-700 underline decoration-stone-300 underline-offset-4 transition hover:text-rose-900" to="/products">Shop all <span aria-hidden="true">→</span></Link>}
    </div>

    {!isFeatured && <div className="mb-7 grid gap-4 rounded-2xl border border-stone-200 bg-[#f7f5f1] p-4 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-end sm:p-5">
      <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="product-search">
        Search the collection
        <span className="relative">
          <svg className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m16 16 4 4" /></svg>
          <input id="product-search" className="min-h-12 w-full rounded-xl border border-stone-300 bg-white pl-10 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-600 focus:ring-2 focus:ring-stone-200" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, category, or details" />
        </span>
      </label>
      <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="product-sort">
        Sort by
        <select id="product-sort" className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 outline-none transition focus:border-stone-600 focus:ring-2 focus:ring-stone-200" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="default">Featured</option>
          <option value="name">Name</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </label>
      {!loading && <p className="pb-3 text-sm text-stone-500" aria-live="polite">{visibleProducts.length} {visibleProducts.length === 1 ? "piece" : "pieces"}</p>}
    </div>}

    {loading && <p className="rounded-2xl bg-stone-50 px-5 py-10 text-center text-stone-500" role="status">Finding pieces for you…</p>}
    {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">{error}</p>}
    {!loading && !error && <ProductGrid products={visibleProducts} />}
  </section>;
}
