import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useCart } from "../cart/CartContext.jsx";

const navigationLinkClass = ({ isActive }) =>
  `flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:w-auto ${
    isActive
      ? "bg-rose-50 text-rose-950"
      : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
  }`;

export function Layout({ children }) {
  const { user, loading, logout } = useAuth();
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setMenuOpen(false);
    try { await logout(); } catch (error) { console.error("Could not sign out:", error); }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#fcfaf7]/95 shadow-sm backdrop-blur">
        <div className="bg-stone-950 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-stone-100 sm:text-xs">
          A personal edit for every day <span className="mx-2 text-rose-300" aria-hidden="true">✳</span> Discover Bogue
        </div>
        <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 px-4 py-3 sm:px-6 lg:px-8">
          <Link className="flex flex-col rounded text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-900" to="/" onClick={() => setMenuOpen(false)}>
            <span className="font-serif text-[1.7rem] font-semibold leading-none tracking-[0.12em]">BOGUE</span>
            <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.23em] text-stone-500">Fashion, your way</span>
          </Link>
          <button
            className="inline-flex size-11 items-center justify-center rounded-lg border border-stone-300 text-stone-700 transition hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700 md:hidden"
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
          <div id="site-navigation" className={`${menuOpen ? "flex" : "hidden"} w-full flex-col gap-1 border-t border-stone-200 pt-3 md:flex md:w-auto md:flex-1 md:flex-row md:items-center md:justify-end md:gap-1 md:border-0 md:pt-0`}>
            <NavLink className={navigationLinkClass} onClick={() => setMenuOpen(false)} to="/products">Products</NavLink>
            <NavLink className={navigationLinkClass} onClick={() => setMenuOpen(false)} to="/blog">Blog</NavLink>
            <NavLink className={navigationLinkClass} onClick={() => setMenuOpen(false)} to="/about">About</NavLink>
            <NavLink className={navigationLinkClass} onClick={() => setMenuOpen(false)} to="/contact">Contact</NavLink>
            <NavLink className={navigationLinkClass} onClick={() => setMenuOpen(false)} to="/cart">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16l-1.2 12H5.2L4 8Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V6a3 3 0 0 1 6 0v3" /></svg>
              Bag{user && cart.itemCount > 0 ? ` (${cart.itemCount})` : ""}
            </NavLink>
            {loading ? null : user ? <>
              <NavLink className={navigationLinkClass} onClick={() => setMenuOpen(false)} to="/account">My Account</NavLink>
              <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700 md:w-auto" type="button" onClick={handleLogout}>Sign out</button>
            </> : <>
              <NavLink className={navigationLinkClass} onClick={() => setMenuOpen(false)} to="/login">Sign in</NavLink>
              <NavLink className={`${navigationLinkClass({ isActive: false })} md:bg-stone-950 md:text-white md:hover:bg-rose-900 md:hover:text-white`} onClick={() => setMenuOpen(false)} to="/register">Create account</NavLink>
            </>}
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
