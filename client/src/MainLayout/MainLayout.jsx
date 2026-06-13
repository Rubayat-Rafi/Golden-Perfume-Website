import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop";
import ScrollButtons from "../components/ScrollButtons/ScrollButtons";
import CartSidebar from "../components/Cart/CartSidebar";
import WholesalePopup from "../components/WholesalePopup/WholesalePopup";

const MainLayout = () => {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="min-h-[calc(100vh-760.5px)] bg-white">
        <Outlet />
      </main>
      <Footer />
      <ScrollButtons />
      <CartSidebar />
      <WholesalePopup />
    </>
  );
};

export default MainLayout;
