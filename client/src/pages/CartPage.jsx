import { useState } from "react";
import { Link } from "react-router-dom";
import { getProductImageUrl } from "../api/imageUrl.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { useCart } from "../cart/CartContext.jsx";

const money = (amount) => `$${Number(amount).toFixed(2)}`;

export function CartPage() {
  const { user } = useAuth();
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

  if (!user) return <section className="page-section cart-page">
    <h1>Your cart</h1>
    <p>Sign in to see your saved cart.</p>
    <Link className="button" to="/login">Sign in</Link>
  </section>;

  return <section className="page-section cart-page">
    <h1>Your cart</h1>
    {error && <p className="form-status error" role="alert">{error}</p>}
    {loading ? <p>Loading your cart…</p> : cart.items.length === 0 ? <div className="empty-state">
      <p>Your cart is empty.</p><Link className="button" to="/products">Browse products</Link>
    </div> : <>
      <div className="cart-list">
        {cart.items.map((item) => <article className="cart-item" key={item.productId}>
          <Link to={`/products/${item.productId}`}><img src={getProductImageUrl(item.image)} alt={item.name} /></Link>
          <div className="cart-item-info">
            <Link to={`/products/${item.productId}`}><h2>{item.name}</h2></Link>
            <p>{money(item.price)} each</p>
            <button className="text-button" type="button" disabled={busyId === item.productId} onClick={() => change("remove", item.productId)}>Remove</button>
          </div>
          <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
            <span>Quantity</span>
            <div><button type="button" aria-label="Decrease quantity" disabled={busyId === item.productId || item.quantity <= 1} onClick={() => change("quantity", item.productId, item.quantity - 1)}>−</button>
              <strong>{item.quantity}</strong>
              <button type="button" aria-label="Increase quantity" disabled={busyId === item.productId || item.quantity >= 99} onClick={() => change("quantity", item.productId, item.quantity + 1)}>+</button></div>
          </div>
          <strong>{money(item.lineTotal)}</strong>
        </article>)}
      </div>
      <aside className="cart-summary">
        <p><span>Subtotal</span><strong>{money(cart.subtotal)}</strong></p>
        <small>Shipping and any applicable tax are not included.</small>
        <Link className="button" to="/checkout">Continue to checkout</Link>
      </aside>
    </>}
  </section>;
}
