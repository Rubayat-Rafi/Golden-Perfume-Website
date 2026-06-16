import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBanners } from '../../hooks/queries';

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
    <section className="relative overflow-hidden bg-dark-green/10 group w-full aspect-96/35 min-h-30">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
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
          <button onClick={prev} aria-label="Previous"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/85 backdrop-blur border border-white/40 shadow-md flex items-center justify-center text-dark-green hover:bg-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next} aria-label="Next"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/85 backdrop-blur border border-white/40 shadow-md flex items-center justify-center text-dark-green hover:bg-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
            <ChevronRight size={20} />
          </button>

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

// ── Smart Banner: shows carousel when banners are available, skeleton otherwise ─
const Banner = () => {
  const { data: banners, isLoading } = useBanners();

  if (!isLoading && banners?.length > 0) {
    return <BannerCarousel banners={banners} />;
  }

  return <div className="w-full aspect-96/35 min-h-30 bg-[#e8e8e8] animate-pulse" />;
};

export default Banner;
