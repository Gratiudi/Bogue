import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

async function authRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api/auth/${path}`, {
      ...options,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers }
    });
  } catch {
    throw new Error("We couldn’t reach the store just now. Please check your connection and try again.");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message ?? "We couldn’t complete that request right now. Please try again shortly. If you may already have created an account, try signing in.");
  }
  return payload;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authRequest("me")
      .then(({ user: currentUser, csrfToken: currentCsrfToken }) => {
        if (active) {
          setUser(currentUser);
          setCsrfToken(currentCsrfToken);
        }
      })
      .catch(() => { if (active) { setUser(null); setCsrfToken(null); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({
    user,
    csrfToken,
    loading,
    async login(email, password) {
      const result = await authRequest("login", { method: "POST", body: JSON.stringify({ email, password }) });
      setUser(result.user);
      setCsrfToken(result.csrfToken);
      return result.user;
    },
    async register(name, email, password) {
      const result = await authRequest("register", { method: "POST", body: JSON.stringify({ name, email, password }) });
      setUser(result.user);
      setCsrfToken(result.csrfToken);
      return result.user;
    },
    async logout() {
      await authRequest("logout", { method: "POST", headers: { "X-CSRF-Token": csrfToken } });
      setUser(null);
      setCsrfToken(null);
    }
  }), [user, loading, csrfToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
