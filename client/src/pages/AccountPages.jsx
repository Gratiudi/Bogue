import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export function AccountFormPage({ mode }) {
  const isRegister = mode === "register";
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/account" replace />;

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
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
        <label>Email address
          <input type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label>Password
          <input type="password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 8 : undefined} maxLength={128} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
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
  if (loading) return <section className="account-page page-section"><p>Loading your account…</p></section>;
  if (!user) return <Navigate to="/login" replace />;
  return <section className="account-page page-section">
    <div className="account-card">
      <h1>Your account</h1>
      <p>Welcome, {user.name}.</p>
      <dl><dt>Name</dt><dd>{user.name}</dd><dt>Email</dt><dd>{user.email}</dd></dl>
      <p className="account-note">Your account is ready. Order history and checkout can be connected here as those store features are added.</p>
      <Link className="button" to="/products">Continue shopping</Link>
    </div>
  </section>;
}
