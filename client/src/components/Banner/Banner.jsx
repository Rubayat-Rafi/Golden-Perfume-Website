import { Link } from 'react-router-dom';

const slides = [
  { src: '/assets/brand/hero-4.webp', cls: 'animate-hero-1' },
  { src: '/assets/brand/hero-2.jpg', cls: 'animate-hero-2' },
  { src: '/assets/brand/hero-3.jpg', cls: 'animate-hero-3' },
];

const Banner = () => {
  return (
    <div
      data-hero
      className="relative overflow-hidden text-center bg-[#1e2e24] min-h-145 sm:min-h-160 md:min-h-175 flex items-center"
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

      {/* Content — top padding clears the absolute header */}
      <div className="relative z-[3] w-full max-w-175 mx-auto px-6 sm:px-8 flex flex-col items-center pt-36 sm:pt-32 md:pt-28 pb-10 sm:pb-14 md:pb-16">
        <span className="font-lato text-gold text-[11px] sm:text-[12px] uppercase tracking-[4px] block mb-3 sm:mb-4">
          New Orleans &middot; Est. 2010
        </span>

        <h1 className="font-playfair font-normal text-white text-[26px] sm:text-[38px] md:text-[52px] xl:text-[64px] leading-[1.15] mt-1 mb-4 sm:mb-6 capitalize">
          Natural Fragrances &amp; Botanicals
        </h1>

        <p className="max-w-110 font-lato text-[13px] sm:text-[15px] md:text-[16px] leading-relaxed text-white/80">
          Hand-blended essential oils and botanical perfumes, crafted in small
          batches from the finest natural ingredients.
        </p>

        <Link
          to="/shop"
          className="mt-7 sm:mt-10 inline-flex items-center justify-center h-10 sm:h-12 md:h-14 bg-gold text-dark-green font-lato font-bold text-[12px] sm:text-[13px] md:text-[14px] uppercase tracking-[2px] px-7 sm:px-10 md:px-12 rounded-[3px] hover:bg-[#c49843] transition-colors duration-200"
        >
          Shop now
        </Link>
      </div>
    </div>
  );
};

export default Banner;
