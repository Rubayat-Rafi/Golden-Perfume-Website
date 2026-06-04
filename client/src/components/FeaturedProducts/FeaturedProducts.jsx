import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionTitle from '../shared/SectionTitle/SectionTitle';
import SingleProduct from '../Product/SingleProduct';
import { api } from '../../lib/api';
import { normalizeProduct } from '../../lib/normalize';

const SkeletonCard = () => (
  <div className="bg-white border border-[#e8e8e8] overflow-hidden animate-pulse">
    <div className="aspect-square bg-[#f0f0f0]" />
    <div className="p-3 sm:p-4">
      <div className="h-2.5 bg-[#f0f0f0] rounded w-1/3 mb-2" />
      <div className="h-4 bg-[#f0f0f0] rounded w-3/4 mb-3" />
      <div className="h-4 bg-[#f0f0f0] rounded w-1/4" />
    </div>
  </div>
);

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/products?featured=1&limit=8')
      .then((d) => setProducts((d.data || []).map(normalizeProduct)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="pt-8 md:pt-16 pb-8 md:pb-16 bg-cream">
      <div className="max-w-305 mx-auto px-4 md:px-10">
        <SectionTitle
          subTitle="Hand-Picked"
          title="Featured Products"
          body="Our most loved fragrances, botanicals, and skin care — hand-selected for quality and value."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((product) => (
                <SingleProduct key={product.id} product={product} />
              ))
          }
        </div>

        <div className="text-center mt-10">
          <Link
            to="/shop"
            className="inline-block h-12 leading-12 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] px-10 rounded-[3px] hover:bg-[#c49843] transition-colors duration-200"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
