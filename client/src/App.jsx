import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { ProductListPage } from "./pages/ProductListPage.jsx";
import { ProductPage } from "./pages/ProductPage.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";
import { BlogPage } from "./pages/BlogPage.jsx";
import { ContactPage } from "./pages/ContactPage.jsx";
import { AccountFormPage, AccountPage } from "./pages/AccountPages.jsx";
import { CartPage } from "./pages/CartPage.jsx";
import { CheckoutPage } from "./pages/CheckoutPage.jsx";

const categoryMap = {
  tops: { title: "Tops and Blouses", categories: ["Tops", "Blouses"] },
  dresses: { title: "Dresses", categories: ["Dresses"] },
  shoes: { title: "Shoes", categories: ["Shoes"] },
  pants: { title: "Trousers and Pants", categories: ["Pants", "Trousers"] },
  sportswear: { title: "Sportswear", categories: ["Sportswear"] }
};

function CategoryPage() {
  const category = categoryMap[useParams().name];
  return category ? <ProductListPage {...category} /> : <Navigate to="/products" replace />;
}

export default function App() {
  return <Layout><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/products" element={<ProductListPage title="All Products" />} />
    <Route path="/products/:id" element={<ProductPage />} />
    <Route path="/category/:name" element={<CategoryPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/blog" element={<BlogPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/register" element={<AccountFormPage mode="register" />} />
    <Route path="/login" element={<AccountFormPage mode="login" />} />
    <Route path="/account" element={<AccountPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Layout>;
}
