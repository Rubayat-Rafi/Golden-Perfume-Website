import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";
import { router } from "./routers/router.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2, retry: 1 },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <RouterProvider router={router} />
              <Toaster
                position="top-center"
                richColors
                toastOptions={{ style: { fontFamily: 'Lato, sans-serif' } }}
              />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
