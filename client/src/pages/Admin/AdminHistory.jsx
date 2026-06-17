import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { History, Search, Plus, Pencil, Trash2, AlertTriangle, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuditLogs } from '../../hooks/queries';
import { PageHeader, TableSkeleton, EmptyState, formatDateTime } from './adminUI';

const ENTITIES = ['all', 'product', 'category', 'banner', 'promo', 'customer', 'staff', 'wholesale'];
const ACTIONS  = ['all', 'create', 'update', 'delete'];

const ACTION_STYLE = {
  create: { cls: 'bg-green-100 text-green-700', Icon: Plus },
  update: { cls: 'bg-blue-100 text-blue-700',   Icon: Pencil },
  delete: { cls: 'bg-red-100 text-red-600',     Icon: Trash2 },
};

const ActionBadge = ({ action }) => {
  const { cls, Icon } = ACTION_STYLE[action] || { cls: 'bg-gray-100 text-gray-600', Icon: History };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-lato font-bold text-[10px] uppercase tracking-[0.5px] ${cls}`}>
      <Icon size={11} /> {action}
    </span>
  );
};

const ConfirmModal = ({ title, message, confirmLabel, busy, onCancel, onConfirm }) => (
  <>
    <div className="fixed inset-0 bg-black/40 z-40" onClick={onCancel} />
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl z-50 shadow-2xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle size={19} className="text-red-500" />
        </span>
        <div className="flex-1">
          <h3 className="font-playfair text-[18px] text-dark-green leading-tight">{title}</h3>
          <p className="font-lato text-[12px] text-[#aaa] mt-0.5">This cannot be undone</p>
        </div>
        <button onClick={onCancel} className="text-[#aaa] hover:text-dark-green cursor-pointer"><X size={18} /></button>
      </div>
      <p className="font-lato text-[13px] text-[#555] leading-relaxed mb-5">{message}</p>
      <div className="flex gap-3">
        <button onClick={onConfirm} disabled={busy}
          className="h-10 px-5 bg-red-600 text-white font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60">
          {busy ? 'Deleting…' : confirmLabel}
        </button>
        <button onClick={onCancel}
          className="h-10 px-5 border border-[#ddd] text-[#666] font-lato text-[13px] rounded-lg hover:border-[#999] transition-colors cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  </>
);

const AdminHistory = () => {
  const qc = useQueryClient();

  const [entity, setEntity]       = useState('all');
  const [action, setAction]       = useState('all');
  const [search, setSearch]       = useState('');
  const [debounced, setDebounced] = useState('');
  const [from, setFrom]           = useState('');
  const [to, setTo]               = useState('');
  const [page, setPage]           = useState(1);
  const [confirm, setConfirm]     = useState(null); // { type:'one'|'bulk', log? }
  const [retention, setRetention] = useState(null); // null = use saved value

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const params = {
    page: String(page),
    limit: '20',
    ...(entity !== 'all' ? { entity } : {}),
    ...(action !== 'all' ? { action } : {}),
    ...(debounced ? { search: debounced } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  };

  const { data, isLoading } = useAuditLogs(params);
  const logs       = data?.data       ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const today      = new Date().toISOString().slice(0, 10);

  const hasFilter = entity !== 'all' || action !== 'all' || !!debounced || !!from || !!to;

  // ── Retention setting ──
  const { data: settings } = useQuery({
    queryKey: ['admin', 'audit', 'settings'],
    queryFn: () => api.get('/admin/audit/settings').then((r) => r.data ?? r),
    staleTime: 1000 * 60,
  });
  // Derived input value — falls back to the saved value until edited
  const savedRetention = settings?.retentionDays;
  const retentionValue = retention !== null ? retention : (savedRetention ?? '');
  const retentionDirty = retention !== null && retentionValue !== '' && String(retentionValue) !== String(savedRetention);

  const saveRetention = useMutation({
    mutationFn: () => api.put('/admin/audit/settings', { retentionDays: Number(retentionValue) }),
    onSuccess: () => {
      toast.success('Retention updated');
      setRetention(null);
      qc.invalidateQueries({ queryKey: ['admin', 'audit', 'settings'] });
    },
    onError: (e) => toast.error(e.message || 'Failed to save'),
  });

  const invalidateLogs = () => qc.invalidateQueries({ queryKey: ['admin', 'audit'] });

  const deleteOne = useMutation({
    mutationFn: (id) => api.del(`/admin/audit/${id}`),
    onSuccess: () => { toast.success('Entry deleted'); setConfirm(null); invalidateLogs(); },
    onError: (e) => toast.error(e.message || 'Failed to delete'),
  });

  const purge = useMutation({
    mutationFn: () => api.post('/admin/audit/purge', {
      ...(entity !== 'all' ? { entity } : {}),
      ...(action !== 'all' ? { action } : {}),
      ...(debounced ? { search: debounced } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(!hasFilter ? { all: true } : {}),
    }),
    onSuccess: (r) => { toast.success(`Deleted ${r.deleted ?? 0} entr${(r.deleted === 1) ? 'y' : 'ies'}`); setConfirm(null); setPage(1); invalidateLogs(); },
    onError: (e) => toast.error(e.message || 'Failed to delete'),
  });

  const selCls = 'h-10 px-2.5 border border-[#ddd] rounded-lg font-lato text-[13px] bg-white outline-none focus:border-brand-green cursor-pointer capitalize';

  const clearFilters = () => { setEntity('all'); setAction('all'); setSearch(''); setFrom(''); setTo(''); setPage(1); };

  return (
    <div>
      <PageHeader title="History" subtitle={`${total} logged action${total !== 1 ? 's' : ''}`} />

      {/* Retention setting */}
      <div className="bg-white rounded-xl border border-[#ececec] p-4 mb-5 flex flex-wrap items-center gap-3">
        <Clock size={17} className="text-brand-green" />
        <span className="font-lato text-[13px] text-dark-green">Auto-delete logs older than</span>
        <input
          type="number"
          min="0"
          value={retentionValue}
          onChange={(e) => setRetention(e.target.value)}
          className="w-20 h-9 px-3 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green text-center"
        />
        <span className="font-lato text-[13px] text-[#888]">days</span>
        <button
          onClick={() => saveRetention.mutate()}
          disabled={saveRetention.isPending || !retentionDirty}
          className="h-9 px-4 bg-brand-green text-white font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-forest transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveRetention.isPending ? 'Saving…' : 'Save'}
        </button>
        <span className="font-lato text-[11px] text-[#aaa] ml-auto">Set to <strong>0</strong> to keep history forever.</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 mb-5">
        <div className="relative flex-1 min-w-45 max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search item or person…"
            className="w-full h-10 pl-10 pr-4 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green bg-white"
          />
        </div>

        <select value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1); }} className={selCls}>
          {ENTITIES.map((e) => <option key={e} value={e}>{e === 'all' ? 'All types' : e}</option>)}
        </select>

        <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className={selCls}>
          {ACTIONS.map((a) => <option key={a} value={a}>{a === 'all' ? 'All actions' : a}</option>)}
        </select>

        <input type="date" value={from} max={to || today} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={selCls} />
        <span className="font-lato text-[12px] text-[#aaa]">–</span>
        <input type="date" value={to} min={from || undefined} max={today} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={selCls} />

        {hasFilter && (
          <button onClick={clearFilters} className="h-10 px-3 font-lato text-[13px] text-[#999] hover:text-dark-green transition-colors cursor-pointer">
            Clear
          </button>
        )}

        {total > 0 && (
          <button
            onClick={() => setConfirm({ type: 'bulk' })}
            className="h-10 px-4 ml-auto inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
          >
            <Trash2 size={14} /> {hasFilter ? 'Delete results' : 'Clear all'}
          </button>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton cols={5} />
      ) : logs.length === 0 ? (
        <EmptyState icon={History} title="No history" subtitle="Create, update, and delete actions will be logged here." />
      ) : (
        <div className="bg-white rounded-xl border border-[#ececec] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-left">
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3">When</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Who</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Action</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Type</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Item</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-3.5 font-lato text-[12px] text-[#999] whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                    <td className="px-3 py-3.5">
                      <span className="font-lato font-bold text-[13px] text-dark-green block">{log.userName}</span>
                      {log.userRole && <span className="font-lato text-[11px] text-[#aaa] capitalize">{log.userRole}</span>}
                    </td>
                    <td className="px-3 py-3.5"><ActionBadge action={log.action} /></td>
                    <td className="px-3 py-3.5 font-lato text-[13px] text-[#666] capitalize">{log.entity}</td>
                    <td className="px-3 py-3.5 font-lato text-[13px] text-dark-green">{log.entityName || '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setConfirm({ type: 'one', log })}
                          title="Delete entry"
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

      {confirm?.type === 'one' && (
        <ConfirmModal
          title="Delete entry"
          message={`Delete this log entry (${confirm.log.action} · ${confirm.log.entity} · ${confirm.log.entityName || '—'})?`}
          confirmLabel="Delete"
          busy={deleteOne.isPending}
          onCancel={() => setConfirm(null)}
          onConfirm={() => deleteOne.mutate(confirm.log._id)}
        />
      )}

      {confirm?.type === 'bulk' && (
        <ConfirmModal
          title={hasFilter ? 'Delete results' : 'Clear all history'}
          message={hasFilter
            ? `Delete all ${total} log entr${total === 1 ? 'y' : 'ies'} matching the current filters?`
            : `Delete ALL ${total} history entr${total === 1 ? 'y' : 'ies'}? This wipes the entire activity log.`}
          confirmLabel={hasFilter ? 'Delete results' : 'Clear all'}
          busy={purge.isPending}
          onCancel={() => setConfirm(null)}
          onConfirm={() => purge.mutate()}
        />
      )}
    </div>
  );
};

export default AdminHistory;
