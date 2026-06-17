import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, Check, X, Trash2, ExternalLink, Search, Package } from 'lucide-react';
import axiosSecure from '../../lib/axiosSecure';
import { PageHeader, CardListSkeleton, EmptyState } from './adminUI';

const Stars = ({ rating }) => (
  <span className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={12} className={n <= rating ? 'fill-gold text-gold' : 'fill-sage text-sage'} />
    ))}
  </span>
);

const STATUS_TABS = [
  { key: 'all',      label: 'All' },
  { key: 'pending',  label: 'Pending' },
  { key: 'approved', label: 'Approved' },
];

const AdminReviews = () => {
  const qc = useQueryClient();
  const [status, setStatus]     = useState('all');
  const [page,   setPage]       = useState(1);
  const [search, setSearch]     = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', status, page, debounced],
    queryFn: () =>
      axiosSecure
        .get(`/reviews?status=${status === 'all' ? '' : status}&search=${encodeURIComponent(debounced)}&page=${page}&limit=20`)
        .then((r) => r.data),
  });

  const reviews    = data?.data    ?? [];
  const total      = data?.total   ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-reviews'] });

  const approveMutation = useMutation({
    mutationFn: ({ id, isApproved }) =>
      axiosSecure.patch(`/reviews/${id}/status`, { isApproved }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosSecure.delete(`/reviews/${id}`),
    onSuccess: invalidate,
  });

  return (
    <div>
      <PageHeader
        title="Reviews"
        subtitle={`${total} review${total !== 1 ? 's' : ''} total`}
      />

      {/* Status tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-[#eee]">
        <div className="flex gap-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setStatus(t.key); setPage(1); }}
              className={`px-4 py-2 font-lato text-[13px] transition-colors cursor-pointer -mb-px border-b-2 ${
                status === t.key
                  ? 'border-brand-green text-brand-green font-bold'
                  : 'border-transparent text-[#888] hover:text-dark-green'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72 mb-2">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, customer, or text…"
            className="w-full h-10 pl-10 pr-4 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green bg-white"
          />
        </div>
      </div>

      {isLoading ? (
        <CardListSkeleton rows={5} />
      ) : reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" subtitle="Reviews submitted by customers will appear here." />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white border border-[#eee] rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Left: product + customer */}
                  <div className="flex items-center gap-3 min-w-0">
                    {r.productId?.image ? (
                      <img src={r.productId.image} alt={r.productId?.name || ''} className="w-11 h-11 rounded-lg object-cover bg-[#f0f0f0] shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-[#f0f0f0] flex items-center justify-center shrink-0">
                        <Package size={16} className="text-[#ccc]" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <a
                        href={`/product/${r.productId?.slug || r.productSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-lato font-bold text-[13px] text-dark-green hover:text-brand-green flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{r.productId?.name || r.productSlug}</span>
                        <ExternalLink size={11} className="shrink-0" />
                      </a>
                      <p className="font-lato text-[11px] text-[#999] truncate flex items-center gap-1.5 mt-0.5">
                        {r.userImage ? (
                          <img src={r.userImage} alt={r.userName} className="w-4 h-4 rounded-full object-cover shrink-0" />
                        ) : null}
                        by {r.userName}
                      </p>
                    </div>
                  </div>

                  {/* Right: status + actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-lato text-[10px] uppercase tracking-[1px] px-2.5 py-1 rounded-full font-bold ${
                      r.isApproved ? 'bg-brand-green/10 text-brand-green' : 'bg-gold/20 text-gold'
                    }`}>
                      {r.isApproved ? 'Approved' : 'Pending'}
                    </span>
                    <button
                      onClick={() => approveMutation.mutate({ id: r._id, isApproved: !r.isApproved })}
                      title={r.isApproved ? 'Reject' : 'Approve'}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                        r.isApproved
                          ? 'bg-[#fef2f2] text-red-400 hover:bg-red-100'
                          : 'bg-brand-green/10 text-brand-green hover:bg-brand-green/20'
                      }`}
                    >
                      {r.isApproved ? <X size={14} /> : <Check size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this review permanently?'))
                          deleteMutation.mutate(r._id);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#fef2f2] text-red-400 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Stars rating={r.rating} />
                  <span className="font-lato text-[11px] text-[#aaa]">
                    {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <p className="font-lato text-[13px] text-dark-green/80 leading-relaxed">{r.content}</p>

                {r.images?.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {r.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer">
                        <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-[#eee] hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg font-lato text-[13px] cursor-pointer transition-colors ${
                    p === page ? 'bg-brand-green text-white' : 'bg-white border border-[#ddd] text-[#666] hover:border-brand-green'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminReviews;
