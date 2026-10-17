import { useState } from "react";
import { Link } from "react-router-dom";
import { getProductImageUrl } from "../api/imageUrl.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { useCart } from "../cart/CartContext.jsx";

function ProductCard({ product }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);

  async function addToCart() {
    setAdding(true);
    setMessage("");
    try {
      await addItem(product.id);
      setMessage("Added to cart");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setAdding(false);
    }
  }

  return <article className="product-card" key={product.id}>
    <img src={getProductImageUrl(product.image)} alt={product.name} />
    <h3>{product.name}</h3>
    <p>${Number(product.price).toFixed(2)}</p>
    <div className="product-card-actions">
      <Link to={`/products/${product.id}`}>View details</Link>
      {user ? <button type="button" disabled={adding} onClick={addToCart}>{adding ? "Adding…" : "Add to cart"}</button> : <Link to="/login">Sign in to shop</Link>}
    </div>
    {message && <p className="cart-feedback" role="status">{message}</p>}
  </article>;
}

export function ProductGrid({ products }) {
  if (!products.length) return <p className="empty-state">No products found.</p>;

  return <div className="product-grid">
    {products.map((product) => <ProductCard product={product} key={product.id} />)}
  </div>;
}
