import { Link } from "react-router-dom";
import { ProductListPage } from "./ProductListPage.jsx";

const categories = [
  { title: "Trousers & Pants", route: "pants", image: "/images/t.jpg", alt: "Trousers" },
  { title: "Dresses", route: "dresses", image: "/images/d.jpg", alt: "Dresses" },
  { title: "Shoes", route: "shoes", image: "/images/s.jpg", alt: "Shoes" },
  { title: "Tops & Blouses", route: "tops", image: "/images/bss.jpg", alt: "Tops and blouses" },
  { title: "Sportswear", route: "sportswear", image: "/images/sw.jpg", alt: "Sportswear" }
];

const benefits = [
  {
    title: "Large Assortment",
    description: "Different types of products with fewer variations",
    image: "https://cdn-icons-png.flaticon.com/128/4753/4753367.png"
  },
  {
    title: "Fast & Free Shipping",
    description: "4-day delivery time with expedited delivery options",
    image: "https://cdn-icons-png.flaticon.com/128/7245/7245083.png"
  },
  {
    title: "24/7 Support",
    description: "Business-related inquiries answered anytime",
    image: "https://cdn-icons-png.flaticon.com/128/609/609437.png"
  }
];

export function HomePage() {
  return <>
    <section className="hero">
      <h1>Elevate your style with Us</h1>
      <p>A curated collection of dresses, tops, suits, and more for every occasion.</p>
      <Link to="/products">Shop products</Link>
    </section>
    <ProductListPage title="Featured Products" limit={4} order="asc" />

    <section className="home-categories" aria-labelledby="home-categories-title">
      <h2 id="home-categories-title">Shop by Category</h2>
      <div className="home-category-grid">
        {categories.map((category) => <Link
          className="home-category-card"
          to={`/category/${category.route}`}
          key={category.route}
        >
          <img src={category.image} alt={category.alt} />
          <h3>{category.title}</h3>
        </Link>)}
      </div>
    </section>

    <section className="home-benefits" aria-labelledby="home-benefits-title">
      <h2 id="home-benefits-title">About Us</h2>
      <div className="home-benefit-grid">
        {benefits.map((benefit) => <article className="home-benefit-card" key={benefit.title}>
          <img src={benefit.image} alt="" loading="lazy" />
          <h3>{benefit.title}</h3>
          <p>{benefit.description}</p>
        </article>)}
      </div>
    </section>
  </>;
}
