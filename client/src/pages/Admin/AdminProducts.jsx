import { useEffect, useState, useCallback } from 'react';
import { Package, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { money, StatusBadge, PageHeader, Card, Spinner, EmptyState } from './adminUI';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]       = useState(0);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (debounced) q.set('search', debounced);
    q.set('page', String(page));
    q.set('limit', '15');
    api.get(`/products?${q}`)
      .then((d) => { setProducts(d.data || []); setTotalPages(d.totalPages || 1); setTotal(d.total || 0); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [debounced, page]);

  useEffect(() => { load(); }, [load]);

  const priceRange = (p) => {
    const prices = (p.variants || []).map((v) => v.retailPrice).filter((n) => n != null);
    if (!prices.length) return '—';
    const lo = Math.min(...prices), hi = Math.max(...prices);
    return lo === hi ? money(lo) : `${money(lo)} – ${money(hi)}`;
  };

  return (
    <div>
      <PageHeader title="Products" subtitle={`${total} active product${total !== 1 ? 's' : ''}`} />

      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
          className="w-full h-10 pl-10 pr-4 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green bg-white" />
      </div>

      {loading ? <Spinner /> : products.length === 0 ? (
        <Card><EmptyState icon={Package} title="No products found" subtitle="Try a different search term." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-left">
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3">Product</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Category</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Price</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Variants</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3">Flags</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded object-cover bg-[#f0f0f0] shrink-0" />}
                        <div className="min-w-0">
                          <p className="font-lato font-bold text-[13px] text-dark-green truncate max-w-[220px]">{p.name}</p>
                          <p className="font-lato text-[11px] text-[#aaa]">{p.productNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-lato text-[13px] text-[#666]">{p.categoryName}</td>
                    <td className="px-3 py-3 font-lato font-bold text-[13px] text-dark-green whitespace-nowrap">{priceRange(p)}</td>
                    <td className="px-3 py-3 font-lato text-[13px] text-[#666]">{p.variants?.length || 0}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {p.isFeatured && <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-lato text-[10px] font-bold uppercase">Featured</span>}
                        {p.isNew && <span className="px-2 py-0.5 rounded bg-brand-green/15 text-brand-green font-lato text-[10px] font-bold uppercase">New</span>}
                        {p.isSale && <span className="px-2 py-0.5 rounded bg-gold/20 text-[#9a7a25] font-lato text-[10px] font-bold uppercase">Sale</span>}
                        {!p.isStocked && <StatusBadge status="cancelled" />}
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
    </div>
  );
};

export default AdminProducts;
