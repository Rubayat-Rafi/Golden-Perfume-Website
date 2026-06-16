import Banner from "../../components/Banner/Banner";
import FeatureStrip from "../../components/FeatureStrip/FeatureStrip";
import TopCategories from "../../components/TopCategories/TopCategories";
import ShopByGender from "../../components/ShopByGender/ShopByGender";
import FeaturedProducts from "../../components/FeaturedProducts/FeaturedProducts";
import BrandStory from "../../components/BrandStory/BrandStory";
import NewArrivals from "../../components/NewArrivals/NewArrivals";
import PromoBanner from "../../components/PromoBanner/PromoBanner";
import Testimonials from "../../components/Testimonials/Testimonials";
import FAQ from "../../components/FAQ/FAQ";
import Subscribe from "../../components/Subscribe/Subscribe";

const Home = () => {
  return (
    <>
      <Banner />
      <TopCategories />
      <FeaturedProducts />
      <ShopByGender />

      {/* Promo banner image */}
      <div className="w-full">
        <img
          src="/assets/promo banner/promobanner1.webp"
          alt="Promo Banner"
          className="w-full object-cover block"
        />
      </div>

      <BrandStory />
      <NewArrivals />
      <PromoBanner />
      <Testimonials />
      <FAQ />
      <Subscribe />
      <FeatureStrip />
    </>
  );
};

export default Home;
