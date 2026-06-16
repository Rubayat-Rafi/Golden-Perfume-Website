import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Search, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import axiosSecure from '../../lib/axiosSecure';
import { PageHeader, TableSkeleton, EmptyState, formatDate } from './adminUI';

const AdminNewsletter = () => {
  const qc = useQueryClient();
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-newsletter', page, debounced],
    queryFn: () =>
      axiosSecure
        .get(`/newsletter?search=${encodeURIComponent(debounced)}&page=${page}&limit=50`)
        .then((r) => r.data),
  });

  const subscribers = data?.data        ?? [];
  const total       = data?.total       ?? 0;
  const activeCount = data?.activeCount  ?? 0;
  const totalPages  = data?.totalPages  ?? 1;

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosSecure.delete(`/newsletter/${id}`),
    onSuccess: () => {
      toast.success('Subscriber removed');
      qc.invalidateQueries({ queryKey: ['admin-newsletter'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to remove subscriber'),
  });

  const exportCsv = () => {
    if (!subscribers.length) return;
    const rows = ['Email,Status,Subscribed'];
    subscribers.forEach((s) => {
      rows.push(`${s.email},${s.isActive ? 'Active' : 'Unsubscribed'},${formatDate(s.createdAt)}`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title="Newsletter" subtitle={`${total} subscriber${total !== 1 ? 's' : ''} · ${activeCount} active`}>
        <button
          onClick={exportCsv}
          disabled={!subscribers.length}
          className="h-10 px-4 inline-flex items-center gap-2 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-forest transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={15} /> Export CSV
        </button>
      </PageHeader>

      {/* Search */}
      <div className="relative w-full sm:w-72 mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search email…"
          className="w-full h-10 pl-10 pr-4 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green bg-white"
        />
      </div>

      {isLoading ? (
        <TableSkeleton cols={3} />
      ) : subscribers.length === 0 ? (
        <EmptyState icon={Mail} title="No subscribers yet" subtitle="Emails collected via the newsletter form will appear here." />
      ) : (
        <div className="bg-white rounded-xl border border-[#ececec] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-left">
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3">Email</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Status</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3 hidden sm:table-cell">Subscribed</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s._id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-3.5 font-lato text-[13px] text-dark-green break-all">{s.email}</td>
                    <td className="px-3 py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-full font-lato font-bold text-[10px] uppercase tracking-[0.5px] ${
                        s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {s.isActive ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 font-lato text-[12px] text-[#999] hidden sm:table-cell whitespace-nowrap">{formatDate(s.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            if (window.confirm(`Remove ${s.email} from the list?`)) deleteMutation.mutate(s._id);
                          }}
                          className="w-8 h-8 flex items-center justify-center border border-[#ddd] rounded-lg text-[#888] hover:border-red-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 px-5 py-4 border-t border-[#f0f0f0]">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg font-lato text-[13px] cursor-pointer transition-colors ${
                    p === page ? 'bg-dark-green text-white' : 'bg-white border border-[#ddd] text-[#666] hover:border-brand-green'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNewsletter;
