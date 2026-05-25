import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

const WishlistRow = ({ item, onRemove, onAddToCart, showRange, inCart }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-6 border-b border-[#f0f0f0] last:border-0">
    {/* Image */}
    <Link to={`/product/${item.id}`} className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-dark-green">
      <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
    </Link>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <Link to={`/product/${item.id}`} className="font-playfair text-[16px] text-[#222] hover:text-gold transition-colors duration-200 line-clamp-1 block">
        {item.name}
      </Link>
      <p className="font-lato text-[11px] text-[#999] uppercase tracking-[1px] mt-0.5">
        SKU: {item.productNumber}
      </p>
      <p className="font-lato text-[12px] text-[#aaa] mt-1">{item.category}</p>
    </div>

    {/* Price */}
    <div className="sm:w-32 shrink-0">
      {item.oldPrice ? (
        <>
          <span className="font-lato text-[12px] text-[#aaa] line-through block">${item.oldPrice}</span>
          <span className="font-playfair font-bold text-gold text-[16px]">${item.price}</span>
        </>
      ) : showRange && item.priceMax ? (
        <span className="font-playfair font-bold text-gold text-[16px]">
          ${item.price}
          <span className="font-normal text-[13px] text-mid-green ml-0.5">– ${item.priceMax}</span>
        </span>
      ) : (
        <span className="font-playfair font-bold text-gold text-[16px]">${item.price}</span>
      )}
    </div>

    {/* Stock status */}
    <div className="sm:w-28 shrink-0">
      {item.isStocked ? (
        <span className="inline-block px-3 py-1 bg-green-50 text-green-600 font-lato font-bold text-[11px] uppercase tracking-[1px] rounded-full">
          In Stock
        </span>
      ) : (
        <span className="inline-block px-3 py-1 bg-[#f5f5f5] text-[#aaa] font-lato font-bold text-[11px] uppercase tracking-[1px] rounded-full">
          Unavailable
        </span>
      )}
    </div>

    {/* Actions */}
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={onAddToCart}
        disabled={!item.isStocked || inCart}
        className={`flex items-center gap-2 h-9 px-4 rounded-lg font-lato font-bold text-[12px] uppercase tracking-[1px] transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          inCart
            ? 'bg-[#f0f0f0] text-[#aaa]'
            : 'bg-gold text-dark-green hover:bg-[#c49843]'
        }`}
        aria-label="Add to cart"
      >
        <ShoppingCart size={13} />
        {inCart ? 'In Cart' : 'Add to Cart'}
      </button>

      <button
        onClick={onRemove}
        className="w-8 h-8 flex items-center justify-center text-[#ccc] hover:text-red-500 transition-colors duration-150 cursor-pointer"
        aria-label="Remove from wishlist"
      >
        <Trash2 size={15} />
      </button>
    </div>
  </div>
);

const WishlistPage = () => {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem, items: cartItems } = useCart();
  const { role } = useAuth();
  const showRange = role === 'wholesale' || role === 'admin';

  const handleAddToCart = (product) => {
    addItem(product, 1);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-305 mx-auto px-4 md:px-10 py-20 md:py-40 text-center">
        <div className="w-20 h-20 rounded-full bg-[#faf9ff] flex items-center justify-center mx-auto mb-6">
          <Heart size={36} className="text-[#ccc]" />
        </div>
        <h2 className="font-playfair text-[28px] md:text-[36px] text-[#222] mb-4">Your wishlist is empty</h2>
        <p className="font-lato text-[14px] text-[#999] mb-10">
          Save items you love and come back to them anytime.
        </p>
        <Link
          to="/shop"
          className="inline-block h-13 leading-13 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] px-12 rounded-[3px] hover:bg-[#c49843] transition-colors duration-300"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-305 mx-auto px-4 md:px-10 py-10 md:py-16">
      {/* Page heading */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-playfair font-normal text-[28px] md:text-[36px] text-[#222]">
          My Wishlist
          <span className="font-lato font-normal text-[16px] text-[#999] ml-3">
            ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
        </h1>
        <button
          onClick={clearWishlist}
          className="font-lato text-[12px] uppercase tracking-[1.5px] text-[#999] hover:text-red-500 transition-colors duration-150 cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Table header — desktop only */}
      <div className="hidden sm:grid grid-cols-[1fr_8rem_7rem_auto] gap-4 items-center pb-3 border-b border-[#eee] mb-1">
        <span className="font-lato text-[11px] uppercase tracking-[1.5px] text-[#aaa]">Product</span>
        <span className="font-lato text-[11px] uppercase tracking-[1.5px] text-[#aaa]">Price</span>
        <span className="font-lato text-[11px] uppercase tracking-[1.5px] text-[#aaa]">Status</span>
        <span className="font-lato text-[11px] uppercase tracking-[1.5px] text-[#aaa]">Actions</span>
      </div>

      {/* Wishlist rows */}
      <div>
        {items.map((item) => (
          <WishlistRow
            key={item.id}
            item={item}
            showRange={showRange}
            inCart={cartItems.some((c) => c.id === item.id)}
            onRemove={() => removeItem(item.id)}
            onAddToCart={() => handleAddToCart(item)}
          />
        ))}
      </div>

      {/* Footer buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-10">
        <button
          onClick={clearWishlist}
          className="h-13 px-10 border border-[#ddd] text-[#666] font-lato font-bold text-sm uppercase tracking-[2px] rounded-[3px] hover:border-[#aaa] hover:text-[#222] transition-colors duration-300 cursor-pointer"
        >
          Clear Wishlist
        </button>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center h-13 px-10 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] rounded-[3px] hover:bg-[#c49843] transition-colors duration-300"
        >
          Go Shopping
        </Link>
      </div>
    </div>
  );
};

export default WishlistPage;
