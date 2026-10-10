import { Link } from "react-router-dom";

export function ProductGrid({ products }) {
  if (!products.length) return <p className="empty-state">No products found.</p>;

  return <div className="product-grid">
    {products.map((product) => <article className="product-card" key={product.id}>
      <img src={`/uploads/${encodeURIComponent(product.image)}`} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${Number(product.price).toFixed(2)}</p>
      <Link to={`/products/${product.id}`}>View details</Link>
    </article>)}
  </div>;
}
