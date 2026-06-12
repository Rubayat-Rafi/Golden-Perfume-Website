import { Fragment, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, FolderTree, Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useCategories } from '../../hooks/queries';
import { PageHeader, Card, Spinner, EmptyState } from './adminUI';

const PAGE_SIZE = 8;

const DeleteConfirm = ({ cat, onCancel, onConfirm, busy }) => (
  <>
    <div className="fixed inset-0 bg-black/40 z-40" onClick={onCancel} />
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl z-50 shadow-2xl p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-playfair text-[18px] text-dark-green">Delete Category</h3>
        <button onClick={onCancel} className="text-[#aaa] hover:text-dark-green cursor-pointer mt-0.5">
          <X size={18} />
        </button>
      </div>
      <p className="font-lato text-[13px] text-[#555] mb-5">
        Are you sure you want to delete <strong className="text-dark-green">{cat.name}</strong>?
        This cannot be undone.
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

const AdminCategories = () => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const invalidate  = () => queryClient.invalidateQueries({ queryKey: ['categories'] });

  const { data: cats = [], isLoading: loading } = useCategories({ includeInactive: true });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expanded, setExpanded]         = useState(new Set());
  const [page, setPage]                 = useState(1);

  const deleteMutation = useMutation({
    mutationFn: (cat) => api.del(`/categories/${cat._id}`),
    onSuccess: () => { setDeleteTarget(null); invalidate(); },
    onError: (e) => alert(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (node) => api.put(`/categories/${node._id}`, { isActive: !node.isActive }),
    onSuccess: invalidate,
    onError: (e) => alert(e.message),
  });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
  };

  const onToggleActive = (node) => toggleMutation.mutate(node);

  const toggleExpand = (slug) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });

  const topLevel = cats
    .filter((c) => !c.parent)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  const subsOf = (slug) =>
    cats
      .filter((c) => c.parent === slug)
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  const totalPages  = Math.ceil(topLevel.length / PAGE_SIZE);
  const pagedTop    = topLevel.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goTo = (p) => {
    setPage(p);
    setExpanded(new Set()); // collapse all on page change
  };

  const thCls = 'font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-4 py-3';

  return (
    <div>
      <PageHeader title="Categories" subtitle="Manage your category hierarchy">
        <button
          onClick={() => navigate('/admin/categories/new')}
          className="flex items-center gap-2 h-10 px-4 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-forest transition-colors cursor-pointer"
        >
          <Plus size={15} /> Add Category
        </button>
      </PageHeader>

      {loading ? (
        <Spinner />
      ) : topLevel.length === 0 ? (
        <Card>
          <EmptyState icon={FolderTree} title="No categories yet" subtitle="Create your first top-level category." />
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#ececec] text-left">
                    <th className={thCls}>Category</th>
                    <th className={thCls}>Slug</th>
                    <th className={`${thCls} text-center`}>Sub-cats</th>
                    <th className={`${thCls} text-center w-16`}>Order</th>
                    <th className={thCls}>Status</th>
                    <th className={`${thCls} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedTop.map((cat, idx) => {
                    const subs    = subsOf(cat.slug);
                    const isOpen  = expanded.has(cat.slug);
                    const isLast  = idx === pagedTop.length - 1;

                    return (
                      <Fragment key={cat._id}>
                        {/* ── Top-level category row ── */}
                        <tr className={`bg-[#f7faf7] border-b border-[#e8eee8] ${!cat.isActive ? 'opacity-50' : ''}`}>
                          {/* Name + chevron + image */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 min-w-0">
                              {/* Expand toggle — only when sub-cats exist */}
                              {subs.length > 0 ? (
                                <button
                                  onClick={() => toggleExpand(cat.slug)}
                                  className="shrink-0 w-6 h-6 flex items-center justify-center text-[#888] hover:text-brand-green transition-colors cursor-pointer"
                                >
                                  {isOpen
                                    ? <ChevronDown size={15} />
                                    : <ChevronRight size={15} />}
                                </button>
                              ) : (
                                <span className="shrink-0 w-6" />
                              )}

                              {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded object-cover shrink-0 border border-linen" />
                              ) : (
                                <span className="w-8 h-8 rounded bg-brand-green/10 flex items-center justify-center font-playfair text-[14px] text-brand-green shrink-0 border border-brand-green/20">
                                  {cat.name.charAt(0)}
                                </span>
                              )}
                              <span className="font-lato font-bold text-[14px] text-dark-green truncate">{cat.name}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className="font-mono text-[11px] text-[#888] bg-[#eef0ee] px-2 py-0.5 rounded">{cat.slug}</span>
                          </td>

                          <td className="px-4 py-3 text-center">
                            {subs.length > 0 ? (
                              <button
                                onClick={() => toggleExpand(cat.slug)}
                                className="inline-flex items-center justify-center min-w-5.5 h-5.5 px-1.5 bg-brand-green/15 text-brand-green font-lato font-bold text-[11px] rounded-full hover:bg-brand-green/25 transition-colors cursor-pointer"
                              >
                                {subs.length}
                              </button>
                            ) : (
                              <span className="font-lato text-[12px] text-[#ccc]">—</span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className="font-lato text-[13px] text-[#888]">{cat.order ?? 0}</span>
                          </td>

                          <td className="px-4 py-3">
                            <button onClick={() => onToggleActive(cat)} className="flex items-center gap-2 cursor-pointer">
                              <span className={`relative w-10 h-5.5 rounded-full transition-colors ${cat.isActive ? 'bg-brand-green' : 'bg-[#ccc]'}`}>
                                <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${cat.isActive ? 'left-5' : 'left-0.5'}`} />
                              </span>
                              <span className="font-lato text-[12px] text-[#666]">{cat.isActive ? 'Active' : 'Hidden'}</span>
                            </button>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => navigate(`/admin/categories/new?parent=${cat.slug}`)}
                                title="Add sub-category"
                                className="h-8 px-2.5 flex items-center gap-1 border border-[#e0e0e0] text-[#888] rounded-lg font-lato text-[11px] hover:border-brand-green hover:text-brand-green transition-colors cursor-pointer"
                              >
                                <Plus size={12} /> Sub
                              </button>
                              <button
                                onClick={() => navigate(`/admin/categories/${cat._id}/edit`)}
                                className="w-8 h-8 flex items-center justify-center border border-[#e0e0e0] text-[#888] rounded-lg hover:border-brand-green hover:text-brand-green transition-colors cursor-pointer"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(cat)}
                                className="w-8 h-8 flex items-center justify-center border border-red-200 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* ── Sub-category rows (collapsed by default) ── */}
                        {isOpen && subs.map((sub) => (
                          <tr key={sub._id} className={`bg-white border-b border-[#f0f0f0] ${!sub.isActive ? 'opacity-50' : ''}`}>
                            <td className="pl-14 pr-4 py-2.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[#bbb] shrink-0 font-lato text-[13px]">↳</span>
                                <span className="font-lato text-[13px] text-[#444] truncate">{sub.name}</span>
                              </div>
                            </td>

                            <td className="px-4 py-2.5">
                              <span className="font-mono text-[11px] text-[#aaa] bg-[#f5f5f5] px-2 py-0.5 rounded">{sub.slug}</span>
                            </td>

                            <td className="px-4 py-2.5 text-center">
                              <span className="font-lato text-[12px] text-[#ccc]">—</span>
                            </td>

                            <td className="px-4 py-2.5 text-center">
                              <span className="font-lato text-[13px] text-[#aaa]">{sub.order ?? 0}</span>
                            </td>

                            <td className="px-4 py-2.5">
                              <button onClick={() => onToggleActive(sub)} className="flex items-center gap-2 cursor-pointer">
                                <span className={`relative w-9 h-5 rounded-full transition-colors ${sub.isActive ? 'bg-brand-green' : 'bg-[#ccc]'}`}>
                                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${sub.isActive ? 'left-4.5' : 'left-0.5'}`} />
                                </span>
                                <span className="font-lato text-[12px] text-[#888]">{sub.isActive ? 'Active' : 'Hidden'}</span>
                              </button>
                            </td>

                            <td className="px-4 py-2.5">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => navigate(`/admin/categories/${sub._id}/edit`)}
                                  className="w-8 h-8 flex items-center justify-center border border-[#e0e0e0] text-[#888] rounded-lg hover:border-brand-green hover:text-brand-green transition-colors cursor-pointer"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(sub)}
                                  className="w-8 h-8 flex items-center justify-center border border-red-200 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {/* ── Group separator ── */}
                        {!isLast && (
                          <tr>
                            <td colSpan={6} className="h-2 bg-[#f0f0f0]" />
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination footer ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0f0f0]">
                <p className="font-lato text-[12px] text-[#aaa]">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, topLevel.length)} of {topLevel.length} categories
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
        </>
      )}

      {deleteTarget && (
        <DeleteConfirm
          cat={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          busy={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminCategories;
