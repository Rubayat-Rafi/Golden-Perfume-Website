import { Link } from 'react-router-dom';
import SectionTitle from '../shared/SectionTitle/SectionTitle';
import SingleProduct from '../Product/SingleProduct';
import { useProducts } from '../../hooks/queries';
import { normalizeProduct } from '../../lib/normalize';

const DEMO_PRODUCTS = [
  {
    id: 'demo-rose-body-oil', slug: 'demo-rose-body-oil',
    name: 'Rose & Oud Body Oil', category: 'Fragrance & Body Oils',
    price: '24.99', image: '/assets/img/product-1.jpg',
    isSale: false, isNew: true, isFeatured: true, isStocked: true,
    variants: [], reviews: [],
  },
  {
    id: 'demo-arabian-incense', slug: 'demo-arabian-incense',
    name: 'Arabian Nights Incense', category: 'Incense',
    price: '14.99', image: '/assets/img/product-2.jpg',
    isSale: false, isNew: false, isFeatured: true, isStocked: true,
    variants: [], reviews: [],
  },
  {
    id: 'demo-black-seed-oil', slug: 'demo-black-seed-oil',
    name: 'Pure Black Seed Oil', category: 'Essential Oil',
    price: '19.99', image: '/assets/img/product-3.jpg',
    isSale: true, isNew: false, isFeatured: true, isStocked: true,
    variants: [], reviews: [],
  },
  {
    id: 'demo-turmeric-soap', slug: 'demo-turmeric-soap',
    name: 'Turmeric Glow Soap', category: 'Soap',
    price: '9.99', image: '/assets/img/product-4.jpg',
    isSale: false, isNew: true, isFeatured: true, isStocked: true,
    variants: [], reviews: [],
  },
];

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

const FeaturedProducts = () => {
  const { data, isLoading: loading } = useProducts({ featured: 1, limit: 8 });
  const products = (data?.data || []).map(normalizeProduct);

  return (
    <section className="py-6 md:py-10 bg-cream">
      <div className="max-w-305 mx-auto px-4 md:px-10">
        <SectionTitle
          subTitle="Hand-Picked"
          title="Featured Products"
          body="Our most loved fragrances, botanicals, and skin care — hand-selected for quality and value."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : (products.length > 0 ? products : DEMO_PRODUCTS).map((product) => (
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
