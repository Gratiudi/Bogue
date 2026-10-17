import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useCart } from "../cart/CartContext.jsx";

const initialAddress = (user) => ({
  name: user?.name ?? "",
  email: user?.email ?? "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: ""
});

export function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading, checkout } = useCart();
  const [address, setAddress] = useState(() => initialAddress(user));
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) setAddress((current) => ({ ...current, name: current.name || user.name, email: current.email || user.email }));
  }, [user]);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      setOrder(await checkout(address));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) return <section className="mx-auto min-h-[55vh] max-w-6xl px-4 py-14 text-center text-stone-600 sm:px-6">Loading your account…</section>;

  if (order) return <section className="mx-auto min-h-[55vh] max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
    <div className="mx-auto max-w-2xl rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-12">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-2xl font-semibold text-emerald-700" aria-hidden="true">✓</span>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-stone-950">Order received</h1>
      <p className="mt-3 text-stone-600">Your order <strong className="text-stone-900">#{order.orderId}</strong> has been placed.</p>
      <p className="mt-2 text-sm leading-6 text-stone-500">Its status is pending and payment is still unpaid. This checkout does not collect payment yet.</p>
      <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-stone-900 px-6 font-semibold text-white no-underline transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700" to="/account">View order history</Link>
    </div>
  </section>;

  if (!user) return <section className="mx-auto min-h-[55vh] max-w-6xl px-4 py-10 sm:px-6 lg:py-14"><div className="mx-auto max-w-xl rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-12"><h1 className="text-3xl font-semibold tracking-tight text-stone-950">Checkout</h1><p className="mt-3 text-stone-600">Sign in to continue to checkout.</p><Link className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-stone-900 px-6 font-semibold text-white no-underline transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700" to="/login">Sign in</Link></div></section>;
  if (!loading && cart.items.length === 0) return <section className="mx-auto min-h-[55vh] max-w-6xl px-4 py-10 sm:px-6 lg:py-14"><div className="mx-auto max-w-xl rounded-3xl border border-stone-200 bg-stone-50 p-8 text-center sm:p-12"><h1 className="text-3xl font-semibold tracking-tight text-stone-950">Your cart is empty</h1><p className="mt-3 text-stone-600">Add something to your cart before checking out.</p><Link className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-stone-900 px-6 font-semibold text-white no-underline transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700" to="/products">Browse products</Link></div></section>;

  const field = (key, label, props = {}) => <label className="grid gap-2 text-sm font-medium text-stone-700" key={key}>{label}
    <input className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3.5 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-600 focus:ring-2 focus:ring-stone-200" required={props.required !== false} maxLength={props.maxLength} type={props.type ?? "text"} autoComplete={props.autoComplete} value={address[key]} onChange={(event) => setAddress({ ...address, [key]: event.target.value })} />
  </label>;

  return <section className="mx-auto min-h-[55vh] max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
    <div className="mb-8">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">Almost there</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">Checkout</h1>
    </div>
    {loading ? <p className="rounded-2xl bg-stone-50 p-8 text-center text-stone-600">Loading your cart…</p> : <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
      <form className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8" onSubmit={submit}>
        <h2 className="text-xl font-semibold text-stone-950">Shipping details</h2>
        <p className="mb-6 mt-1 text-sm text-stone-500">Enter the address where you’d like your order delivered.</p>
        <div className="grid gap-5">
          {field("name", "Full name", { maxLength: 120, autoComplete: "name" })}
          {field("email", "Email address", { type: "email", maxLength: 254, autoComplete: "email" })}
          {field("phone", "Phone number", { type: "tel", maxLength: 40, autoComplete: "tel" })}
          {field("addressLine1", "Address", { maxLength: 180, autoComplete: "address-line1" })}
          {field("addressLine2", "Apartment, suite, etc. (optional)", { maxLength: 180, autoComplete: "address-line2", required: false })}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {field("city", "City", { maxLength: 100, autoComplete: "address-level2" })}
          {field("region", "State / region", { maxLength: 100, autoComplete: "address-level1" })}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {field("postalCode", "Postal code", { maxLength: 24, autoComplete: "postal-code" })}
          {field("country", "Country", { maxLength: 100, autoComplete: "country-name" })}
        </div>
        {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}
        <button className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-stone-900 px-6 font-semibold text-white transition hover:bg-stone-700 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700" type="submit" disabled={submitting}>{submitting ? "Placing order…" : "Place order"}</button>
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">No payment is collected yet. A payment provider must be connected before taking real orders.</p>
      </form>
      <aside className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">
        <h2 className="text-lg font-semibold text-stone-950">Order summary</h2>
        <div className="mt-5 space-y-4 border-b border-stone-200 pb-5">
          {cart.items.map((item) => <div className="flex justify-between gap-4 text-sm" key={item.productId}><span className="min-w-0 text-stone-600">{item.name} <span className="text-stone-400">× {item.quantity}</span></span><strong className="shrink-0 text-stone-900">${Number(item.lineTotal).toFixed(2)}</strong></div>)}
        </div>
        <p className="mt-5 flex justify-between gap-4 text-base font-semibold text-stone-950"><span>Subtotal</span><strong>${Number(cart.subtotal).toFixed(2)}</strong></p>
        <p className="mt-3 text-sm leading-6 text-stone-500">Shipping and applicable taxes are not included.</p>
      </aside>
    </div>}
  </section>;
}
