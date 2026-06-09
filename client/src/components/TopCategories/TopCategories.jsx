import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SliderLib from 'react-slick';
import SectionTitle from '../shared/SectionTitle/SectionTitle';
import { api } from '../../lib/api';
import { normalizeCategory } from '../../lib/normalize';

const Slider = SliderLib.default ?? SliderLib;

const toShopUrl = (slug) => {
  if (slug === 'new-arrival') return '/shop?new=1';
  return `/shop?category=${slug}`;
};

const ArrowBtn = ({ onClick, dir }) => (
  <button
    onClick={onClick}
    aria-label={dir === 'prev' ? 'Previous' : 'Next'}
    className={`
      absolute ${dir === 'prev' ? 'left-2 md:left-4' : 'right-2 md:right-4'}
      top-1/2 -translate-y-1/2 z-10
      w-8 h-8 md:w-10 md:h-10 rounded-full
      bg-white border border-[#e8e8e8] shadow-md
      flex items-center justify-center
      hover:bg-dark-green hover:border-dark-green group
      opacity-0 group-hover/carousel:opacity-100
      transition-all duration-200 cursor-pointer
    `}
  >
    {dir === 'prev'
      ? <ChevronLeft  size={16} className="text-[#888] group-hover:text-white transition-colors" />
      : <ChevronRight size={16} className="text-[#888] group-hover:text-white transition-colors" />
    }
  </button>
);

const CategoryCard = ({ cat }) => (
  <Link to={toShopUrl(cat.slug)} className="mx-0.5 block group">
    <div className="bg-white overflow-hidden border border-[#f0f0f0] shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={cat.image}
          alt={cat.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/10 transition-colors duration-300" />
      </div>
      <div className="px-1.5 py-2.5 text-center">
        <span className="font-lato text-[10px] md:text-[12px] text-[#444] leading-snug block capitalize font-bold tracking-[0.5px] line-clamp-2">
          {cat.name}
        </span>
      </div>
    </div>
  </Link>
);

const TopCategories = () => {
  const sliderRef = useRef(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories')
      .then((d) => setCategories(
        (d.data || []).map(normalizeCategory).filter((c) => !c.parent)  // top-level only
      ))
      .catch(() => {});
  }, []);

  const settings = {
    dots: false, arrows: false, infinite: true,
    autoplay: true, autoplaySpeed: 2200, speed: 600,
    cssEase: 'ease-in-out', pauseOnHover: true,
    slidesToShow: 9, slidesToScroll: 1,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 8 } },
      { breakpoint: 1024, settings: { slidesToShow: 6 } },
      { breakpoint: 768,  settings: { slidesToShow: 5 } },
      { breakpoint: 600,  settings: { slidesToShow: 4 } },
      { breakpoint: 480,  settings: { slidesToShow: 3 } },
      { breakpoint: 360,  settings: { slidesToShow: 2 } },
    ],
  };

  if (!categories.length) return null;

  return (
    <section className="overflow-hidden pt-8 md:pt-12 pb-8 md:pb-12 bg-cream">
      <div className="max-w-305 mx-auto px-4 md:px-10">
        <SectionTitle
          subTitle="Browse Collections"
          title="Shop by Category"
          body="From fragrance oils to herbal smudges — explore our full range of natural products."
        />
      </div>
      <div className="relative px-2 md:px-4 group/carousel">
        <ArrowBtn dir="prev" onClick={() => sliderRef.current?.slickPrev()} />
        <Slider ref={sliderRef} {...settings}>
          {categories.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </Slider>
        <ArrowBtn dir="next" onClick={() => sliderRef.current?.slickNext()} />
      </div>
    </section>
  );
};

export default TopCategories;
