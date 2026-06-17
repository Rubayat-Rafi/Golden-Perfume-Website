import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, Package, Truck, CheckCircle, Clock, XCircle,
  MapPin, ChevronRight,
} from 'lucide-react';
import { useTrackOrder } from '../../hooks/queries';

// ── Status timeline config ────────────────────────────────────────────────────
const STEPS = [
  { key: 'pending',    label: 'Order Placed',   icon: Clock },
  { key: 'processing', label: 'Processing',      icon: Package },
  { key: 'shipped',    label: 'Shipped',         icon: Truck },
  { key: 'delivered',  label: 'Delivered',       icon: CheckCircle },
];

const STEP_INDEX = { pending: 0, processing: 1, shipped: 2, delivered: 3, cancelled: -1 };

const STATUS_LABEL = {
  pending:    { text: 'Order Placed',  color: 'text-gold',         bg: 'bg-gold/10',         dot: 'bg-gold' },
  processing: { text: 'Processing',    color: 'text-blue-600',     bg: 'bg-blue-50',          dot: 'bg-blue-500' },
  shipped:    { text: 'Shipped',       color: 'text-brand-green',  bg: 'bg-brand-green/10',   dot: 'bg-brand-green' },
  delivered:  { text: 'Delivered',     color: 'text-green-700',    bg: 'bg-green-50',          dot: 'bg-green-600' },
  cancelled:  { text: 'Cancelled',     color: 'text-red-600',      bg: 'bg-red-50',            dot: 'bg-red-500' },
};

const PAYMENT_LABEL = {
  pending:  { text: 'Awaiting Payment', color: 'text-[#999]' },
  paid:     { text: 'Paid',             color: 'text-green-600' },
  refunded: { text: 'Refunded',         color: 'text-red-500' },
};

const fmt = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// ── Address formatter ─────────────────────────────────────────────────────────
const formatAddress = (addr) => {
  if (!addr) return '—';
  const parts = [addr.street, addr.city, addr.state && addr.zip ? `${addr.state} ${addr.zip}` : addr.state || addr.zip, addr.country !== 'US' ? addr.country : ''].filter(Boolean);
  return parts.join(', ');
};

