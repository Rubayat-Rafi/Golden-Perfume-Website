import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Trash2, Mail, MailOpen, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useContactMessages } from '../../hooks/queries';
import { formatDateTime, PageHeader, Card, TableSkeleton, EmptyState } from './adminUI';

const PAGE_SIZE = 15;

// ── View Modal ────────────────────────────────────────────────────────────────
const ViewModal = ({ msg, onClose }) => (
  <>
    <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl z-50 shadow-2xl flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-4 border-b border-[#f0f0f0] shrink-0">
        <div className="min-w-0 pr-4">
          <h3 className="font-playfair text-[18px] text-dark-green truncate">
            {msg.subject || '(no subject)'}
          </h3>
          <p className="font-lato text-[12px] text-[#999] mt-0.5">
            From <strong className="text-[#666]">{msg.name}</strong> &middot; {msg.email}
          </p>
        </div>
        <button onClick={onClose} className="shrink-0 text-[#aaa] hover:text-dark-green cursor-pointer mt-0.5">
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto px-6 py-5 flex-1">
        <p className="font-lato text-[13px] text-[#555] leading-relaxed whitespace-pre-wrap">
          {msg.message}
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#f0f0f0] flex items-center justify-between shrink-0">
        <span className="font-lato text-[11px] text-[#aaa]">{formatDateTime(msg.createdAt)}</span>
        <a
          href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your inquiry')}`}
          className="inline-flex items-center gap-2 h-9 px-4 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-forest transition-colors"
        >
          <Mail size={13} /> Reply via Email
        </a>
      </div>
    </div>
  </>
);

// ── Delete Confirm ────────────────────────────────────────────────────────────
const DeleteConfirm = ({ msg, onCancel, onConfirm, busy }) => (
  <>
    <div className="fixed inset-0 bg-black/40 z-40" onClick={onCancel} />
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl z-50 shadow-2xl p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-playfair text-[18px] text-dark-green">Delete Message</h3>
        <button onClick={onCancel} className="text-[#aaa] hover:text-dark-green cursor-pointer mt-0.5"><X size={18} /></button>
      </div>
      <p className="font-lato text-[13px] text-[#555] mb-5">
        Delete message from <strong className="text-dark-green">{msg.name}</strong>? This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={busy}
          className="h-10 px-5 bg-red-600 text-white font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60"
        >
          {busy ? 'Deleting…' : 'Delete'}
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

// ── Main Component ────────────────────────────────────────────────────────────
const AdminMessages = () => {
  const queryClient = useQueryClient();
  const [page, setPage]               = useState(1);
  const [unreadOnly, setUnreadOnly]   = useState(false);
  const [viewMsg, setViewMsg]         = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const params = {
    page: String(page),
    limit: String(PAGE_SIZE),
    ...(unreadOnly ? { unread: '1' } : {}),
  };

  const { data, isLoading: loading } = useContactMessages(params);
  const messages   = data?.data       || [];
  const totalPages = data?.totalPages || 1;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['contact'] });

  const openView = async (msg) => {
    setViewMsg(msg);
    if (!msg.isRead) {
      try {
        await api.patch(`/contact/${msg._id}/read`);
        invalidate();
      } catch { /* ignore */ }
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => api.del(`/contact/${id}`),
    onSuccess: () => { setDeleteTarget(null); invalidate(); },
    onError: (e) => alert(e.message || 'Delete failed'),
  });

  const goTo = (p) => setPage(p);

  const thCls = 'font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-4 py-3 text-left';

  return (
    <div>
      <PageHeader title="Messages" subtitle="Contact form submissions">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => { setUnreadOnly(e.target.checked); setPage(1); }}
            className="sr-only peer"
          />
          <span className="relative w-10 h-5.5 rounded-full bg-[#ccc] peer-checked:bg-brand-green transition-colors">
            <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${unreadOnly ? 'left-5' : 'left-0.5'}`} />
          </span>
          <span className="font-lato text-[13px] text-[#666]">Unread only</span>
        </label>
      </PageHeader>

      {loading ? (
        <TableSkeleton cols={6} />
      ) : messages.length === 0 ? (
        <Card>
          <EmptyState icon={Mail} title="No messages" subtitle="Contact form submissions will appear here." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#ececec]">
                  <th className={`${thCls} w-8`}></th>
                  <th className={thCls}>Name</th>
                  <th className={thCls}>Subject</th>
                  <th className={`${thCls} hidden md:table-cell`}>Email</th>
                  <th className={`${thCls} hidden sm:table-cell text-right`}>Date</th>
                  <th className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m._id} className={`border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa] ${!m.isRead ? 'bg-[#f9fdf9]' : ''}`}>
                    {/* Read indicator */}
                    <td className="px-4 py-3.5">
                      <span title={m.isRead ? 'Read' : 'Unread'}>
                        {m.isRead
                          ? <MailOpen size={15} className="text-[#ccc]" />
                          : <Mail size={15} className="text-brand-green" />
                        }
                      </span>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3.5">
                      <span className={`font-lato text-[13px] ${m.isRead ? 'text-[#666]' : 'font-bold text-dark-green'}`}>
                        {m.name}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="px-4 py-3.5 max-w-50">
                      <span className="font-lato text-[13px] text-[#555] truncate block">
                        {m.subject || <span className="text-[#bbb] italic">no subject</span>}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="font-lato text-[12px] text-[#888]">{m.email}</span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 hidden sm:table-cell text-right">
                      <span className="font-lato text-[11px] text-[#aaa] whitespace-nowrap">{formatDateTime(m.createdAt)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openView(m)}
                          title="View message"
                          className="w-8 h-8 flex items-center justify-center border border-[#e0e0e0] text-[#888] rounded-lg hover:border-brand-green hover:text-brand-green transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(m)}
                          title="Delete message"
                          className="w-8 h-8 flex items-center justify-center border border-red-200 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0f0f0]">
              <p className="font-lato text-[12px] text-[#aaa]">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goTo(page - 1)}
                  disabled={page === 1}
                  className="h-8 px-3 border border-[#e0e0e0] text-[#888] font-lato text-[12px] rounded-lg hover:border-brand-green hover:text-brand-green transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
                >
                  ‹ Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    className={`h-8 w-8 border font-lato text-[12px] rounded-lg transition-colors cursor-pointer ${
                      p === page
                        ? 'bg-dark-green text-linen border-dark-green'
                        : 'border-[#e0e0e0] text-[#888] hover:border-brand-green hover:text-brand-green'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => goTo(page + 1)}
                  disabled={page === totalPages}
                  className="h-8 px-3 border border-[#e0e0e0] text-[#888] font-lato text-[12px] rounded-lg hover:border-brand-green hover:text-brand-green transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {viewMsg && <ViewModal msg={viewMsg} onClose={() => setViewMsg(null)} />}

      {deleteTarget && (
        <DeleteConfirm
          msg={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
          busy={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminMessages;
