import { Link } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

const CartSidebar = () => {
  const { items, removeItem, updateQuantity, closeSidebar, sidebarOpen, total } = useCart();

  return (
    <>
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-150 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Panel */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white z-151 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0] shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={18} className="text-dark-green" />
            <h2 className="font-playfair text-[17px] text-dark-green">Your Cart</h2>
            {items.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-dark-green text-white font-lato font-bold text-[10px] flex items-center justify-center">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#888] hover:text-dark-green hover:bg-[#f5f5f5] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
              <ShoppingBag size={40} className="text-[#ddd]" />
              <p className="font-playfair text-[18px] text-dark-green">Your cart is empty</p>
              <p className="font-lato text-[13px] text-[#aaa]">Add some products to get started</p>
              <Link
                to="/shop"
                onClick={closeSidebar}
                className="mt-2 h-10 px-7 bg-dark-green text-linen font-lato font-bold text-[11px] uppercase tracking-[1.5px] rounded-sm flex items-center hover:bg-forest transition-colors"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#f5f5f5]">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3.5 px-5 py-4">
                  {/* Image */}
                  <Link to={`/product/${item.id}`} onClick={closeSidebar} className="shrink-0">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md bg-[#f5f5f5]" />
                      : <div className="w-16 h-16 rounded-md bg-[#f5f5f5] flex items-center justify-center"><ShoppingBag size={18} className="text-[#ccc]" /></div>
                    }
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {item.category && (
                        <span className="font-lato text-[9px] uppercase tracking-[1.5px] text-brand-green block mb-0.5">{item.category}</span>
                      )}
                      <Link
                        to={`/product/${item.id}`}
                        onClick={closeSidebar}
                        className="font-lato text-[13px] text-dark-green font-semibold leading-tight hover:text-brand-green transition-colors line-clamp-2 block"
                      >
                        {item.name}
                      </Link>
                      <p className="font-playfair text-[14px] text-gold font-bold mt-0.5">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Qty + remove */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-[#e8e8e8] rounded-md overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#666] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-8 text-center font-lato text-[13px] text-dark-green font-semibold select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#666] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-7 h-7 flex items-center justify-center text-[#bbb] hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-[#f0f0f0] px-5 py-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="font-lato text-[13px] text-[#666]">Subtotal</span>
              <span className="font-playfair text-[17px] font-bold text-dark-green">${total.toFixed(2)}</span>
            </div>
            <div className="flex gap-2.5">
              <Link
                to="/cart"
                onClick={closeSidebar}
                className="flex-1 h-11 flex items-center justify-center border border-dark-green text-dark-green font-lato font-bold text-[11px] uppercase tracking-[1.5px] rounded-sm hover:bg-dark-green hover:text-linen transition-colors"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={closeSidebar}
                className="flex-1 h-11 flex items-center justify-center bg-dark-green text-linen font-lato font-bold text-[11px] uppercase tracking-[1.5px] rounded-sm hover:bg-forest transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
