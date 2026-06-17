import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/queries';
import { normalizeCategory } from '../../lib/normalize';

const toShopUrl = (slug) => {
  if (slug === 'new-arrival') return '/shop?new=1';
  return `/shop?category=${slug}`;
};

const CategoryCard = ({ cat }) => (
  <Link to={toShopUrl(cat.slug)} className="block group text-center">
    {/* Circular image */}
    <div className="relative mx-auto mb-3 overflow-hidden
                    w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32
                    border-2 border-linen group-hover:border-brand-green/50
                    shadow-[0_4px_16px_rgba(20,40,25,0.07)]
                    group-hover:shadow-[0_8px_28px_rgba(20,40,25,0.14)]
                    transition-all duration-300">
      {cat.image ? (
        <img
          src={cat.image}
          alt={cat.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-brand-green/8">
          <span className="font-playfair text-[28px] text-brand-green/40">{cat.name.charAt(0)}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-dark-green/0 group-hover:bg-forest/18  transition-colors duration-300" />
    </div>

    {/* Label */}
    <span className="font-lato text-[10px] sm:text-[11px] uppercase tracking-[1.5px] text-dark-green group-hover:text-brand-green transition-colors block font-bold leading-snug line-clamp-2">
      {cat.name}
    </span>

    {/* Gold underline animation */}
    <span className="block mt-1.5 h-px w-0 group-hover:w-6 mx-auto bg-gold transition-all duration-300" />
  </Link>
);

const TopCategories = () => {
  const { data: raw = [] } = useCategories();
  const categories = raw.map(normalizeCategory).filter((c) => !c.parent);

  if (!categories.length) return null;

  return (
    <section className="py-7 md:py-10 bg-white">
      <div className="max-w-305 mx-auto px-4 md:px-10">

        {/* Section header */}
        <div className="text-center mb-8 md:mb-10">
          <span className="font-lato text-[11px] uppercase tracking-[4px] text-gold block mb-2">
            Explore
          </span>
          <h2 className="font-playfair font-normal text-[26px] md:text-[34px] text-dark-green">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-1 gap-y-4 sm:gap-x-2 sm:gap-y-5 md:gap-x-3 md:gap-y-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default TopCategories;
