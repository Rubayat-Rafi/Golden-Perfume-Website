import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, X, Eye, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useWholesaleApplications } from '../../hooks/queries';
import { formatDate, StatusBadge, PageHeader, Card, TableSkeleton, EmptyState } from './adminUI';

const STATUSES = ['pending', 'approved', 'rejected'];

const FilterTab = ({ active, onClick, count, children }) => (
  <button onClick={onClick}
    className={`flex items-center gap-1.5 px-3.5 h-8 rounded-full font-lato text-[12px] capitalize whitespace-nowrap transition-colors cursor-pointer ${
      active ? 'bg-brand-green text-white' : 'bg-white border border-[#ddd] text-[#666] hover:border-dark-green'
    }`}>
    {children}
    {count != null && (
      <span className={`min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${active ? 'bg-linen/25 text-linen' : 'bg-[#f0f0f0] text-[#888]'}`}>
        {count}
      </span>
    )}
  </button>
);

const Detail = ({ label, value }) => value ? (
  <div>
    <p className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] mb-0.5">{label}</p>
    <p className="font-lato text-[13px] text-dark-green">{value}</p>
  </div>
) : null;

const AppDrawer = ({ app, onClose, onChange, busyId }) => {
  const [note, setNote] = useState(app.adminNote || '');
  const a = app;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#f5f6f5] z-50 flex flex-col shadow-2xl">
        <div className="bg-white px-6 py-4 border-b border-[#ececec] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-playfair text-[18px] text-dark-green">{a.businessName}</h3>
            <p className="font-lato text-[11px] text-[#999]">Applied {formatDate(a.submittedAt)}</p>
          </div>
          <button onClick={onClose} className="text-[#999] hover:text-dark-green cursor-pointer"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2"><StatusBadge status={a.status} /></div>

          <Card className="p-4 grid grid-cols-2 gap-4">
            <Detail label="Business Type" value={a.businessType} />
            <Detail label="EIN / Tax ID" value={a.ein} />
            <Detail label="License #" value={a.licenseNumber} />
            <Detail label="Monthly Volume" value={a.monthlyOrderRange} />
          </Card>

          <Card className="p-4 grid grid-cols-2 gap-4">
            <Detail label="Contact" value={a.contactName} />
            <Detail label="Phone" value={a.phone} />
            <div className="col-span-2"><Detail label="Email" value={a.email} /></div>
            <div className="col-span-2">
              <Detail label="Address" value={a.address ? `${a.address.street}, ${a.address.city}, ${a.address.state} ${a.address.zip}` : null} />
            </div>
          </Card>

          {a.productInterests?.length > 0 && (
            <Card className="p-4">
              <p className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] mb-2">Product Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {a.productInterests.map((p) => (
                  <span key={p} className="px-2.5 py-1 bg-linen/60 rounded-full font-lato text-[12px] text-dark-green">{p}</span>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-4">
            <p className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] mb-2">Review Note</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              placeholder="Reason for the decision (optional)…"
              className="w-full px-3 py-2 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green resize-none" />
          </Card>
        </div>

        <div className="bg-white px-6 py-4 border-t border-[#ececec] shrink-0 grid grid-cols-3 gap-2">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => onChange(a._id, s, note)} disabled={busyId === a._id || a.status === s}
              className={`h-10 rounded-lg font-lato font-bold text-[12px] uppercase tracking-[0.5px] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                s === 'approved' ? 'bg-brand-green text-white hover:bg-forest'
                : s === 'rejected' ? 'border border-red-300 text-red-600 hover:bg-red-50'
                : 'border border-[#ddd] text-[#666] hover:bg-[#f5f5f5]'
              }`}>
              {s === 'pending' ? 'Re-open' : s}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

