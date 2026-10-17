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
  const { user } = useAuth();
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

  if (order) return <section className="page-section checkout-page">
    <div className="order-confirmation">
      <h1>Order received</h1>
      <p>Your order <strong>#{order.orderId}</strong> has been placed.</p>
      <p>Its status is pending and payment is still unpaid. This checkout does not collect payment yet.</p>
      <Link className="button" to="/account">View order history</Link>
    </div>
  </section>;

  if (!user) return <section className="page-section checkout-page"><h1>Checkout</h1><p>Please sign in before checkout.</p><Link className="button" to="/login">Sign in</Link></section>;
  if (!loading && cart.items.length === 0) return <section className="page-section checkout-page"><h1>Checkout</h1><p>Your cart is empty.</p><Link className="button" to="/products">Browse products</Link></section>;

  const field = (key, label, props = {}) => <label key={key}>{label}
    <input required={props.required !== false} maxLength={props.maxLength} type={props.type ?? "text"} autoComplete={props.autoComplete} value={address[key]} onChange={(event) => setAddress({ ...address, [key]: event.target.value })} />
  </label>;

  return <section className="page-section checkout-page">
    <h1>Checkout</h1>
    {loading ? <p>Loading your cart…</p> : <div className="checkout-grid">
      <form className="checkout-form" onSubmit={submit}>
        <h2>Shipping details</h2>
        {field("name", "Full name", { maxLength: 120, autoComplete: "name" })}
        {field("email", "Email address", { type: "email", maxLength: 254, autoComplete: "email" })}
        {field("phone", "Phone number", { type: "tel", maxLength: 40, autoComplete: "tel" })}
        {field("addressLine1", "Address", { maxLength: 180, autoComplete: "address-line1" })}
        {field("addressLine2", "Apartment, suite, etc. (optional)", { maxLength: 180, autoComplete: "address-line2", required: false })}
        <div className="checkout-fields-row">
          {field("city", "City", { maxLength: 100, autoComplete: "address-level2" })}
          {field("region", "State / region", { maxLength: 100, autoComplete: "address-level1" })}
        </div>
        <div className="checkout-fields-row">
          {field("postalCode", "Postal code", { maxLength: 24, autoComplete: "postal-code" })}
          {field("country", "Country", { maxLength: 100, autoComplete: "country-name" })}
        </div>
        {error && <p className="form-status error" role="alert">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? "Placing order…" : "Place order"}</button>
        <p className="checkout-payment-note">No payment is collected yet. A payment provider must be connected before taking real orders.</p>
      </form>
      <aside className="checkout-summary">
        <h2>Order summary</h2>
        {cart.items.map((item) => <p key={item.productId}><span>{item.name} × {item.quantity}</span><strong>${Number(item.lineTotal).toFixed(2)}</strong></p>)}
        <p className="checkout-total"><span>Subtotal</span><strong>${Number(cart.subtotal).toFixed(2)}</strong></p>
      </aside>
    </div>}
  </section>;
}
