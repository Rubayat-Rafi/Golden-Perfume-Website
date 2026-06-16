import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Users, Search, ChevronLeft, ChevronRight, Eye, X, Mail, Phone, Calendar, ShoppingBag, DollarSign, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useAdminUsers, useAdminUser } from '../../hooks/queries';
import { money, formatDate, formatDateTime, PageHeader, Card, TableSkeleton, EmptyState } from './adminUI';
import OrderCard from '../../components/OrderCard/OrderCard';

// Full customer detail slide-over
const DetailsDrawer = ({ userId, onClose }) => {
  const { data, isLoading: loading } = useAdminUser(userId);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#f5f6f5] z-50 flex flex-col shadow-2xl">
        <div className="bg-white px-6 py-4 border-b border-[#ececec] flex items-center justify-between shrink-0">
          <h3 className="font-playfair text-[18px] text-dark-green">Customer Details</h3>
          <button onClick={onClose} className="text-[#999] hover:text-dark-green cursor-pointer"><X size={20} /></button>
        </div>

        {loading || !data ? (
          <div className="flex-1 flex items-center justify-center">
            {loading ? <div className="w-8 h-8 border-4 border-brand-green/25 border-t-brand-green rounded-full animate-spin" />
                     : <p className="font-lato text-[14px] text-[#999]">Failed to load.</p>}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            {/* Identity */}
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <span className="shrink-0 w-14 h-14 rounded-full bg-dark-green text-linen flex items-center justify-center font-lato font-bold text-[20px]">
                  {data.user.name?.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-playfair text-[18px] text-dark-green truncate">{data.user.name}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-lato font-bold text-[10px] uppercase tracking-[0.5px]">
                    {data.user.role}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5 font-lato text-[13px] text-[#555]">
                  <Mail size={15} className="text-brand-green shrink-0" /> <span className="break-all">{data.user.email}</span>
                </div>
                <div className="flex items-center gap-2.5 font-lato text-[13px] text-[#555]">
                  <Phone size={15} className="text-brand-green shrink-0" /> {data.user.phone || '—'}
                </div>
                <div className="flex items-center gap-2.5 font-lato text-[13px] text-[#555]">
                  <Calendar size={15} className="text-brand-green shrink-0" /> Joined {formatDateTime(data.user.createdAt)}
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <span className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2"><ShoppingBag size={16} /></span>
                <p className="font-playfair text-[22px] text-dark-green leading-none mb-1">{data.stats.orderCount}</p>
                <p className="font-lato text-[11px] text-[#888] uppercase tracking-[1px]">Orders</p>
              </Card>
              <Card className="p-4">
                <span className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-2"><DollarSign size={16} /></span>
                <p className="font-playfair text-[22px] text-dark-green leading-none mb-1">{money(data.stats.totalSpent)}</p>
                <p className="font-lato text-[11px] text-[#888] uppercase tracking-[1px]">Total Spent</p>
              </Card>
            </div>

            {/* Addresses */}
            <Card className="p-5">
              <p className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] mb-3">Saved Addresses</p>
              {data.user.addresses?.length ? (
                <div className="flex flex-col gap-3">
                  {data.user.addresses.map((a, i) => (
                    <div key={i} className="font-lato text-[13px] text-[#555] leading-relaxed">
                      <span className="font-bold text-dark-green">{a.label}{a.isDefault ? ' · Default' : ''}</span><br />
                      {a.street}, {a.city}, {a.state} {a.zip}, {a.country}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-lato text-[13px] text-[#bbb]">No saved addresses</p>
              )}
            </Card>

            {/* Order history */}
            <div>
              <p className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] mb-3">Order History</p>
              {data.orders.length ? (
                <div className="flex flex-col gap-3">
                  {data.orders.map((o) => <OrderCard key={o._id} order={o} />)}
                </div>
              ) : (
                <p className="font-lato text-[13px] text-[#bbb]">No orders yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const AdminCustomers = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const queryClient = useQueryClient();
  const [search, setSearch]   = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage]       = useState(1);
  const [viewId, setViewId]   = useState(null);
  const [deletionOnly, setDeletionOnly] = useState(false);

  const queryParams = {
    page: String(page),
    limit: '20',
    ...(debounced ? { search: debounced } : {}),
    ...(deletionOnly ? { deletion: '1' } : {}),
  };
  const { data, isLoading: loading } = useAdminUsers(queryParams);
  const users      = data?.data       || [];
  const totalPages = data?.totalPages || 1;
  const total      = data?.total      || 0;
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

  const remove = async (u) => {
    if (!confirm(`Delete ${u.name}'s account? This permanently removes the customer and cannot be undone.`)) return;
    try {
      await api.del(`/admin/users/${u._id}`);
      invalidate();
    } catch (e) { alert(e.message); }
  };

  const rejectDeletion = async (u) => {
    try {
      await api.patch(`/admin/users/${u._id}/deletion-reject`);
      invalidate();
    } catch (e) { alert(e.message); }
  };

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${total} ${deletionOnly ? 'deletion request' : 'retail customer'}${total !== 1 ? 's' : ''}`} />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-2">
          <button onClick={() => { setDeletionOnly(false); setPage(1); }}
            className={`px-3.5 h-10 rounded-lg font-lato text-[13px] transition-colors cursor-pointer ${!deletionOnly ? 'bg-dark-green text-linen' : 'bg-white border border-[#ddd] text-[#666] hover:border-dark-green'}`}>
            All Customers
          </button>
          <button onClick={() => { setDeletionOnly(true); setPage(1); }}
            className={`px-3.5 h-10 rounded-lg font-lato text-[13px] transition-colors cursor-pointer ${deletionOnly ? 'bg-red-500 text-white' : 'bg-white border border-[#ddd] text-[#666] hover:border-red-300'}`}>
            Deletion Requests
          </button>
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone…"
            className="w-full h-10 pl-10 pr-4 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green bg-white" />
        </div>
      </div>

      {loading ? <TableSkeleton cols={6} /> : users.length === 0 ? (
        <Card><EmptyState icon={Users} title="No customers found" subtitle="Customers who register will appear here." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-left">
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3">Customer</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3 hidden md:table-cell">Phone</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Orders</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Spent</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3 hidden sm:table-cell">Joined</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="shrink-0 w-9 h-9 rounded-full bg-dark-green text-linen flex items-center justify-center font-lato font-bold text-[13px]">
                          {u.name?.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="font-lato font-bold text-[13px] text-dark-green truncate flex items-center gap-2">
                            {u.name}
                            {u.deletionStatus === 'pending' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-bold text-[9px] uppercase tracking-[0.5px]">Deletion requested</span>
                            )}
                          </p>
                          <p className="font-lato text-[11px] text-[#999] truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-lato text-[13px] text-[#666] hidden md:table-cell">{u.phone || '—'}</td>
                    <td className="px-3 py-3 font-lato text-[13px] text-[#666]">{u.orderCount}</td>
                    <td className="px-3 py-3 font-lato font-bold text-[13px] text-dark-green">{money(u.totalSpent)}</td>
                    <td className="px-3 py-3 font-lato text-[12px] text-[#999] hidden sm:table-cell whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin && u.deletionStatus === 'pending' ? (
                          <>
                            <button onClick={() => rejectDeletion(u)}
                              className="h-9 px-3 border border-[#ddd] rounded-lg font-lato text-[12px] text-[#666] hover:border-dark-green transition-colors cursor-pointer">
                              Reject
                            </button>
                            <button onClick={() => remove(u)}
                              className="h-9 px-3 bg-red-500 text-white rounded-lg font-lato font-bold text-[12px] hover:bg-red-600 transition-colors cursor-pointer">
                              Approve
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setViewId(u._id)} title="View details"
                              className="w-9 h-9 inline-flex items-center justify-center border border-[#ddd] rounded-lg text-[#666] hover:border-brand-green hover:text-brand-green transition-colors cursor-pointer">
                              <Eye size={16} />
                            </button>
                            {isAdmin && (
                              <button onClick={() => remove(u)} title="Delete account"
                                className="w-9 h-9 inline-flex items-center justify-center border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                                <Trash2 size={15} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#f0f0f0]">
              <span className="font-lato text-[12px] text-[#999]">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="w-8 h-8 flex items-center justify-center border border-[#ddd] rounded-lg text-[#666] hover:border-dark-green disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"><ChevronLeft size={16} /></button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="w-8 h-8 flex items-center justify-center border border-[#ddd] rounded-lg text-[#666] hover:border-dark-green disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </Card>
      )}

      {viewId && <DetailsDrawer userId={viewId} onClose={() => setViewId(null)} />}
    </div>
  );
};

export default AdminCustomers;
