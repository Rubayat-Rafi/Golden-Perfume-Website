import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';

// Each slide: a headline (with a highlighted word), subtitle, and the
// product images that fill the left + right mosaic columns.
const SLIDES = [
  {
    eyebrow: 'New Orleans · Est. 2010',
    lead: 'Let Nature',
    accent: 'Light Up',
    tail: 'Your Beauty',
    subtitle: ['Pure Ingredients', 'Powerful Confidence'],
    left:  ['/assets/img/product-img1.jpg', '/assets/img/product-img2.jpg', '/assets/img/product-img3.jpg'],
    right: ['/assets/img/product-img4.jpg', '/assets/brand/cat-essential.jpg', '/assets/img/product-img5.jpg'],
  },
  {
    eyebrow: 'Hand-Blended · Small Batch',
    lead: 'Botanical',
    accent: 'Fragrances',
    tail: 'You Will Love',
    subtitle: ['Natural Oils', 'Lasting Impressions'],
    left:  ['/assets/brand/cat-oils-flowers.jpg', '/assets/img/product-img6.jpg', '/assets/img/product-img7.jpg'],
    right: ['/assets/img/product-img8.jpg', '/assets/img/product-img9.jpg', '/assets/brand/cat-fragrance.jpg'],
  },
  {
    eyebrow: 'Retail & Wholesale',
    lead: 'Crafted From',
    accent: 'The Finest',
    tail: 'Ingredients',
    subtitle: ['Ethically Sourced', 'Beautifully Made'],
    left:  ['/assets/brand/cat-soap.jpg', '/assets/img/product-img2.jpg', '/assets/img/product-img5.jpg'],
    right: ['/assets/img/product-img1.jpg', '/assets/brand/cat-herbs.jpg', '/assets/img/product-img4.jpg'],
  },
];

const GREEN_GRADIENT = 'linear-gradient(165deg, #2E8B57 0%, #1E7A45 48%, #14532D 100%)';

// A single staggered 2-column image mosaic (3 tiles)
const Mosaic = ({ images, side }) => (
  <div className="hidden lg:grid grid-cols-2 gap-4">
    <div className={`flex flex-col gap-4 ${side === 'left' ? 'mt-10' : ''}`}>
      <MosaicTile src={images[0]} tall delay="0s" />
      <MosaicTile src={images[1]} delay="1.2s" />
    </div>
    <div className={`flex flex-col gap-4 ${side === 'right' ? 'mt-10' : ''}`}>
      <MosaicTile src={images[2]} delay="0.6s" />
    </div>
  </div>
);

const MosaicTile = ({ src, tall, delay }) => (
  <div
    className={`overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(31,122,63,0.12)] bg-cream ${tall ? 'aspect-3/4' : 'aspect-square'}`}
    style={{ animation: `heroFloat 6s ease-in-out ${delay} infinite` }}
  >
    <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
  </div>
);

