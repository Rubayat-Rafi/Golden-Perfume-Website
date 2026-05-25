import Banner from "../../components/Banner/Banner";
import TopCategories from "../../components/TopCategories/TopCategories";
import FeaturedProducts from "../../components/FeaturedProducts/FeaturedProducts";
import NewArrivals from "../../components/NewArrivals/NewArrivals";
import Discount from "../../components/Discount/Discount";
import PromoBanner from "../../components/PromoBanner/PromoBanner";
import BrandLogo from "../../components/BrandLogo/BrandLogo";
import Trending from "../../components/Trending/Trending";
import Advantage from "../../components/Advantage/Advantage";
import Info from "../../components/Info/Info";
import LatestNews from "../../components/LatestNews/LatestNews";
import Subscribe from "../../components/Subscribe/Subscribe";

const Home = () => {
  return (
    <>
      <Banner />
      <TopCategories />
      <FeaturedProducts />

      {/* Promo banner image */}
      <div className="w-full">
        <img
          src="/assets/promo banner/promobanner1.webp"
          alt="Promo Banner"
          className="w-full object-cover block"
        />
      </div>

      <NewArrivals />
      {/* <Discount /> */}
      <PromoBanner />
      {/* <BrandLogo /> */}
      {/* <Trending /> */}
      {/* <Advantage /> */}
      {/* <Info /> */}
      <LatestNews />
      <Subscribe />
    </>
  );
};

export default Home;
