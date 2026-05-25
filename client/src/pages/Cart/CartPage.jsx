import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, Tag } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

const QuantityStepper = ({ quantity, onDecrement, onIncrement }) => (
  <div className="flex items-center border border-[#ddd] rounded-lg overflow-hidden">
    <button
      onClick={onDecrement}
      className="w-9 h-9 flex items-center justify-center text-[#666] hover:bg-[#f5f5f5] hover:text-[#222] transition-colors duration-150 cursor-pointer"
      aria-label="Decrease quantity"
    >
      <Minus size={14} />
    </button>
    <span className="w-10 text-center font-lato font-bold text-[14px] text-[#222] select-none">
      {quantity}
    </span>
    <button
      onClick={onIncrement}
      className="w-9 h-9 flex items-center justify-center text-[#666] hover:bg-[#f5f5f5] hover:text-[#222] transition-colors duration-150 cursor-pointer"
      aria-label="Increase quantity"
    >
      <Plus size={14} />
    </button>
  </div>
);

const CartRow = ({ item, onRemove, onDecrement, onIncrement, showRange }) => {
  const rowTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
  return (
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
        {item.isStocked && (
          <span className="inline-block mt-1 font-lato text-[11px] text-green-600 uppercase tracking-[1px]">
            In Stock
          </span>
        )}
      </div>

      {/* Price — mobile: inline, desktop: own column */}
      <div className="sm:w-28 shrink-0">
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

      {/* Qty stepper */}
      <div className="shrink-0">
        <QuantityStepper
          quantity={item.quantity}
          onDecrement={onDecrement}
          onIncrement={onIncrement}
        />
      </div>

      {/* Row total */}
      <div className="sm:w-20 shrink-0 text-right">
        <span className="font-playfair font-bold text-[#222] text-[16px]">${rowTotal}</span>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="shrink-0 w-8 h-8 flex items-center justify-center text-[#ccc] hover:text-red-500 transition-colors duration-150 cursor-pointer"
        aria-label="Remove item"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

const CartPage = () => {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const { role } = useAuth();
  const showRange = role === 'wholesale' || role === 'admin';

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    // Placeholder — wire up real promo validation with backend
    setPromoApplied(!!promoCode.trim());
  };

  if (items.length === 0) {
    return (
      <div className="max-w-305 mx-auto px-4 md:px-10 py-20 md:py-40 text-center">
        <div className="w-20 h-20 rounded-full bg-[#faf9ff] flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={36} className="text-[#ccc]" />
        </div>
        <h2 className="font-playfair text-[28px] md:text-[36px] text-[#222] mb-4">Your cart is empty</h2>
        <p className="font-lato text-[14px] text-[#999] mb-10">
          Looks like you haven't added anything yet.
        </p>
        <Link
          to="/shop"
          className="inline-block h-13 leading-13 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] px-12 rounded-[3px] hover:bg-[#c49843] transition-colors duration-300"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-305 mx-auto px-4 md:px-10 py-10 md:py-16">
      {/* Page heading */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-playfair font-normal text-[28px] md:text-[36px] text-[#222]">
          Shopping Cart
          <span className="font-lato font-normal text-[16px] text-[#999] ml-3">
            ({items.reduce((s, i) => s + i.quantity, 0)} items)
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="font-lato text-[12px] uppercase tracking-[1.5px] text-[#999] hover:text-red-500 transition-colors duration-150 cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Table header — desktop only */}
      <div className="hidden sm:grid grid-cols-[1fr_7rem_auto_5rem_2rem] gap-4 items-center pb-3 border-b border-[#eee] mb-1">
        <span className="font-lato text-[11px] uppercase tracking-[1.5px] text-[#aaa]">Product</span>
        <span className="font-lato text-[11px] uppercase tracking-[1.5px] text-[#aaa]">Price</span>
        <span className="font-lato text-[11px] uppercase tracking-[1.5px] text-[#aaa]">Quantity</span>
        <span className="font-lato text-[11px] uppercase tracking-[1.5px] text-[#aaa] text-right">Total</span>
        <span />
      </div>

      {/* Cart rows */}
      <div>
        {items.map((item) => (
          <CartRow
            key={item.id}
            item={item}
            showRange={showRange}
            onRemove={() => removeItem(item.id)}
            onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
            onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
          />
        ))}
      </div>

      {/* Bottom — promo + totals */}
      <div className="flex flex-col lg:flex-row gap-8 mt-10">
        {/* Promo code */}
        <div className="flex-1 bg-[#faf9ff] rounded-xl p-6 md:p-8">
          <h4 className="font-playfair text-[20px] text-[#222] mb-2 flex items-center gap-2">
            <Tag size={18} className="text-gold" />
            Promo Code
          </h4>
          <p className="font-lato text-[13px] text-[#999] mb-5 leading-relaxed">
            Follow our social media and newsletter to receive exclusive promo codes and be the first to know about new products.
          </p>
          <form onSubmit={handleApplyPromo} className="flex gap-3">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="flex-1 h-12 px-4 border border-[#ddd] rounded-lg font-lato text-[14px] text-[#222] placeholder:text-[#bbb] outline-none focus:border-gold transition-colors duration-200"
            />
            <button
              type="submit"
              className="h-12 px-6 bg-dark-green text-linen font-lato font-bold text-sm uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors duration-300 cursor-pointer"
            >
              Apply
            </button>
          </form>
          {promoApplied && (
            <p className="font-lato text-[13px] text-green-600 mt-3">
              Promo code applied! (Backend integration needed for discount)
            </p>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:w-80 shrink-0 bg-white border border-[#f0f0f0] rounded-xl p-6 md:p-8">
          <h4 className="font-playfair text-[22px] text-[#222] mb-6">Order Summary</h4>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between font-lato text-[14px] text-[#666]">
              <span>Subtotal</span>
              <span className="text-[#222]">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-lato text-[14px] text-[#666]">
              <span>Promo discount</span>
              <span>{promoApplied ? '–$0.00' : 'None'}</span>
            </div>
            <div className="flex justify-between font-lato text-[14px] text-[#666]">
              <span>Shipping</span>
              <span className="text-green-600 font-bold">
                {total >= 50 ? 'FREE' : 'Calculated at checkout'}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-[#f0f0f0] pt-4 mb-6">
            <span className="font-playfair text-[18px] text-[#222]">Total</span>
            <span className="font-playfair font-bold text-[24px] text-gold">${total.toFixed(2)}</span>
          </div>

          <Link
            to="/checkout"
            className="block w-full text-center h-13 leading-13 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] rounded-lg hover:bg-[#c49843] transition-colors duration-300"
          >
            Proceed to Checkout
          </Link>

          <Link
            to="/shop"
            className="block text-center mt-4 font-lato text-[13px] text-[#999] hover:text-gold transition-colors duration-200"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
