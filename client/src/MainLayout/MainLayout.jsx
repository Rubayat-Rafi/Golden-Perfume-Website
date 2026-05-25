import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop";

const MainLayout = () => {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="min-h-[calc(100vh-760.5px)]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
