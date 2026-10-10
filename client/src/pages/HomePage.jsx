import { Link } from "react-router-dom";
import { ProductListPage } from "./ProductListPage.jsx";

export function HomePage() {
  return <>
    <section className="hero">
      <h1>Elevate your style with us</h1>
      <p>A curated collection of dresses, tops, suits, and more for every occasion.</p>
      <Link to="/products">Shop products</Link>
    </section>
    <ProductListPage title="Featured Products" limit={4} />
  </>;
}
