import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';

const SingleProduct = ({ product }) => {
  const { name, price, image, isSale, isNew, id, category, variants } = product;

  const { addItem, openSidebar } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { role } = useAuth();

  const wishlisted      = isWishlisted(id);
  const isVariable      = variants?.length > 0;
  const displayPrice    = isVariable ? variants[0].price : price;
  const isWholesale     = role === 'wholesale';
  const wholesalePrice  = isVariable ? variants[0]?.wholesalePrice : null;
  const showWholesale   = isWholesale && wholesalePrice;

  return (
    <Link
      to={`/product/${id}`}
      className="relative group bg-white border border-[#efefef] shadow-[0_2px_14px_rgba(20,40,25,0.05)] hover:border-brand-green/50 hover:shadow-[0_6px_22px_rgba(20,40,25,0.12)] transition-all duration-300 block overflow-hidden rounded-sm"
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

      {/* Image + hover action bar */}
      <div className="relative aspect-square overflow-hidden bg-[#f8f8f8]">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Hover action bar */}
        <div
          className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <div className="flex">
            <button
              onClick={(e) => {
              e.preventDefault(); e.stopPropagation();
              addItem(showWholesale ? { ...product, price: wholesalePrice } : product, 1);
              openSidebar();
            }}
              className="flex-1 h-10 bg-dark-green/90 backdrop-blur-sm text-linen font-lato text-[11px] font-bold uppercase tracking-[1px] flex items-center justify-center gap-1.5 hover:bg-dark-green transition-colors cursor-pointer"
            >
              <ShoppingCart size={13} />
              Add to Cart
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleItem(product); }}
              className={`w-10 h-10 flex items-center justify-center border-l border-white/20 backdrop-blur-sm transition-colors cursor-pointer ${
                wishlisted
                  ? 'bg-gold/90 text-dark-green hover:bg-gold'
                  : 'bg-dark-green/90 text-white/80 hover:bg-dark-green hover:text-white'
              }`}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 border-t border-[#efefef]">
        {category && (
          <span className="font-lato text-[9px] uppercase tracking-[2px] text-brand-green block mb-1">
            {category}
          </span>
        )}
        <span className="font-playfair text-dark-green text-sm sm:text-[15px] capitalize block mb-1.5 group-hover:text-brand-green transition-colors duration-200 leading-tight">
          {name}
        </span>

        {showWholesale ? (
          <div className="flex flex-col gap-0.5">
            <span className="font-playfair font-bold text-brand-green text-sm sm:text-base leading-none">
              {isVariable && (
                <span className="font-lato font-normal text-brand-green/60 text-[10px] mr-1">From</span>
              )}
              ${wholesalePrice}
              <span className="font-lato font-normal text-brand-green/60 text-[10px] ml-1">wholesale</span>
            </span>
            <span className="font-lato text-dark-green/40 text-[11px] line-through">${displayPrice} retail</span>
          </div>
        ) : (
          <span className="font-playfair font-bold text-gold text-sm sm:text-base leading-none">
            {isVariable
              ? <><span className="font-lato font-normal text-dark-green/40 text-[11px] mr-1">From</span>${displayPrice}</>
              : `$${displayPrice}`
            }
          </span>
        )}
      </div>
    </Link>
  );
};

export default SingleProduct;
