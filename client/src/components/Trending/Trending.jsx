import { useState } from 'react';
import SectionTitle from '../shared/SectionTitle/SectionTitle';
import ProductsCarousel from '../Product/ProductsCarousel';
import { useProducts } from '../../hooks/queries';
import { normalizeProduct } from '../../lib/normalize';

const filterList = [
  { name: 'Fragrance Oils', value: 'fragrance-body-oils' },
  { name: 'Incense',        value: 'incense' },
  { name: 'Essential Oil',  value: 'essential-oil' },
  { name: 'Soap',           value: 'soap' },
  { name: 'Skin Care',      value: 'skin-care' },
];

const Trending = () => {
  const [activeFilter, setActiveFilter] = useState('fragrance-body-oils');

  const { data, isLoading } = useProducts({ category: activeFilter, limit: '12' });
  const displayed = (data?.data || []).map(normalizeProduct);

  return (
    <section className="overflow-x-hidden pt-8 md:pt-16 pb-8 md:pb-16">
      <div className="max-w-305 mx-auto px-4 md:px-10">
        <SectionTitle
          subTitle="Golden Fragrances"
          title="Trending products"
          body="Wholesale fragrance oils, incense, essential oils, soaps, and skin care — premium quality at unbeatable prices."
        />

        {/* Filter tabs */}
        <ul className="flex justify-center flex-wrap mb-6 md:mb-10 gap-y-2">
          {filterList.map((item) => (
            <li key={item.value} className="mx-1.5">
              <button
                onClick={() => setActiveFilter(item.value)}
                className={[
                  'px-4 md:px-7.5 h-10 leading-10 border text-sm md:text-base font-lato cursor-pointer transition-all duration-200',
                  activeFilter === item.value
                    ? 'bg-gold border-gold text-white'
                    : 'bg-[#faf9ff] border-[#eee] text-[#666] hover:opacity-80',
                ].join(' ')}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>

        {/* Carousel */}
        <div className="-mx-5.5">
          {isLoading ? (
            <div className="flex gap-4 px-5.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shrink-0 w-56 bg-white border border-[#efefef] animate-pulse">
                  <div className="aspect-square bg-linen/60" />
                  <div className="p-4 space-y-2">
                    <div className="h-2.5 bg-linen/60 rounded w-1/3" />
                    <div className="h-4 bg-linen/60 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ProductsCarousel products={displayed} />
          )}
        </div>
      </div>
    </section>
  );
};

export default Trending;