const AdminWholesale = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const queryClient = useQueryClient();
  const [filter, setFilter]     = useState('pending');
  const [selected, setSelected] = useState(null);

  const { data: allApps = [], isLoading: loading } = useWholesaleApplications();

  const counts = useMemo(() => {
    const c = { '': allApps.length, pending: 0, approved: 0, rejected: 0 };
    allApps.forEach((a) => { c[a.status] = (c[a.status] || 0) + 1; });
    return c;
  }, [allApps]);

  const filtered = useMemo(
    () => (filter ? allApps.filter((a) => a.status === filter) : allApps),
    [allApps, filter]
  );

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status, adminNote }) =>
      api.patch(`/wholesale/applications/${id}`, { status, adminNote }).then((r) => r.data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['wholesale', 'applications'] });
      setSelected((cur) => (cur && cur._id === updated._id ? updated : cur));
    },
    onError: (e) => alert(e.message || 'Update failed'),
  });

  const removeAccountMutation = useMutation({
    mutationFn: ({ uid, appId }) => api.del(`/admin/users/${uid}`).then(() => appId),
    onSuccess: (appId) => {
      queryClient.invalidateQueries({ queryKey: ['wholesale', 'applications'] });
      setSelected((cur) => (cur && cur._id === appId ? null : cur));
    },
    onError: (e) => alert(e.message || 'Delete failed'),
  });

  const changeStatus = (id, status, adminNote) => changeStatusMutation.mutate({ id, status, adminNote });

  const removeAccount = (app) => {
    const uid = app.userId?._id || app.userId;
    if (!uid) { alert('No linked user account to delete'); return; }
    if (!confirm(`Delete the wholesale account for "${app.businessName}"? This removes the user and their application permanently.`)) return;
    removeAccountMutation.mutate({ uid, appId: app._id });
  };

  const busyId = (changeStatusMutation.isPending && changeStatusMutation.variables?.id)
    || (removeAccountMutation.isPending && removeAccountMutation.variables?.appId)
    || null;

  return (
    <div>
      <PageHeader title="Wholesale Applications" subtitle="Review B2B account requests and set their status" />

      <div className="flex gap-2 mb-5">
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <FilterTab key={s || 'all'} active={filter === s} count={counts[s] ?? 0} onClick={() => setFilter(s)}>
            {s || 'All'}
          </FilterTab>
        ))}
      </div>

      {loading ? <TableSkeleton cols={6} /> : filtered.length === 0 ? (
        <Card><EmptyState icon={Briefcase} title="No applications" subtitle="Applications matching this filter will appear here." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-left">
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3">Business</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Contact</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3 hidden md:table-cell">Volume</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3 hidden sm:table-cell">Applied</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Status</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a._id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-3.5">
                      <button onClick={() => setSelected(a)} className="text-left cursor-pointer group">
                        <span className="font-lato font-bold text-[13px] text-dark-green group-hover:text-brand-green transition-colors block">{a.businessName}</span>
                        <span className="font-lato text-[11px] text-[#aaa]">{a.businessType}</span>
                      </button>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="font-lato text-[13px] text-[#666] block">{a.contactName}</span>
                      <span className="font-lato text-[11px] text-[#aaa]">{a.email}</span>
                    </td>
                    <td className="px-3 py-3.5 font-lato text-[13px] text-[#666] hidden md:table-cell">{a.monthlyOrderRange || '—'}</td>
                    <td className="px-3 py-3.5 font-lato text-[12px] text-[#999] hidden sm:table-cell whitespace-nowrap">{formatDate(a.submittedAt)}</td>
                    <td className="px-3 py-3.5"><StatusBadge status={a.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelected(a)}
                          title="View full application"
                          aria-label="View full application"
                          className="w-9 h-9 flex items-center justify-center border border-[#ddd] rounded-lg text-[#666] hover:border-brand-green hover:text-brand-green transition-colors cursor-pointer shrink-0"
                        >
                          <Eye size={16} />
                        </button>
                        <select
                          value={a.status}
                          disabled={busyId === a._id}
                          onChange={(e) => changeStatus(a._id, e.target.value, a.adminNote || '')}
                          className="h-9 px-2.5 border border-[#ddd] rounded-lg font-lato text-[12px] capitalize bg-white outline-none focus:border-brand-green cursor-pointer disabled:opacity-50"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {isAdmin && (
                          <button
                            onClick={() => removeAccount(a)}
                            disabled={busyId === a._id}
                            title="Delete account"
                            className="w-9 h-9 flex items-center justify-center border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-[#f0f0f0] font-lato text-[12px] text-[#999]">
            {filtered.length} application{filtered.length !== 1 ? 's' : ''}
          </div>
        </Card>
      )}

      {selected && (
        <AppDrawer app={selected} busyId={busyId} onClose={() => setSelected(null)} onChange={changeStatus} />
      )}
    </div>
  );
};

export default AdminWholesale;
