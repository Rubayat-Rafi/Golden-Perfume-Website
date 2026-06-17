import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const POINTS = [
  'Cold-pressed essential oils & botanical extracts',
  'Hand-blended in small batches, never mass-produced',
  'Ethically sourced from trusted growers worldwide',
];

const BrandStory = () => (
  <section className="py-7 md:py-12 bg-white">
    <div className="max-w-305 mx-auto px-4 md:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">

        {/* Images */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            <img src="/assets/brand/about-1.jpg" alt="" className="w-full h-72 md:h-96 object-cover" />
            <img src="/assets/brand/about-2.jpg" alt="" className="w-full h-72 md:h-96 object-cover mt-8" />
          </div>
          {/* floating badge */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-brand-green text-white px-7 py-4 text-center shadow-xl">
            <p className="font-playfair text-[26px] leading-none">15+</p>
            <p className="font-lato text-[10px] uppercase tracking-[2px] mt-1 text-gold">Years of Craft</p>
          </div>
        </div>

        {/* Text */}
        <div>
          <span className="font-lato text-brand-green text-[12px] uppercase tracking-[4px] block mb-4">Our Story</span>
          <h2 className="font-playfair font-normal text-[28px] md:text-[40px] text-dark-green leading-tight mb-5">
            Pure Ingredients,<br />Powerful Confidence
          </h2>
          <p className="font-lato text-[15px] text-forest/70 leading-relaxed mb-6 max-w-xl">
            Since 2010, Golden Perfume has crafted natural fragrances and botanicals in the heart of New Orleans.
            We believe beauty should be honest — made from real, responsibly sourced ingredients you can trust.
          </p>
          <ul className="flex flex-col gap-3 mb-8">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-brand-green/15 flex items-center justify-center mt-0.5">
                  <Check size={12} className="text-brand-green" />
                </span>
                <span className="font-lato text-[14px] text-dark-green/80 leading-snug">{p}</span>
              </li>
            ))}
          </ul>
          <Link to="/shop"
            className="inline-flex items-center justify-center h-12 px-10 bg-brand-green text-white font-lato font-bold text-[12px] uppercase tracking-[2px] rounded-[3px] hover:bg-brand-green transition-colors duration-300">
            Explore Our Collection
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default BrandStory;
