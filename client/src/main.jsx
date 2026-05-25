import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { RouterProvider } from "react-router-dom";
import { router } from "./routers/router.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <RouterProvider router={router} />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);
