import { Link } from 'react-router-dom';
import { Search, Heart, ShoppingCart } from 'lucide-react';

const SingleProduct = ({ product, onAddToWish, onAddToCart, addedInCart }) => {
  const { name, oldPrice, price, image, isSale, isNew, id, category } = product;

  return (
    <div className="mx-3.75 relative group bg-dark-green rounded-2.5 overflow-hidden">
      {/* Sale / New badges */}
      <div className="absolute right-0 top-0 flex flex-col z-1">
        {isSale && (
          <span className="bg-gold text-dark-green py-2.5 px-6.25 uppercase font-bold text-sm leading-none font-lato">
            sale
          </span>
        )}
        {isNew && (
          <span className="bg-mid-green/80 text-white py-2.5 px-6.25 uppercase font-bold text-sm leading-none font-lato">
            new
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative h-70">
        <img src={image} alt={name} className="w-full h-full object-cover" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-between py-7.5">
          <Link
            to={`/product/${id}`}
            className="text-white mt-auto mb-auto"
            aria-label="View product"
          >
            <Search size={48} strokeWidth={1.5} />
          </Link>
          <div className="flex gap-5">
            <button
              onClick={() => onAddToWish?.(id)}
              className="w-15 h-15 rounded-full bg-white flex items-center justify-center shadow-lg hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Add to wishlist"
            >
              <Heart size={20} className="text-[#222]" />
            </button>
            <button
              onClick={() => onAddToCart?.(id)}
              disabled={addedInCart}
              className={`w-15 h-15 rounded-full flex items-center justify-center shadow-lg hover:opacity-80 transition-opacity cursor-pointer ${addedInCart ? 'bg-[#9a9291]' : 'bg-gold'}`}
              aria-label="Add to cart"
            >
              <ShoppingCart size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {category && (
          <span className="font-lato text-[9px] uppercase tracking-[1.5px] text-mid-green block mb-1.5">
            {category}
          </span>
        )}
        <Link to={`/product/${id}`}>
          <span className="font-playfair text-linen text-2xl capitalize block mb-2.25 hover:text-gold transition-colors duration-200 leading-tight px-0.75">
            {name}
          </span>
        </Link>
        <span className="flex items-center font-playfair font-bold text-gold text-lg leading-[170%]">
          {oldPrice && (
            <span className="text-mid-green text-base line-through mr-2.5 font-normal">
              ${oldPrice}
            </span>
          )}
          ${price}
        </span>
      </div>
    </div>
  );
};

export default SingleProduct;
