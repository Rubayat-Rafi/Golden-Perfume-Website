import { Link } from 'react-router-dom';

const slides = [
  { src: '/assets/brand/hero-1.jpg', cls: 'animate-hero-1' },
  { src: '/assets/brand/hero-2.jpg', cls: 'animate-hero-2' },
  { src: '/assets/brand/hero-3.jpg', cls: 'animate-hero-3' },
];

const Banner = () => {
  return (
    <div
      data-hero
      className="relative overflow-hidden text-center bg-[#1e2e24] py-[140px] md:py-[200px] xl:py-[240px]"
    >
      {/* Animated background slides */}
      {slides.map((slide) => (
        <div
          key={slide.src}
          className={`absolute inset-0 bg-cover bg-center opacity-0 ${slide.cls}`}
          style={{ backgroundImage: `url('${slide.src}')` }}
        />
      ))}

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            'linear-gradient(160deg, rgba(20,38,28,0.72) 0%, rgba(42,61,49,0.55) 50%, rgba(15,28,20,0.72) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-[3] max-w-[700px] mx-auto px-4">
        <span className="font-lato text-gold text-[12px] uppercase tracking-[4px] block mb-5">
          New Orleans &middot; Est. 2010
        </span>

        <h1 className="font-playfair font-normal text-white text-[42px] md:text-[60px] xl:text-[72px] leading-[1.1] mt-2 mb-7 capitalize">
          Natural Fragrances &amp; Botanicals
        </h1>

        <p className="max-w-[500px] mx-auto font-lato text-[16px] md:text-[18px] xl:text-[20px] leading-[150%] text-white/80">
          Hand-blended essential oils and botanical perfumes, crafted in small
          batches from the finest natural ingredients.
        </p>

        <Link
          to="/shop"
          className="inline-block mt-[60px] h-[60px] leading-[60px] bg-gold text-dark-green font-lato font-bold text-[14px] uppercase tracking-[2px] px-[50px] rounded-[3px] hover:bg-[#c49843] transition-colors duration-200"
        >
          Shop now
        </Link>
      </div>
    </div>
  );
};

export default Banner;
