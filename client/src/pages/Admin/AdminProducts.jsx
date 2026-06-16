import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, Search, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X, GripVertical } from 'lucide-react';
import { api } from '../../lib/api';
import { useProducts } from '../../hooks/queries';
import { money, PageHeader, Card, TableSkeleton, EmptyState } from './adminUI';

const LIMIT = 15;

const DeleteConfirm = ({ product, onCancel, onConfirm, busy }) => (
  <>
    <div className="fixed inset-0 bg-black/40 z-40" onClick={onCancel} />
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl z-50 shadow-2xl p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-playfair text-[18px] text-dark-green">Delete Product</h3>
        <button onClick={onCancel} className="text-[#aaa] hover:text-dark-green cursor-pointer mt-0.5">
          <X size={18} />
        </button>
      </div>
      <p className="font-lato text-[13px] text-[#555] mb-1.5">
        Are you sure you want to deactivate <strong className="text-dark-green">{product.name}</strong>?
      </p>
      <p className="font-lato text-[12px] text-[#aaa] mb-5">It will be hidden from the store but not permanently deleted.</p>
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={busy}
          className="h-10 px-5 bg-red-600 text-white font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60"
        >
          {busy ? 'Deleting…' : 'Deactivate'}
        </button>
        <button
          onClick={onCancel}
          className="h-10 px-5 border border-[#ddd] text-[#666] font-lato text-[13px] rounded-lg hover:border-[#999] transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  </>
);

