import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";

const MainLayout = () => {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-760.5px)]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
