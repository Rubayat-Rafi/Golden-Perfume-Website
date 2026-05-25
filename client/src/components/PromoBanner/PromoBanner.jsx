import { Link } from 'react-router-dom';

const PromoBanner = () => (
  <div
    className="relative py-14 md:py-20 bg-cover bg-center overflow-hidden"
    style={{ backgroundImage: "url('/assets/brand/cat-essential.jpg')" }}
  >
    {/* Dark overlay */}
    <div className="absolute inset-0 bg-dark-green/75" />

    <div className="relative z-10 max-w-305 mx-auto px-4 md:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="text-center md:text-left">
        <span className="font-lato text-gold text-[12px] uppercase tracking-[4px] block mb-3">
          For Business Owners
        </span>
        <h3 className="font-playfair font-normal text-[26px] md:text-[34px] leading-tight text-linen mb-3">
          Wholesale Accounts Available
        </h3>
        <p className="font-lato text-[14px] text-linen/70 leading-relaxed max-w-lg">
          Bulk pricing on fragrance oils, incense, essential oils, soaps, and skin care.
          Minimum orders start at 1 oz — scale up to full wholesale quantities.
        </p>
      </div>
      <div className="shrink-0">
        <Link
          to="/wholesale-apply"
          className="inline-flex items-center h-13 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] px-10 rounded-[3px] hover:bg-[#c49843] transition-colors duration-300 whitespace-nowrap"
        >
          Apply for Wholesale Access
        </Link>
      </div>
    </div>
  </div>
);

export default PromoBanner;
