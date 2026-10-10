import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../api/products.js";

export function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProduct(id).then(setProduct).catch((requestError) => setError(requestError.message));
  }, [id]);

  if (error) return <section className="page-section"><p className="error-message">{error}</p></section>;
  if (!product) return <section className="page-section"><p>Loading product…</p></section>;

  return <section className="product-detail">
    <img src={`/uploads/${encodeURIComponent(product.image)}`} alt={product.name} />
    <div>
      <p className="category-label">{product.category}</p>
      <h1>{product.name}</h1>
      <p className="price">${Number(product.price).toFixed(2)}</p>
      <p>{product.description}</p>
      <Link className="button" to="/products">Continue shopping</Link>
    </div>
  </section>;
}
