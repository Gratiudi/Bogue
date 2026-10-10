import { Link, NavLink } from "react-router-dom";

export function Layout({ children }) {
  return <>
    <header className="site-header">
      <nav>
        <Link className="brand" to="/">Bogue</Link>
        <div className="navigation">
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/category/tops">Tops</NavLink>
          <NavLink to="/category/dresses">Dresses</NavLink>
          <NavLink to="/category/shoes">Shoes</NavLink>
        </div>
      </nav>
    </header>
    <main>{children}</main>
    <footer className="site-footer">© {new Date().getFullYear()} Bogue</footer>
  </>;
}
