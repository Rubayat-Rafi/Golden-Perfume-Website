import { useRef } from 'react';
import SliderLib from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SingleProduct from './SingleProduct';

const Slider = SliderLib.default ?? SliderLib;

const ArrowBtn = ({ onClick, disabled, dir }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`absolute ${dir === 'prev' ? 'left-2 md:left-9' : 'right-2 md:right-9'} top-[45%] -translate-y-1/2 w-8 h-12 md:w-10 md:h-15 bg-[#faf9ff] border border-[#eee] flex items-center justify-center hover:bg-dark-green hover:border-dark-green group transition-all duration-300 z-10 disabled:opacity-50 disabled:pointer-events-none cursor-pointer`}
  >
    {dir === 'prev'
      ? <ChevronLeft size={18} className="text-[#999] group-hover:text-white transition-colors duration-300" />
      : <ChevronRight size={18} className="text-[#999] group-hover:text-white transition-colors duration-300" />
    }
  </button>
);

const ProductsCarousel = ({ products }) => {
  const sliderRef = useRef(null);

  const settings = {
    dots: false,
    infinite: false,
    arrows: false,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 1,
    lazyLoad: 'progressive',
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 1023, settings: { slidesToShow: 2 } },
      { breakpoint: 650,  settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="relative px-12 md:px-28.75">
      <ArrowBtn dir="prev" onClick={() => sliderRef.current?.slickPrev()} />
      <Slider ref={sliderRef} {...settings}>
        {products.map((product) => (
          <SingleProduct key={product.id} product={product} />
        ))}
      </Slider>
      <ArrowBtn dir="next" onClick={() => sliderRef.current?.slickNext()} />
    </div>
  );
};

export default ProductsCarousel;
