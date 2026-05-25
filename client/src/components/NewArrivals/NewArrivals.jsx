import { Link } from 'react-router-dom';
import SectionTitle from '../shared/SectionTitle/SectionTitle';
import SingleProduct from '../Product/SingleProduct';
import products from '../../data/product/product.json';

const NewArrivals = () => {
  return (
    <section className="pt-8 md:pt-16 pb-8 md:pb-16">
      <div className="max-w-305 mx-auto px-4 md:px-10">
        <SectionTitle
          subTitle="Fragrances"
          title="New arrivals"
          body="Discover our latest hand-blended botanical perfumes, crafted in small batches from the finest natural ingredients."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((product) => (
            <SingleProduct key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/shop"
            className="inline-block h-12 leading-12 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] px-10 rounded-[3px] hover:bg-[#c49843] transition-colors duration-200"
          >
            Shop All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
