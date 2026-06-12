import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CARDS = [
  { label: 'For Him', sub: 'Bold, woody & long-lasting', to: '/shop?gender=men',   img: '/assets/brand/cat-fragrance.jpg' },
  { label: 'For Her', sub: 'Floral, warm & captivating', to: '/shop?gender=women', img: '/assets/brand/cat-perfume-flowers.jpg' },
];

const ShopByGender = () => (
  <section className="py-6 md:py-10 bg-cream">
    <div className="max-w-305 mx-auto px-4 md:px-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CARDS.map((c) => (
          <Link key={c.label} to={c.to}
            className="group relative overflow-hidden h-64 md:h-80 flex items-end">
            <img src={c.img} alt={c.label}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-linear-to-r from-[rgba(20,40,25,0.78)] via-[rgba(20,40,25,0.35)] to-transparent" />
            <div className="relative z-10 p-7 md:p-9">
              <span className="font-lato text-gold text-[11px] uppercase tracking-[3px] block mb-2">Collection</span>
              <h3 className="font-playfair text-[28px] md:text-[34px] text-white leading-none mb-2">{c.label}</h3>
              <p className="font-lato text-[13px] text-white/70 mb-5 max-w-xs">{c.sub}</p>
              <span className="inline-flex items-center gap-2 font-lato font-bold text-[12px] uppercase tracking-[2px] text-white border-b border-gold/60 pb-1 group-hover:gap-3 transition-all">
                Shop Now <ArrowRight size={15} className="text-gold" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default ShopByGender;
