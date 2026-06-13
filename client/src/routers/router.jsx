import { createBrowserRouter, Navigate, useParams } from "react-router-dom";
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
import CheckoutPage from "../pages/Checkout/CheckoutPage";
import TrackOrderPage from "../pages/TrackOrder/TrackOrderPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import WholesaleDashboard from "../pages/Wholesale/WholesaleDashboard";
import AdminLayout from "../pages/Admin/AdminLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminOrders from "../pages/Admin/AdminOrders";
import AdminWholesale from "../pages/Admin/AdminWholesale";
import AdminProducts from "../pages/Admin/AdminProducts";
import AdminBanners from "../pages/Admin/AdminBanners";
import AdminCategories from "../pages/Admin/AdminCategories";
import AdminCustomers from "../pages/Admin/AdminCustomers";
import AdminStaff from "../pages/Admin/AdminStaff";
import { PermGuard } from "../pages/Admin/access";
import AdminPromos from "../pages/Admin/AdminPromos";
import AdminMessages from "../pages/Admin/AdminMessages";
import AdminCategoryForm from "../pages/Admin/AdminCategoryForm";
import AdminProductForm from "../pages/Admin/AdminProductForm";

// Remounts ProductDetail (resetting all local state) when the slug changes
const ProductDetailRoute = () => { const { id } = useParams(); return <ProductDetail key={id} />; };

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
      { path: "product/:id", element: <ProductDetailRoute /> },
      { path: "contact",     element: <ContactPage /> },
      { path: "track-order", element: <TrackOrderPage /> },

      // Staff + Admin only
      {
        path: "staff",
        element: (
          <ProtectedRoute roles={['staff', 'admin']}>
            <Stub title="Staff Dashboard" />
          </ProtectedRoute>
        ),
      },

      // Catch-all redirect
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },

  // ── Account pages (standalone — no storefront header/footer) ──
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/wholesale",
    element: (
      <ProtectedRoute>
        <WholesaleDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/checkout",
    element: (
      <ProtectedRoute>
        <CheckoutPage />
      </ProtectedRoute>
    ),
  },

  // ── Admin panel (own layout: sidebar + topbar, no storefront header/footer) ──
  {
    path: "/admin",
    element: (
      <ProtectedRoute roles={['admin', 'staff']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,       element: <PermGuard section="dashboard"><AdminDashboard /></PermGuard> },
      { path: "banners",   element: <PermGuard section="banners"><AdminBanners /></PermGuard> },
      { path: "orders",    element: <PermGuard section="orders"><AdminOrders /></PermGuard> },
      { path: "wholesale", element: <PermGuard section="wholesale"><AdminWholesale /></PermGuard> },
      { path: "products",           element: <PermGuard section="products"><AdminProducts /></PermGuard> },
      { path: "products/new",       element: <PermGuard section="products"><AdminProductForm /></PermGuard> },
      { path: "products/:id/edit",  element: <PermGuard section="products"><AdminProductForm /></PermGuard> },
      { path: "categories",           element: <PermGuard section="categories"><AdminCategories /></PermGuard> },
      { path: "categories/new",       element: <PermGuard section="categories"><AdminCategoryForm /></PermGuard> },
      { path: "categories/:id/edit",  element: <PermGuard section="categories"><AdminCategoryForm /></PermGuard> },
      { path: "customers", element: <PermGuard section="customers"><AdminCustomers /></PermGuard> },
      { path: "promos",    element: <PermGuard section="promos"><AdminPromos /></PermGuard> },
      { path: "messages",  element: <PermGuard section="messages"><AdminMessages /></PermGuard> },
      { path: "staff",     element: <PermGuard adminOnly><AdminStaff /></PermGuard> },
    ],
  },
]);
