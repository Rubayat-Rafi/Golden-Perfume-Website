import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop";
import ScrollButtons from "../components/ScrollButtons/ScrollButtons";

const MainLayout = () => {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="min-h-[calc(100vh-760.5px)] bg-cream">
        <Outlet />
      </main>
      <Footer />
      <ScrollButtons />
    </>
  );
};

export default MainLayout;
