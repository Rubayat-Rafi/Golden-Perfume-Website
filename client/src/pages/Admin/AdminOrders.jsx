import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useOrders } from '../../hooks/queries';
import { money, formatDateTime, StatusBadge, ChannelBadge, PageHeader, Card, TableSkeleton, EmptyState } from './adminUI';

const FULFILLMENT = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT     = ['pending', 'paid', 'refunded'];

const FilterTab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3.5 h-8 rounded-full font-lato text-[12px] whitespace-nowrap transition-colors cursor-pointer ${
      active ? 'bg-dark-green text-linen' : 'bg-white border border-[#ddd] text-[#666] hover:border-dark-green'
    }`}
  >
    {children}
  </button>
);

const OrderDrawer = ({ order, onClose, onUpdated }) => {
  const [fulfillment, setFulfillment] = useState(order.fulfillmentStatus);
  const [payment, setPayment]         = useState(order.paymentStatus);
  const [tracking, setTracking]       = useState(order.trackingNumber || '');
  const [saving, setSaving]           = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/orders/${order._id}/status`, {
        fulfillmentStatus: fulfillment,
        paymentStatus: payment,
        trackingNumber: tracking,
      });
      onUpdated();
      onClose();
    } catch (err) {
      alert(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#f5f6f5] z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-[#ececec] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-playfair text-[18px] text-dark-green">{order.orderNumber}</h3>
            <p className="font-lato text-[11px] text-[#999]">{formatDateTime(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="text-[#999] hover:text-dark-green cursor-pointer"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Customer */}
          <Card className="p-4">
            <p className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] mb-2">Customer</p>
            <p className="font-lato font-bold text-[14px] text-dark-green">{order.user?.name || '—'}</p>
            <p className="font-lato text-[13px] text-[#666]">{order.user?.email}</p>
            <div className="mt-2"><ChannelBadge type={order.customerType} /></div>
          </Card>

          {/* Items */}
          <Card className="p-4">
            <p className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] mb-3">Items</p>
            <div className="flex flex-col gap-3">
              {order.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3">
                  {it.product?.image && (
                    <img src={it.product.image} alt="" className="w-11 h-11 rounded object-cover bg-[#f0f0f0] shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-lato text-[13px] text-dark-green truncate">{it.product?.name || it.variantSku}</p>
                    <p className="font-lato text-[12px] text-[#999]">{it.variantSize} · {money(it.unitPrice)} × {it.qty}</p>
                  </div>
                  <span className="font-lato font-bold text-[13px] text-dark-green">{money(it.total)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-[#f0f0f0] flex flex-col gap-1.5 font-lato text-[13px]">
              <div className="flex justify-between text-[#666]"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-[#666]"><span>Discount</span><span>−{money(order.discount)}</span></div>}
              <div className="flex justify-between text-[#666]"><span>Shipping</span><span>{money(order.shippingCost)}</span></div>
              {order.tax > 0 && <div className="flex justify-between text-[#666]"><span>Tax</span><span>{money(order.tax)}</span></div>}
              <div className="flex justify-between font-bold text-dark-green text-[15px] pt-1"><span>Total</span><span>{money(order.grandTotal)}</span></div>
            </div>
          </Card>

          {/* Shipping address */}
          {order.shippingAddress?.street && (
            <Card className="p-4">
              <p className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] mb-2">Ship To</p>
              <p className="font-lato text-[13px] text-[#666] leading-relaxed">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                {order.shippingAddress.country}
              </p>
            </Card>
          )}

          {/* Update */}
          <Card className="p-4">
            <p className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] mb-3">Update Status</p>
            <label className="block font-lato text-[12px] text-[#666] mb-1.5">Fulfillment</label>
            <select value={fulfillment} onChange={(e) => setFulfillment(e.target.value)}
              className="w-full h-10 px-3 mb-4 border border-[#ddd] rounded-lg font-lato text-[13px] bg-white outline-none focus:border-brand-green capitalize">
              {FULFILLMENT.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <label className="block font-lato text-[12px] text-[#666] mb-1.5">Payment</label>
            <select value={payment} onChange={(e) => setPayment(e.target.value)}
              className="w-full h-10 px-3 mb-4 border border-[#ddd] rounded-lg font-lato text-[13px] bg-white outline-none focus:border-brand-green capitalize">
              {PAYMENT.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <label className="block font-lato text-[12px] text-[#666] mb-1.5">Tracking Number</label>
            <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. 1Z999..."
              className="w-full h-10 px-3 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green" />
          </Card>
        </div>

        {/* Save */}
        <div className="bg-white px-6 py-4 border-t border-[#ececec] shrink-0">
          <button onClick={save} disabled={saving}
            className="w-full h-11 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors cursor-pointer disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
};

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [filter,   setFilter]   = useState('');
  const [page,     setPage]     = useState(1);
  const [selected, setSelected] = useState(null);

  const queryParams = { page: String(page), limit: '15', ...(filter ? { fulfillmentStatus: filter } : {}) };
  const { data, isLoading: loading } = useOrders(queryParams);
  const orders     = data?.data       || [];
  const totalPages = data?.totalPages || 1;
  const total      = data?.total      || 0;

  const handleUpdated = () => queryClient.invalidateQueries({ queryKey: ['orders'] });

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${total} total order${total !== 1 ? 's' : ''}`} />

      {/* Filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <FilterTab active={!filter} onClick={() => { setFilter(''); setPage(1); }}>All</FilterTab>
        {FULFILLMENT.map((s) => (
          <FilterTab key={s} active={filter === s} onClick={() => { setFilter(s); setPage(1); }}>
            <span className="capitalize">{s}</span>
          </FilterTab>
        ))}
      </div>

      {loading ? <TableSkeleton cols={6} /> : orders.length === 0 ? (
        <Card><EmptyState icon={ShoppingBag} title="No orders found" subtitle="Orders will appear here once customers check out." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-left">
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3">Order</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Customer</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Total</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Payment</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Status</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} onClick={() => setSelected(o)}
                    className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa] cursor-pointer">
                    <td className="px-5 py-3.5">
                      <span className="font-lato font-bold text-[13px] text-dark-green">{o.orderNumber}</span>
                      <span className="ml-2"><ChannelBadge type={o.customerType} /></span>
                    </td>
                    <td className="px-3 py-3.5 font-lato text-[13px] text-[#666]">{o.user?.name || '—'}</td>
                    <td className="px-3 py-3.5 font-lato font-bold text-[13px] text-dark-green">{money(o.grandTotal)}</td>
                    <td className="px-3 py-3.5"><StatusBadge status={o.paymentStatus} /></td>
                    <td className="px-3 py-3.5"><StatusBadge status={o.fulfillmentStatus} /></td>
                    <td className="px-5 py-3.5 font-lato text-[12px] text-[#999] text-right whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#f0f0f0]">
              <span className="font-lato text-[12px] text-[#999]">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="w-8 h-8 flex items-center justify-center border border-[#ddd] rounded-lg text-[#666] hover:border-dark-green disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="w-8 h-8 flex items-center justify-center border border-[#ddd] rounded-lg text-[#666] hover:border-dark-green disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {selected && (
        <OrderDrawer order={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />
      )}
    </div>
  );
};

export default AdminOrders;
