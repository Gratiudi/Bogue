import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../api/products.js";
import { getProductImageUrl } from "../api/imageUrl.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { useCart } from "../cart/CartContext.jsx";

export function ProductPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [cartFeedback, setCartFeedback] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getProduct(id).then(setProduct).catch((requestError) => setError(requestError.message));
  }, [id]);

  if (error) return <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6"><p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">{error}</p></section>;
  if (!product) return <section className="mx-auto max-w-6xl px-4 py-16 text-center text-stone-600 sm:px-6">Loading product…</section>;

  async function addToCart() {
    setAdding(true);
    setCartFeedback(null);
    try {
      await addItem(product.id);
      setCartFeedback({ type: "success", message: "Added to your cart." });
    } catch (requestError) {
      setCartFeedback({ type: "error", message: requestError.message });
    } finally {
      setAdding(false);
    }
  }

  return <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-14">
    <div className="overflow-hidden rounded-3xl bg-stone-100 shadow-sm">
      <img className="aspect-[4/5] max-h-[760px] w-full object-cover lg:aspect-auto lg:min-h-[620px]" src={getProductImageUrl(product.image)} alt={product.name} />
    </div>
    <div className="flex flex-col items-start py-2 lg:py-8">
      <p className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">{product.category}</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">{product.name}</h1>
      <p className="mt-4 text-2xl font-semibold text-stone-900">${Number(product.price).toFixed(2)}</p>
      <div className="my-6 h-px w-full bg-stone-200" />
      <p className="max-w-prose whitespace-pre-line leading-7 text-stone-600">{product.description}</p>
      <div className="mt-8 grid w-full max-w-sm gap-3">
        {user ? <button className="inline-flex min-h-12 items-center justify-center rounded-xl bg-stone-900 px-6 font-semibold text-white shadow-sm transition hover:bg-stone-700 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700" type="button" disabled={adding} onClick={addToCart}>{adding ? "Adding…" : "Add to cart"}</button> : <Link className="inline-flex min-h-12 items-center justify-center rounded-xl bg-stone-900 px-6 font-semibold text-white no-underline shadow-sm transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700" to="/login">Sign in to shop</Link>}
        <Link className="inline-flex min-h-12 items-center justify-center rounded-xl border border-stone-300 px-6 font-semibold text-stone-800 no-underline transition hover:border-stone-500 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700" to="/products">Continue shopping</Link>
      </div>
      {cartFeedback && <p className={`mt-4 text-sm ${cartFeedback.type === "error" ? "text-red-700" : "text-emerald-700"}`} role={cartFeedback.type === "error" ? "alert" : "status"}>{cartFeedback.message}</p>}
    </div>
  </section>;
}
