import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../api/products.js";
import { getProductImageUrl } from "../api/imageUrl.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { useCart } from "../cart/CartContext.jsx";

export function ProductPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getProduct(id).then(setProduct).catch((requestError) => setError(requestError.message));
  }, [id]);

  if (error) return <section className="page-section"><p className="error-message">{error}</p></section>;
  if (!product) return <section className="page-section"><p>Loading product…</p></section>;

  async function addToCart() {
    setAdding(true);
    setCartMessage("");
    try {
      await addItem(product.id);
      setCartMessage("Added to your cart.");
    } catch (requestError) {
      setCartMessage(requestError.message);
    } finally {
      setAdding(false);
    }
  }

  return <section className="product-detail">
    <img src={getProductImageUrl(product.image)} alt={product.name} />
    <div>
      <p className="category-label">{product.category}</p>
      <h1>{product.name}</h1>
      <p className="price">${Number(product.price).toFixed(2)}</p>
      <p>{product.description}</p>
      {user ? <button className="button product-add-button" type="button" disabled={adding} onClick={addToCart}>{adding ? "Adding…" : "Add to cart"}</button> : <Link className="button" to="/login">Sign in to shop</Link>}
      {cartMessage && <p className="cart-feedback" role="status">{cartMessage}</p>}
      <Link className="button" to="/products">Continue shopping</Link>
    </div>
  </section>;
}
