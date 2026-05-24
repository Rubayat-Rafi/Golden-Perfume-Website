import { useState } from 'react';
import SectionTitle from '../shared/SectionTitle/SectionTitle';
import ProductsCarousel from '../Product/ProductsCarousel';
import products from '../../data/product/product.json';

const filterList = [
  { name: 'Make Up', value: 'makeup' },
  { name: 'SPA',     value: 'spa' },
  { name: 'Perfume', value: 'perfume' },
  { name: 'Nails',   value: 'nail' },
  { name: 'Skin care', value: 'skin' },
  { name: 'Hair care', value: 'hair' },
];

const Trending = () => {
  const [activeFilter, setActiveFilter] = useState('makeup');

  const displayed = products.filter((p) =>
    Array.isArray(p.filterItems) && p.filterItems.includes(activeFilter)
  );

  return (
    <section className="overflow-x-hidden pt-45 pb-32.5">
      <div className="max-w-305 mx-auto px-10">
        <SectionTitle
          subTitle="Cosmetics"
          title="Trending products"
          body="Nourish your skin with toxin-free cosmetic products. With the offers that you can't refuse."
        />

        {/* Filter tabs */}
        <ul className="flex justify-center flex-wrap mb-10 gap-y-2">
          {filterList.map((item) => (
            <li key={item.value} className="mx-1.75">
              <button
                onClick={() => setActiveFilter(item.value)}
                className={[
                  'px-7.5 h-10.25 leading-10 border text-base font-lato cursor-pointer transition-all duration-200',
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
          <ProductsCarousel products={displayed} />
        </div>
      </div>
    </section>
  );
};

export default Trending;