const AdminProducts = () => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [search,       setSearch]       = useState('');
  const [debounced,    setDebounced]    = useState('');
  const [page,         setPage]         = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dragIndex,    setDragIndex]    = useState(null);
  const [overIndex,    setOverIndex]    = useState(null);
  const [localProds,   setLocalProds]   = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); setLocalProds(null); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Use sort=order when not searching so drag order is respected
  const queryParams = {
    page:  String(page),
    limit: String(LIMIT),
    sort:  debounced ? 'name-asc' : 'order',
    ...(debounced ? { search: debounced } : {}),
  };
  const { data, isLoading: loading } = useProducts(queryParams);
  const products   = data?.data       || [];
  const totalPages = data?.totalPages || 1;
  const total      = data?.total      || 0;

  // Reset local optimistic list whenever server data changes
  useEffect(() => { setLocalProds(null); }, [data]);

  const displayProds = localProds ?? products;
  const canDrag      = !debounced; // hide drag handles when searching

  const deleteMutation = useMutation({
    mutationFn: (p) => api.del(`/products/${p._id}`),
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (e) => alert(e.message || 'Failed to deactivate'),
  });

  const reorderMutation = useMutation({
    mutationFn: (list) =>
      api.put('/products/reorder', {
        items: list.map((p, i) => ({ id: p._id, order: (page - 1) * LIMIT + i })),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    onError:   (e) => { alert(e.message || 'Failed to save order'); setLocalProds(null); },
  });

  // ── Drag handlers ────────────────────────────────────────────────────────────
  const handleDragStart = (i) => { setDragIndex(i); setLocalProds([...displayProds]); };
  const handleDragEnter = (i) => { if (i !== dragIndex) setOverIndex(i); };
  const handleDrop = () => {
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) {
      setDragIndex(null); setOverIndex(null); setLocalProds(null);
      return;
    }
    const reordered = [...displayProds];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(overIndex, 0, moved);
    setLocalProds(reordered);
    setDragIndex(null); setOverIndex(null);
    reorderMutation.mutate(reordered);
  };
  const handleDragEnd = () => { setDragIndex(null); setOverIndex(null); };

  const confirmDelete = () => { if (deleteTarget) deleteMutation.mutate(deleteTarget); };

  const priceStr = (arr) => {
    if (!arr.length) return '—';
    const lo = Math.min(...arr), hi = Math.max(...arr);
    return lo === hi ? money(lo) : `${money(lo)}–${money(hi)}`;
  };

  return (
    <div>
      <PageHeader title="Products" subtitle={`${total} product${total !== 1 ? 's' : ''}${canDrag ? ' · drag to reorder' : ''}`}>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-2 h-10 px-4 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-forest transition-colors cursor-pointer"
        >
          <Plus size={15} /> New Product
        </button>
      </PageHeader>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full h-10 pl-10 pr-4 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green bg-white"
        />
      </div>

      {reorderMutation.isPending && (
        <p className="font-lato text-[12px] text-brand-green mb-3">Saving new order…</p>
      )}

      {loading ? (
        <TableSkeleton cols={7} />
      ) : displayProds.length === 0 ? (
        <Card>
          <EmptyState icon={Package} title="No products found" subtitle="Add your first product or try a different search." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-left">
                  {canDrag && <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] w-10 px-3 py-3" />}
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3">Product</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Category</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Retail</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Wholesale</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Variants</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Flags</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayProds.map((p, idx) => {
                  const retails    = (p.variants || []).map((v) => v.retailPrice).filter((n) => n != null);
                  const wholesales = (p.variants || []).map((v) => v.wholesalePrice).filter((n) => n != null);

                  return (
                    <tr
                      key={p._id}
                      draggable={canDrag}
                      onDragStart={canDrag ? () => handleDragStart(idx) : undefined}
                      onDragEnter={canDrag ? () => handleDragEnter(idx) : undefined}
                      onDragOver={canDrag ? (e) => e.preventDefault() : undefined}
                      onDrop={canDrag ? handleDrop : undefined}
                      onDragEnd={canDrag ? handleDragEnd : undefined}
                      className={[
                        'border-b border-[#f5f5f5] last:border-0 transition-colors',
                        canDrag && dragIndex === idx ? 'opacity-40 bg-[#f9f9f9]' : 'hover:bg-[#fafafa]',
                        canDrag && overIndex === idx && dragIndex !== idx ? 'border-t-2 border-t-brand-green' : '',
                      ].join(' ')}
                    >
                      {canDrag && (
                        <td className="px-3 py-3 w-10">
                          <div className="flex items-center gap-0.5 text-[#bbb] cursor-grab active:cursor-grabbing">
                            <GripVertical size={16} />
                          </div>
                        </td>
                      )}

                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {p.image
                            ? <img src={p.image} alt="" className="w-10 h-10 rounded object-cover bg-[#f0f0f0] shrink-0" />
                            : <div className="w-10 h-10 rounded bg-[#f0f0f0] shrink-0 flex items-center justify-center"><Package size={16} className="text-[#ccc]" /></div>
                          }
                          <div className="min-w-0">
                            <p className="font-lato font-bold text-[13px] text-dark-green truncate max-w-50">{p.name}</p>
                            <p className="font-lato text-[11px] text-[#aaa]">{p.productNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-lato text-[13px] text-[#666]">{p.categoryName}</td>
                      <td className="px-3 py-3 font-lato font-bold text-[13px] text-dark-green whitespace-nowrap">{priceStr(retails)}</td>
                      <td className="px-3 py-3 font-lato text-[13px] text-brand-green/80 whitespace-nowrap">{priceStr(wholesales)}</td>
                      <td className="px-3 py-3 font-lato text-[13px] text-[#666]">{p.variants?.length || 0}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {p.isFeatured && <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-lato text-[10px] font-bold uppercase">Featured</span>}
                          {p.isNew      && <span className="px-2 py-0.5 rounded bg-brand-green/15 text-brand-green font-lato text-[10px] font-bold uppercase">New</span>}
                          {p.isSale     && <span className="px-2 py-0.5 rounded bg-gold/20 text-[#9a7a25] font-lato text-[10px] font-bold uppercase">Sale</span>}
                          {!p.isStocked && <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 font-lato text-[10px] font-bold uppercase">Out of Stock</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/products/${p._id}/edit`)}
                            className="w-8 h-8 flex items-center justify-center border border-[#ddd] rounded-lg text-[#888] hover:border-brand-green hover:text-brand-green transition-colors cursor-pointer"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="w-8 h-8 flex items-center justify-center border border-[#ddd] rounded-lg text-[#888] hover:border-red-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#f0f0f0]">
              <span className="font-lato text-[12px] text-[#999]">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-8 h-8 flex items-center justify-center border border-[#ddd] rounded-lg text-[#666] hover:border-dark-green disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="w-8 h-8 flex items-center justify-center border border-[#ddd] rounded-lg text-[#666] hover:border-dark-green disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {deleteTarget && (
        <DeleteConfirm
          product={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          busy={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminProducts;
