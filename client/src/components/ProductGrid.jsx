import { useState } from "react";
import { Link } from "react-router-dom";
import { getProductImageUrl } from "../api/imageUrl.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { useCart } from "../cart/CartContext.jsx";

function ProductCard({ product }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [feedback, setFeedback] = useState(null);
  const [adding, setAdding] = useState(false);

  async function addToCart() {
    setAdding(true);
    setFeedback(null);
    try {
      await addItem(product.id);
      setFeedback({ type: "success", message: "Added to your cart." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setAdding(false);
    }
  }

  return <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
    <Link className="block overflow-hidden bg-stone-100" to={`/products/${product.id}`} aria-label={`View ${product.name}`}>
      <img className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105" src={getProductImageUrl(product.image)} alt={product.name} loading="lazy" />
    </Link>
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{product.category}</p>
      <Link className="text-left text-base font-semibold text-stone-900 no-underline transition hover:text-stone-600" to={`/products/${product.id}`}>
        <h3 className="line-clamp-2 min-h-12">{product.name}</h3>
      </Link>
      <p className="mt-2 text-lg font-semibold text-stone-900">${Number(product.price).toFixed(2)}</p>
      <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
        <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 px-3 text-sm font-semibold text-stone-800 no-underline transition hover:border-stone-500 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700" to={`/products/${product.id}`}>Details</Link>
        {user ? <button className="inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700" type="button" disabled={adding} onClick={addToCart}>{adding ? "Adding…" : "Add to cart"}</button> : <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-3 text-center text-sm font-semibold text-white no-underline transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700" to="/login">Sign in</Link>}
      </div>
      {feedback && <p className={`mt-3 text-sm ${feedback.type === "error" ? "text-red-700" : "text-emerald-700"}`} role={feedback.type === "error" ? "alert" : "status"}>{feedback.message}</p>}
    </div>
  </article>;
}

export function ProductGrid({ products }) {
  if (!products.length) return <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-center text-stone-600">No products found.</p>;

  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {products.map((product) => <ProductCard product={product} key={product.id} />)}
  </div>;
}
