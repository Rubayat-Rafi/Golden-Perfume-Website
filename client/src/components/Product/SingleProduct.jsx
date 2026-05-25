import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';

const SingleProduct = ({ product }) => {
  const { name, price, image, isSale, isNew, id, category, variants } = product;

  const { addItem, items: cartItems } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  const inCart       = cartItems.some((i) => i.id === id);
  const wishlisted   = isWishlisted(id);
  const isVariable   = variants?.length > 0;
  const displayPrice = isVariable ? variants[0].price : price;

  return (
    <Link
      to={`/product/${id}`}
      className="relative group bg-white border border-[#e8e8e8] hover:border-brand-green/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 block overflow-hidden"
    >
      {/* Badges */}
      <div className="absolute left-0 top-0 flex flex-col z-10">
        {isSale && (
          <span className="bg-gold text-dark-green py-1 px-2.5 uppercase font-bold text-[10px] leading-none font-lato">
            Sale
          </span>
        )}
        {isNew && (
          <span className={`bg-brand-green text-white py-1 px-2.5 uppercase font-bold text-[10px] leading-none font-lato ${isSale ? 'mt-0.5' : ''}`}>
            New
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#f8f8f8]">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 border-t border-[#f0f0f0]">
        {category && (
          <span className="font-lato text-[9px] uppercase tracking-[2px] text-brand-green block mb-1">
            {category}
          </span>
        )}
        <span className="font-playfair text-dark-green text-sm sm:text-[15px] capitalize block mb-2 group-hover:text-brand-green transition-colors duration-200 leading-tight">
          {name}
        </span>

        {/* Price + actions */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-playfair font-bold text-gold text-sm sm:text-base leading-none">
            {isVariable
              ? <><span className="font-lato font-normal text-dark-green/40 text-[11px] mr-1">From</span>${displayPrice}</>
              : `$${displayPrice}`
            }
          </span>

          <div className="flex gap-1.5" onClick={(e) => e.preventDefault()}>
            <button
              onClick={() => toggleItem(product)}
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                wishlisted
                  ? 'bg-gold border-gold text-dark-green'
                  : 'border-[#e0e0e0] text-dark-green/40 hover:border-brand-green hover:text-brand-green'
              }`}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={11} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
            {!isVariable && (
              <button
                onClick={() => !inCart && addItem(product, 1)}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  inCart
                    ? 'border-[#e0e0e0] text-dark-green/30 cursor-not-allowed'
                    : 'border-[#e0e0e0] text-dark-green/40 hover:border-brand-green hover:bg-brand-green hover:text-white'
                }`}
                aria-label={inCart ? 'Already in cart' : 'Add to cart'}
              >
                <ShoppingCart size={11} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SingleProduct;
