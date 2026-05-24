import SectionTitle from '../shared/SectionTitle/SectionTitle';
import ProductsCarousel from '../Product/ProductsCarousel';
import products from '../../data/product/product.json';

const NewArrivals = () => {
  return (
    <section className="overflow-x-hidden pt-47 pb-32.5">
      <div className="max-w-305 mx-auto px-10">
        <SectionTitle
          subTitle="Fragrances"
          title="New arrivals"
          body="Discover our latest hand-blended botanical perfumes, crafted in small batches from the finest natural ingredients."
        />
        <div className="-mx-5.5">
          <ProductsCarousel products={products} />
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
