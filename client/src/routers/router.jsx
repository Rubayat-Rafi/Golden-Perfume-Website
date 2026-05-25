import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../MainLayout/MainLayout";
import Home from "../pages/Home/Home";
import LoginPage from "../pages/Login/LoginPage";
import RegisterPage from "../pages/Register/RegisterPage";
import WholesaleApplicationPage from "../pages/Register/WholesaleApplicationPage";
import CartPage from "../pages/Cart/CartPage";
import WishlistPage from "../pages/Wishlist/WishlistPage";
import ShopPage from "../pages/Shop/ShopPage";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import ProtectedRoute from "../components/Auth/ProtectedRoute";
import ContactPage from "../pages/Contact/ContactPage";

// Stub pages for protected routes — replace with real pages as you build them
const Stub = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center font-playfair text-[28px] text-[#aaa]">
    {title} — coming soon
  </div>
);

export const router = createBrowserRouter([
  // ── Public pages (no MainLayout header/footer on auth pages) ──
  { path: "/login",           element: <LoginPage /> },
  { path: "/register",        element: <RegisterPage /> },
  { path: "/wholesale-apply", element: <WholesaleApplicationPage /> },

  // ── Site pages (with MainLayout: header + footer) ──
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about",    element: <div>About Us</div> },
      { path: "shop",     element: <ShopPage /> },
      { path: "cart",        element: <CartPage /> },
      { path: "wishlist",    element: <WishlistPage /> },
      { path: "product/:id", element: <ProductDetail /> },
      { path: "contact",    element: <ContactPage /> },

      // Any authenticated user
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Stub title="My Profile" />
          </ProtectedRoute>
        ),
      },

      // Wholesale + Admin only
      {
        path: "wholesale",
        element: (
          <ProtectedRoute roles={['wholesale', 'admin']}>
            <Stub title="Wholesale Portal" />
          </ProtectedRoute>
        ),
      },

      // Staff + Admin only
      {
        path: "staff",
        element: (
          <ProtectedRoute roles={['staff', 'admin']}>
            <Stub title="Staff Dashboard" />
          </ProtectedRoute>
        ),
      },

      // Admin only
      {
        path: "admin",
        element: (
          <ProtectedRoute roles={['admin']}>
            <Stub title="Admin Dashboard" />
          </ProtectedRoute>
        ),
      },

      // Catch-all redirect
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
