import { useState } from "react";
import { Link } from "react-router-dom";
import { getProductImageUrl } from "../api/imageUrl.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { useCart } from "../cart/CartContext.jsx";

const money = (amount) => `$${Number(amount).toFixed(2)}`;

export function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading, setQuantity, removeItem } = useCart();
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function change(action, productId, quantity) {
    setError("");
    setBusyId(productId);
    try {
      if (action === "remove") await removeItem(productId);
      else await setQuantity(productId, quantity);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId(null);
    }
  }

  if (authLoading) return <section className="mx-auto min-h-[55vh] max-w-6xl px-4 py-14 text-center text-stone-600 sm:px-6">Loading your account…</section>;

  if (!user) return <section className="mx-auto min-h-[55vh] max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
    <div className="mx-auto max-w-xl rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-12">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-stone-100 text-2xl text-stone-700" aria-hidden="true">♡</span>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-stone-950">Your cart</h1>
      <p className="mt-2 text-stone-600">Sign in to see your saved cart and continue shopping.</p>
      <Link className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-stone-900 px-6 font-semibold text-white no-underline transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700" to="/login">Sign in</Link>
    </div>
  </section>;

  return <section className="mx-auto min-h-[55vh] max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">Your selection</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">Shopping cart</h1>
      </div>
      {!loading && cart.itemCount > 0 && <p className="text-sm text-stone-500">{cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}</p>}
    </div>
    {error && <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">{error}</p>}
    {loading ? <p className="rounded-2xl bg-stone-50 p-8 text-center text-stone-600">Loading your cart…</p> : cart.items.length === 0 ? <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-white text-2xl text-stone-700 shadow-sm" aria-hidden="true">♡</span>
      <h2 className="mt-4 text-xl font-semibold text-stone-900">Your cart is empty</h2>
      <p className="mt-2 text-stone-600">Explore the collection and find something you love.</p>
      <Link className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-stone-900 px-6 font-semibold text-white no-underline transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700" to="/products">Browse products</Link>
    </div> : <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        {cart.items.map((item) => <article className="grid grid-cols-[76px_minmax(0,1fr)] gap-4 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:grid-cols-[104px_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-5 sm:p-4" key={item.productId}>
          <Link className="row-span-3 overflow-hidden rounded-xl bg-stone-100 sm:row-span-1" to={`/products/${item.productId}`}>
            <img className="aspect-[4/5] w-full object-cover" src={getProductImageUrl(item.image)} alt={item.name} />
          </Link>
          <div className="min-w-0 self-center">
            <Link className="font-semibold text-stone-900 no-underline hover:text-stone-600" to={`/products/${item.productId}`}><h2 className="line-clamp-2">{item.name}</h2></Link>
            <p className="mt-1 text-sm text-stone-500">{money(item.price)} each</p>
            <button className="mt-3 text-sm font-medium text-rose-700 underline-offset-4 hover:underline disabled:opacity-50" type="button" disabled={busyId === item.productId} onClick={() => change("remove", item.productId)}>Remove</button>
          </div>
          <div className="col-start-2 flex items-center gap-3 sm:col-auto" aria-label={`Quantity for ${item.name}`}>
            <span className="text-sm text-stone-500">Qty</span>
            <div className="inline-flex items-center rounded-full border border-stone-300 p-1">
              <button className="grid size-8 place-items-center rounded-full text-lg text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40" type="button" aria-label={`Decrease quantity of ${item.name}`} disabled={busyId === item.productId || item.quantity <= 1} onClick={() => change("quantity", item.productId, item.quantity - 1)}>−</button>
              <strong className="min-w-8 text-center text-sm tabular-nums">{item.quantity}</strong>
              <button className="grid size-8 place-items-center rounded-full text-lg text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40" type="button" aria-label={`Increase quantity of ${item.name}`} disabled={busyId === item.productId || item.quantity >= 99} onClick={() => change("quantity", item.productId, item.quantity + 1)}>+</button>
            </div>
          </div>
          <strong className="col-start-2 text-right text-base font-semibold text-stone-900 sm:col-auto">{money(item.lineTotal)}</strong>
        </article>)}
      </div>
      <aside className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">
        <h2 className="text-lg font-semibold text-stone-950">Order summary</h2>
        <p className="mt-5 flex justify-between gap-4 border-b border-stone-200 pb-4 text-stone-600"><span>Subtotal</span><strong className="text-stone-950">{money(cart.subtotal)}</strong></p>
        <p className="py-4 text-sm leading-6 text-stone-500">Shipping and any applicable tax are calculated at checkout.</p>
        <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-stone-900 px-5 font-semibold text-white no-underline transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700" to="/checkout">Continue to checkout</Link>
        <Link className="mt-4 inline-flex w-full justify-center text-sm font-medium text-stone-600 underline-offset-4 hover:text-stone-950 hover:underline" to="/products">Continue shopping</Link>
      </aside>
    </div>}
  </section>;
}
