import { Link } from 'react-router-dom';
import SectionTitle from '../shared/SectionTitle/SectionTitle';
import SingleProduct from '../Product/SingleProduct';
import { useProducts } from '../../hooks/queries';
import { normalizeProduct } from '../../lib/normalize';

const SkeletonCard = () => (
  <div className="bg-cream border border-linen overflow-hidden animate-pulse rounded-sm">
    <div className="aspect-square bg-linen/60" />
    <div className="p-3 sm:p-4">
      <div className="h-2.5 bg-linen/60 rounded w-1/3 mb-2" />
      <div className="h-4 bg-linen/60 rounded w-3/4 mb-3" />
      <div className="h-4 bg-linen/60 rounded w-1/4" />
    </div>
  </div>
);

const NewArrivals = () => {
  const { data, isLoading: loading } = useProducts({ isNew: 1, limit: 8 });
  const products = (data?.data || []).map(normalizeProduct);

  return (
    <section className="py-6 md:py-10 bg-cream">
      <div className="max-w-305 mx-auto px-4 md:px-10">
        <SectionTitle
          subTitle="Fragrances"
          title="New Arrivals"
          body="Discover our latest hand-blended botanical perfumes, crafted in small batches from the finest natural ingredients."
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
            to="/shop?isNew=1"
            className="inline-block h-12 leading-12 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] px-10 rounded-[3px] hover:bg-[#c49843] transition-colors duration-200"
          >
            Shop All New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
