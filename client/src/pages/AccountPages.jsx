import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export function AccountFormPage({ mode }) {
  const isRegister = mode === "register";
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/account" replace />;

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isRegister && form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      if (isRegister) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      navigate("/account", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="account-page page-section">
      <form className="account-form" onSubmit={submit}>
        <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p>{isRegister ? "Join Bogue to keep your shopping account in one place." : "Sign in to your Bogue account."}</p>
        {isRegister && <label>Full name
          <input autoComplete="name" required minLength={2} maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>}
        {isRegister && <label>Email address
          <input type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        }
        {!isRegister && <label>Email address
          <input type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>}
        <label>Password
          <input type="password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 8 : undefined} maxLength={72} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
        {isRegister && <label>Confirm password
          <input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} />
        </label>}
        {error && <p className="form-status error" role="alert">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? "Please wait…" : isRegister ? "Create account" : "Sign in"}</button>
        <p className="account-switch">
          {isRegister ? "Already have an account? " : "New to Bogue? "}
          <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link>
        </p>
      </form>
    </section>
  );
}

export function AccountPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (loading || !user) return;
    let active = true;
    fetch("/api/orders", { credentials: "include" })
      .then(async (response) => {
        const payload = await response.json().catch(() => []);
        if (!response.ok) throw new Error(payload.message ?? "Unable to load order history.");
        return payload;
      })
      .then((payload) => { if (active) setOrders(payload); })
      .catch((error) => { if (active) setOrdersError(error.message); })
      .finally(() => { if (active) setOrdersLoading(false); });
    return () => { active = false; };
  }, [loading, user]);

  if (loading) return <section className="account-page page-section"><p>Loading your account…</p></section>;
  if (!user) return <Navigate to="/login" replace />;
  return <section className="account-page page-section">
    <div className="account-card">
      <h1>Your account</h1>
      <p>Welcome, {user.name}.</p>
      <dl><dt>Name</dt><dd>{user.name}</dd><dt>Email</dt><dd>{user.email}</dd></dl>
    </div>
    <section className="order-history">
      <div className="order-history-heading"><h2>Order history</h2><Link to="/cart">View cart</Link></div>
      {ordersLoading && <p>Loading your orders…</p>}
      {ordersError && <p className="form-status error" role="alert">{ordersError}</p>}
      {!ordersLoading && !ordersError && orders.length === 0 && <p>You haven’t placed an order yet.</p>}
      {orders.map((order) => <article className="order-card" key={order.id}>
        <header><div><h3>Order #{order.id}</h3><p>{new Date(order.createdAt).toLocaleDateString()}</p></div><div className="order-status"><span>{order.status}</span><span>Payment: {order.paymentStatus}</span></div></header>
        <ul>{order.items.map((item) => <li key={item.orderId + "-" + item.productId}>
          <span>{item.productName} × {item.quantity}</span><strong>${(Number(item.unitPrice) * item.quantity).toFixed(2)}</strong>
        </li>)}</ul>
        <p className="order-total"><span>Subtotal</span><strong>${Number(order.subtotal).toFixed(2)}</strong></p>
        <p className="order-shipping">Shipping to {order.shippingName}, {order.addressLine1}, {order.city}, {order.region} {order.postalCode}, {order.country}</p>
      </article>)}
    </section>
  </section>;
}
