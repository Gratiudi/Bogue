import { Link, NavLink } from "react-router-dom";

export function Layout({ children }) {
  return (
    <>
      <header className="site-header">
        <nav>
          <Link className="brand" to="/">
            Bogue
          </Link>
          <div className="navigation">
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/blog">Blog</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="footer-content">
          <section className="footer-section">
            <h2>About Bogue</h2>
            <p>
              Your destination for stylish and affordable fashion. We bring you
              the latest trends in clothing, accessories, and more.
            </p>
          </section>
          <nav
            className="footer-section footer-quick-links"
            aria-label="Footer"
          >
            <h2>Quick Links</h2>
            <Link to="/products">Shop All</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/blog">Blog</Link>
          </nav>
          <section className="footer-section">
            <h2>Connect With Us</h2>
            <div className="social-links" aria-label="Social networks">
              <span aria-label="Facebook">f</span>
              <span aria-label="Instagram">◎</span>
              <span aria-label="Twitter">𝕏</span>
              <span aria-label="Pinterest">P</span>
            </div>
          </section>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Bogue Store. All rights reserved.
        </div>
      </footer>
    </>
  );
}
