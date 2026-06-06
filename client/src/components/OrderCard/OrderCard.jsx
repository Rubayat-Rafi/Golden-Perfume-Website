import { useState } from 'react';
import { Package, ChevronDown } from 'lucide-react';

// ── shared formatters / badge (used by Profile + Wholesale dashboards) ──
export const money = (n) => `$${Number(n || 0).toFixed(2)}`;
export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const STATUS = {
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  paid:       'bg-green-100 text-green-700',
  refunded:   'bg-red-100 text-red-700',
  approved:   'bg-green-100 text-green-700',
  rejected:   'bg-red-100 text-red-700',
};

export const StatusBadge = ({ status }) => (
  <span className={`inline-block px-2.5 py-1 rounded-full font-lato font-bold text-[10px] uppercase tracking-[0.5px] ${STATUS[status] || 'bg-gray-100 text-gray-600'}`}>
    {status}
  </span>
);

const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-[#ececec] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-[#fafafa] transition-colors"
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className="shrink-0 w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center">
            <Package size={17} className="text-brand-green" />
          </span>
          <div className="text-left min-w-0">
            <p className="font-lato font-bold text-[14px] text-dark-green">{order.orderNumber}</p>
            <p className="font-lato text-[12px] text-[#999]">{fmtDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={order.fulfillmentStatus} />
          <span className="font-playfair font-bold text-[15px] text-dark-green hidden sm:block">{money(order.grandTotal)}</span>
          <ChevronDown size={16} className={`text-[#aaa] transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-[#f0f0f0]">
          <div className="flex flex-col gap-3 my-4">
            {order.items.map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                {it.product?.image && (
                  <img src={it.product.image} alt="" className="w-12 h-12 rounded object-cover bg-[#f0f0f0] shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-lato text-[13px] text-dark-green truncate">{it.product?.name || it.variantSku}</p>
                  <p className="font-lato text-[12px] text-[#999]">{it.variantSize} · {money(it.unitPrice)} × {it.qty}</p>
                </div>
                <span className="font-lato font-bold text-[13px] text-dark-green">{money(it.total)}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 font-lato text-[13px] pt-3 border-t border-[#f0f0f0]">
            <div className="flex justify-between text-[#666]"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-[#666]"><span>Discount</span><span>−{money(order.discount)}</span></div>}
            <div className="flex justify-between text-[#666]"><span>Shipping</span><span>{order.shippingCost ? money(order.shippingCost) : 'Free'}</span></div>
            <div className="flex justify-between font-bold text-dark-green text-[15px] pt-1"><span>Total</span><span>{money(order.grandTotal)}</span></div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <span className="font-lato text-[12px] text-[#999]">Payment:</span>
            <StatusBadge status={order.paymentStatus} />
            {order.trackingNumber && (
              <span className="font-lato text-[12px] text-[#999] ml-auto">Tracking: <strong className="text-dark-green">{order.trackingNumber}</strong></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
