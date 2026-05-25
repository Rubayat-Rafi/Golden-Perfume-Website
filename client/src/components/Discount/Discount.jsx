import { Link } from 'react-router-dom';

const Discount = () => {
  return (
    <div
      className="py-12 md:py-20 lg:py-28 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/img/discount-bg.jpg')" }}
    >
      <div className="max-w-305 mx-auto px-4 md:px-10 flex justify-center md:justify-end">
        <div className="w-full md:max-w-116.25 md:mr-21 text-center md:text-left">
          <span className="font-lato text-gold text-[32px] sm:text-[44px] lg:text-[60px] uppercase tracking-[4px] block mb-3 md:mb-5 md:pl-2.25">
            Discount
          </span>
          <span className="font-playfair text-white text-[38px] sm:text-[52px] lg:text-[72px] leading-[1.1] block mb-5 md:mb-7.5 mt-2 capitalize">
            Get Your <span>50%</span> Off
          </span>
          <p className="font-playfair text-[16px] md:text-[20px] leading-[150%] text-white/80 md:pl-2.5">
            Nourish your skin with toxin-free cosmetic products. With the
            offers that you can&apos;t refuse.
          </p>
          <Link
            to="/shop"
            className="inline-block mt-8 md:mt-15 md:ml-2.5 h-15 leading-15 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] px-8 md:px-12.5 rounded-[3px] hover:bg-[#c49843] transition-colors duration-200"
          >
            get now!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Discount;