// ── Timeline component ────────────────────────────────────────────────────────
const StatusTimeline = ({ status }) => {
  const currentIdx = STEP_INDEX[status] ?? 0;
  const cancelled  = status === 'cancelled';

  if (cancelled) {
    return (
      <div className="flex items-center gap-3 py-3 px-4 bg-red-50 border border-red-200 rounded-xl">
        <XCircle size={22} className="text-red-500 shrink-0" />
        <div>
          <p className="font-lato font-bold text-[14px] text-red-600">Order Cancelled</p>
          <p className="font-lato text-[12px] text-red-400">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-1">
      {STEPS.map(({ key, label, icon: Icon }, i) => {
        const done    = i < currentIdx;
        const active  = i === currentIdx;
        const pending = i > currentIdx;
        return (
          <div key={key} className="flex flex-col items-center flex-1 min-w-[80px]">
            {/* Node + connector */}
            <div className="flex items-center w-full">
              {i > 0 && (
                <div className={`flex-1 h-0.5 ${done || active ? 'bg-brand-green' : 'bg-[#e0e0e0]'}`} />
              )}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                done   ? 'bg-brand-green border-brand-green' :
                active ? 'bg-white border-brand-green' :
                         'bg-white border-[#ddd]'
              }`}>
                <Icon size={16} className={done ? 'text-white' : active ? 'text-brand-green' : 'text-[#bbb]'} />
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${done ? 'bg-brand-green' : 'bg-[#e0e0e0]'}`} />
              )}
            </div>
            {/* Label */}
            <p className={`mt-2 font-lato text-[11px] text-center leading-tight ${
              done ? 'text-brand-green font-bold' : active ? 'text-dark-green font-bold' : 'text-[#bbb]'
            } ${pending ? '' : ''}`}>
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const TrackOrderPage = () => {
  const [searchParams] = useSearchParams();
  const [orderNum, setOrderNum] = useState(searchParams.get('order') || '');
  const [submittedQuery, setSubmittedQuery] = useState(
    searchParams.get('order')?.trim().toUpperCase() || ''
  );

  const { data: order, isLoading: loading, isError, error } = useTrackOrder(submittedQuery);
  const err = isError ? (error?.message || 'Order not found. Please check the order number and try again.') : '';

  const search = (e) => {
    e?.preventDefault();
    const q = orderNum.trim().toUpperCase();
    if (!q) return;
    setSubmittedQuery(q);
  };

  const sts  = order ? STATUS_LABEL[order.fulfillmentStatus]  || STATUS_LABEL.pending  : null;
  const pmts = order ? PAYMENT_LABEL[order.paymentStatus]     || PAYMENT_LABEL.pending : null;

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="max-w-305 mx-auto px-4 md:px-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 font-lato text-[12px] text-dark-green/50 mb-8">
          <Link to="/" className="hover:text-brand-green transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-dark-green">Track Order</span>
        </nav>

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
              <Truck size={26} className="text-brand-green" />
            </div>
            <h1 className="font-playfair font-normal text-[28px] md:text-[36px] text-dark-green mb-2">Track Your Order</h1>
            <p className="font-lato text-[14px] text-dark-green/50">
              Enter your order number to see the latest status of your shipment.
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={search} className="flex gap-3 mb-8">
            <input
              type="text"
              value={orderNum}
              onChange={(e) => setOrderNum(e.target.value)}
              placeholder="e.g. GP-2026-00001"
              className="flex-1 h-13 px-5 border-2 border-[#ddd] rounded-xl font-lato text-[15px] text-dark-green placeholder:text-dark-green/25 outline-none focus:border-brand-green transition-colors bg-white"
            />
            <button
              type="submit"
              disabled={loading || !orderNum.trim()}
              className="h-13 px-7 bg-brand-green text-white font-lato font-bold text-[12px] uppercase tracking-[1.5px] rounded-xl hover:bg-forest transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search size={15} />
              )}
              Track
            </button>
          </form>

          {/* Error */}
          {err && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
              <XCircle size={18} className="text-red-400 shrink-0" />
              <p className="font-lato text-[13px] text-red-600">{err}</p>
            </div>
          )}

          {/* Order results */}
          {order && (
            <div className="flex flex-col gap-5 animate-[fadeIn_.2s_ease]">

              {/* Order header card */}
              <div className="bg-white rounded-2xl border border-[#f0f0f0] px-6 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                  <div>
                    <p className="font-lato text-[11px] uppercase tracking-[2px] text-dark-green/40 mb-1">Order Number</p>
                    <p className="font-playfair text-[22px] text-dark-green font-normal">{order.orderNumber}</p>
                    <p className="font-lato text-[12px] text-dark-green/40 mt-0.5">Placed {fmt(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-lato text-[12px] font-bold ${sts.bg} ${sts.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sts.dot}`} />
                      {sts.text}
                    </span>
                    <span className={`font-lato text-[12px] ${pmts.color}`}>
                      Payment: {pmts.text}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <StatusTimeline status={order.fulfillmentStatus} />
              </div>

              {/* Tracking number */}
              {order.trackingNumber && (
                <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl px-5 py-4 flex items-center gap-3">
                  <Truck size={18} className="text-brand-green shrink-0" />
                  <div>
                    <p className="font-lato text-[11px] uppercase tracking-[1.5px] text-brand-green font-bold mb-0.5">Tracking Number</p>
                    <p className="font-lato font-bold text-[15px] text-dark-green">{order.trackingNumber}</p>
                  </div>
                </div>
              )}

              {/* Items + Shipping side by side on md+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Items */}
                <div className="bg-white rounded-2xl border border-[#f0f0f0] px-6 py-5">
                  <h3 className="font-playfair text-[17px] text-dark-green mb-4 flex items-center gap-2">
                    <Package size={16} className="text-brand-green" /> Items Ordered
                  </h3>
                  <div className="flex flex-col gap-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded overflow-hidden bg-cream shrink-0 border border-linen">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={16} className="text-dark-green/20" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-lato font-bold text-[13px] text-dark-green line-clamp-1">{item.name}</p>
                          <p className="font-lato text-[11px] text-dark-green/40">
                            {item.variantSize ? `${item.variantSize} · ` : ''}Qty {item.qty}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping address */}
                <div className="bg-white rounded-2xl border border-[#f0f0f0] px-6 py-5">
                  <h3 className="font-playfair text-[17px] text-dark-green mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-brand-green" /> Shipping To
                  </h3>
                  <p className="font-lato text-[14px] text-dark-green/70 leading-relaxed">
                    {formatAddress(order.shippingAddress)}
                  </p>

                  {/* Order total summary */}
                  <div className="mt-5 pt-4 border-t border-[#f5f5f5] flex flex-col gap-1.5">
                    {order.discount > 0 && (
                      <div className="flex justify-between font-lato text-[12px] text-dark-green/50">
                        <span>Discount</span>
                        <span className="text-green-600">–${order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-lato text-[12px] text-dark-green/50">
                      <span>Shipping</span>
                      <span>{order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between font-playfair text-[16px] text-dark-green font-normal mt-1">
                      <span>Total</span>
                      <span className="text-gold font-bold">${order.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Helper links */}
              <div className="text-center py-4">
                <p className="font-lato text-[13px] text-dark-green/40 mb-3">Need help with your order?</p>
                <div className="flex items-center justify-center gap-6">
                  <Link to="/contact" className="font-lato text-[13px] text-brand-green hover:text-dark-green transition-colors underline underline-offset-2">
                    Contact Support
                  </Link>
                  <Link to="/shop" className="font-lato text-[13px] text-brand-green hover:text-dark-green transition-colors underline underline-offset-2">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
