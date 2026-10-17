import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";

const CartContext = createContext(null);
const emptyCart = { items: [], itemCount: 0, subtotal: "0.00" };

async function cartRequest(path, { method = "GET", body, csrfToken } = {}) {
  const response = await fetch(path, {
    method,
    credentials: "include",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message ?? "Unable to update your cart.");
  return payload;
}

export function CartProvider({ children }) {
  const { user, loading: authLoading, csrfToken } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(emptyCart);
      return emptyCart;
    }
    setLoading(true);
    try {
      const nextCart = await cartRequest("/api/cart");
      setCart(nextCart);
      return nextCart;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setCart(emptyCart);
      return;
    }
    refreshCart().catch((error) => console.error("Could not load cart:", error));
  }, [user, authLoading, refreshCart]);

  const value = useMemo(() => ({
    cart,
    loading,
    refreshCart,
    async addItem(productId, quantity = 1) {
      if (!user) throw new Error("Sign in to add items to your cart.");
      const nextCart = await cartRequest("/api/cart/items", { method: "POST", body: { productId, quantity }, csrfToken });
      setCart(nextCart);
      return nextCart;
    },
    async setQuantity(productId, quantity) {
      const nextCart = await cartRequest(`/api/cart/items/${productId}`, { method: "PUT", body: { quantity }, csrfToken });
      setCart(nextCart);
      return nextCart;
    },
    async removeItem(productId) {
      const nextCart = await cartRequest(`/api/cart/items/${productId}`, { method: "DELETE", csrfToken });
      setCart(nextCart);
      return nextCart;
    },
    async checkout(address) {
      const order = await cartRequest("/api/orders", { method: "POST", body: address, csrfToken });
      await refreshCart();
      return order;
    }
  }), [cart, loading, refreshCart, user, csrfToken]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider.");
  return context;
}