// Fallback hero (shown when no banners are uploaded in the admin)
const MosaicHero = () => {
  const [slide, setSlide] = useState(0);

  const next = useCallback(() => setSlide((s) => (s + 1) % SLIDES.length), []);
  const prev = useCallback(() => setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length), []);

  // Auto-advance
  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  const s = SLIDES[slide];

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Soft brand-green decorative blobs */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-brand-green/5 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />

      {/* Carousel arrows */}
      <button onClick={prev} aria-label="Previous"
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-[#e8e8e8] shadow-md flex items-center justify-center text-dark-green/60 hover:bg-dark-green hover:text-white hover:border-dark-green transition-colors cursor-pointer">
        <ChevronLeft size={20} />
      </button>
      <button onClick={next} aria-label="Next"
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-[#e8e8e8] shadow-md flex items-center justify-center text-dark-green/60 hover:bg-dark-green hover:text-white hover:border-dark-green transition-colors cursor-pointer">
        <ChevronRight size={20} />
      </button>

      <div className="relative z-10 max-w-7xl mx-auto px-12 md:px-16 py-12 lg:py-16">
        <div className="grid lg:grid-cols-[1fr_minmax(0,560px)_1fr] items-center gap-6 xl:gap-10">

          {/* Left mosaic */}
          <Mosaic key={`l-${slide}`} images={s.left} side="left" />

          {/* Center content */}
          <div key={`c-${slide}`} className="text-center px-2" style={{ animation: 'heroSlideFade 0.6s ease' }}>
            <span className="font-lato text-brand-green text-[11px] sm:text-[12px] uppercase tracking-[4px] block mb-4">
              {s.eyebrow}
            </span>

            <h1 className="font-playfair font-bold leading-[1.05] text-[40px] sm:text-[52px] md:text-[58px] xl:text-[68px] mb-5">
              <span className="block text-dark-green">{s.lead}</span>
              <span className="block bg-clip-text text-transparent" style={{ backgroundImage: GREEN_GRADIENT }}>
                {s.accent}
              </span>
              <span className="block text-dark-green">{s.tail}</span>
            </h1>

            <p className="font-playfair italic text-gold text-[18px] sm:text-[22px] md:text-[24px] leading-snug mb-8">
              {s.subtitle[0]}<br />{s.subtitle[1]}
            </p>

            <Link to="/shop"
              className="inline-flex items-center justify-center h-12 md:h-13 bg-dark-green text-linen font-lato font-bold text-[12px] md:text-[13px] uppercase tracking-[2px] px-10 md:px-12 rounded-full hover:bg-brand-green transition-colors duration-300">
              Shop Now
            </Link>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${i === slide ? 'w-7 bg-brand-green' : 'w-2 bg-dark-green/20 hover:bg-dark-green/40'}`} />
              ))}
            </div>
          </div>

          {/* Right mosaic */}
          <Mosaic key={`r-${slide}`} images={s.right} side="right" />
        </div>

        {/* Mobile image strip */}
        <div key={`m-${slide}`} className="lg:hidden flex gap-3 mt-8 -mx-12 px-12 overflow-x-auto pb-2" style={{ animation: 'heroSlideFade 0.6s ease' }}>
          {[...s.left, ...s.right].map((src, i) => (
            <div key={i} className="shrink-0 w-28 h-36 rounded-xl overflow-hidden shadow-[0_8px_20px_rgba(31,122,63,0.12)]">
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Dynamic banner carousel (admin-uploaded clickable images) ───────────────
const isExternal = (url) => /^https?:\/\//i.test(url);

const BannerSlide = ({ banner }) => {
  const img = (
    <img
      src={banner.image}
      alt={banner.title || 'Banner'}
      className="w-full h-full object-cover"
    />
  );
  const cls = 'block w-full h-full';
  if (!banner.link) return <div className={cls}>{img}</div>;
  if (isExternal(banner.link))
    return <a href={banner.link} target="_blank" rel="noopener noreferrer" className={cls}>{img}</a>;
  return <Link to={banner.link} className={cls}>{img}</Link>;
};

const BannerCarousel = ({ banners }) => {
  const [slide, setSlide] = useState(0);
  const count = banners.length;

  const next = useCallback(() => setSlide((s) => (s + 1) % count), [count]);
  const prev = useCallback(() => setSlide((s) => (s - 1 + count) % count), [count]);

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, count]);

  return (
    <section className="relative overflow-hidden bg-dark-green group">
      {/* Slides track */}
      <div
        className="flex transition-transform duration-700 ease-in-out h-[42vw] max-h-140 min-h-55"
        style={{ transform: `translateX(-${slide * 100}%)` }}
      >
        {banners.map((b) => (
          <div key={b._id} className="w-full h-full shrink-0">
            <BannerSlide banner={b} />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          {/* Arrows */}
          <button onClick={prev} aria-label="Previous"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/85 backdrop-blur border border-white/40 shadow-md flex items-center justify-center text-dark-green hover:bg-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next} aria-label="Next"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/85 backdrop-blur border border-white/40 shadow-md flex items-center justify-center text-dark-green hover:bg-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${i === slide ? 'w-7 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

// ── Smart Banner: uploaded banners if any, else the mosaic fallback ─────────
const Banner = () => {
  const [banners, setBanners] = useState(null); // null = loading

  useEffect(() => {
    api.get('/banners')
      .then((d) => setBanners(d.data || []))
      .catch(() => setBanners([]));
  }, []);

  if (banners === null) {
    // Brief placeholder to avoid layout flash while fetching
    return <div className="bg-cream min-h-55 md:min-h-80" />;
  }

  return banners.length > 0 ? <BannerCarousel banners={banners} /> : <MosaicHero />;
};

export default Banner;
