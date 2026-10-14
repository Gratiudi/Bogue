import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

async function authRequest(path, options = {}) {
  const response = await fetch(`/api/auth/${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message ?? "Unable to complete the account request.");
  return payload;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authRequest("me")
      .then(({ user: currentUser }) => { if (active) setUser(currentUser); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(email, password) {
      const result = await authRequest("login", { method: "POST", body: JSON.stringify({ email, password }) });
      setUser(result.user);
      return result.user;
    },
    async register(name, email, password) {
      const result = await authRequest("register", { method: "POST", body: JSON.stringify({ name, email, password }) });
      setUser(result.user);
      return result.user;
    },
    async logout() {
      await authRequest("logout", { method: "POST" });
      setUser(null);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
