import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon, Plus, X, Trash2, ExternalLink, UploadCloud, GripVertical, Pencil } from 'lucide-react';
import { api } from '../../lib/api';
import { useAllBanners } from '../../hooks/queries';
import { PageHeader, Card, TableSkeleton, EmptyState } from './adminUI';

const inputCls = 'w-full h-10 px-3 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green';
const labelCls = 'block font-lato text-[12px] text-[#666] mb-1.5';

// ── Create modal (unchanged) ──────────────────────────────────────────────────
const CreateModal = ({ onClose, onCreated }) => {
  const [file,           setFile]           = useState(null);
  const [preview,        setPreview]        = useState('');
  const [link,           setLink]           = useState('');
  const [title,          setTitle]          = useState('');
  const [seoTitle,       setSeoTitle]       = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [err,            setErr]            = useState('');
  const [busy,           setBusy]           = useState(false);
  const fileRef = useRef(null);

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) { setErr('Please choose a banner image'); return; }
    setErr(''); setBusy(true);
    try {
      const fd = new FormData();
      fd.append('image',          file);
      fd.append('link',           link);
      fd.append('title',          title);
      fd.append('seoTitle',       seoTitle.trim());
      fd.append('seoDescription', seoDescription.trim());
      await api.upload('/banners', fd);
      onCreated();
    } catch (e) {
      setErr(e.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl z-50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[#ececec] flex items-center justify-between">
          <h3 className="font-playfair text-[18px] text-dark-green">New Banner</h3>
          <button onClick={onClose} className="text-[#999] hover:text-dark-green cursor-pointer"><X size={20} /></button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {err && <div className="bg-red-50 border border-red-200 text-red-600 font-lato text-[13px] rounded-lg px-3 py-2">{err}</div>}

          {/* Image picker */}
          <div>
            <label className={labelCls}>Banner Image *</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={pick} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-lg border-2 border-dashed border-[#ddd] hover:border-brand-green transition-colors overflow-hidden cursor-pointer"
            >
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-40 object-cover" />
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-[#aaa] gap-2">
                  <UploadCloud size={28} />
                  <span className="font-lato text-[13px]">Click to choose an image</span>
                  <span className="font-lato text-[11px] text-[#bbb]">Recommended Size: 1920 × 700 px (Aspect Ratio ~2.74:1) · JPEG/PNG/WEBP · max 5 MB</span>
                </div>
              )}
            </button>
          </div>

          <div>
            <label className={labelCls}>Link (where the banner sends users)</label>
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/shop  or  https://example.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Title (optional)</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Alt text" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>SEO Title <span className="font-normal text-[#bbb]">(optional)</span></label>
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} placeholder="Homepage banner – Golden Perfume" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Meta Description <span className="font-normal text-[#bbb]">(optional)</span></label>
            <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} maxLength={160} rows={2} placeholder="Brief description for search engines…" className={`${inputCls} h-auto py-2.5 resize-none`} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#ececec]">
          <button
            onClick={submit}
            disabled={busy}
            className="w-full h-11 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors cursor-pointer disabled:opacity-60"
          >
            {busy ? 'Uploading…' : 'Upload Banner'}
          </button>
        </div>
      </div>
    </>
  );
};

// ── Edit modal ────────────────────────────────────────────────────────────────
const EditModal = ({ banner, onClose, onSaved }) => {
  const [file,           setFile]           = useState(null);
  const [preview,        setPreview]        = useState(banner.image);
  const [link,           setLink]           = useState(banner.link           || '');
  const [title,          setTitle]          = useState(banner.title          || '');
  const [seoTitle,       setSeoTitle]       = useState(banner.seoTitle       || '');
  const [seoDescription, setSeoDescription] = useState(banner.seoDescription || '');
  const [err,            setErr]            = useState('');
  const [busy,           setBusy]           = useState(false);
  const fileRef = useRef(null);

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    setErr(''); setBusy(true);
    try {
      const fd = new FormData();
      if (file) fd.append('image', file);
      fd.append('link',           link);
      fd.append('title',          title);
      fd.append('seoTitle',       seoTitle.trim());
      fd.append('seoDescription', seoDescription.trim());
      await api.upload(`/banners/${banner._id}`, fd, 'PUT');
      onSaved();
    } catch (e) {
      setErr(e.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl z-50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[#ececec] flex items-center justify-between">
          <h3 className="font-playfair text-[18px] text-dark-green">Edit Banner</h3>
          <button onClick={onClose} className="text-[#999] hover:text-dark-green cursor-pointer"><X size={20} /></button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {err && <div className="bg-red-50 border border-red-200 text-red-600 font-lato text-[13px] rounded-lg px-3 py-2">{err}</div>}

          {/* Image — click to replace */}
          <div>
            <label className={labelCls}>Banner Image <span className="font-normal text-[#bbb]">(click to replace)</span></label>
            <input ref={fileRef} type="file" accept="image/*" onChange={pick} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-lg border-2 border-dashed border-[#ddd] hover:border-brand-green transition-colors overflow-hidden cursor-pointer"
            >
              <img src={preview} alt="banner preview" className="w-full h-40 object-cover" />
            </button>
            <p className="font-lato text-[11px] text-[#bbb] mt-1.5">Recommended Size: 1920 × 700 px (Aspect Ratio ~2.74:1) · JPEG/PNG/WEBP · max 5 MB</p>
          </div>

          <div>
            <label className={labelCls}>Link</label>
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/shop  or  https://example.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Title (optional)</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Alt text" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>SEO Title <span className="font-normal text-[#bbb]">(optional)</span></label>
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} placeholder="Homepage banner – Golden Perfume" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Meta Description <span className="font-normal text-[#bbb]">(optional)</span></label>
            <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} maxLength={160} rows={2} placeholder="Brief description for search engines…" className={`${inputCls} h-auto py-2.5 resize-none`} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#ececec]">
          <button
            onClick={submit}
            disabled={busy}
            className="w-full h-11 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors cursor-pointer disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
};

// ── AdminBanners ──────────────────────────────────────────────────────────────
const AdminBanners = () => {
  const queryClient = useQueryClient();
  const invalidate  = () => queryClient.invalidateQueries({ queryKey: ['banners'] });

  const { data: banners = [], isLoading: loading } = useAllBanners();
  const [showCreate,    setShowCreate]    = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [dragIndex,     setDragIndex]     = useState(null);
  const [overIndex,     setOverIndex]     = useState(null);
  const [localBanners,  setLocalBanners]  = useState(null); // only during drag-reorder

  const displayBanners = localBanners ?? banners;

  const toggleMutation = useMutation({
    mutationFn: (b) => api.put(`/banners/${b._id}`, { isActive: !b.isActive }),
    onSuccess: invalidate,
    onError: (e) => alert(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (b) => api.del(`/banners/${b._id}`),
    onSuccess: invalidate,
    onError: (e) => alert(e.message),
  });

  const reorderMutation = useMutation({
    mutationFn: (list) => api.put('/banners/reorder', { items: list.map((b, i) => ({ id: b._id, order: i })) }),
    onSuccess: () => { invalidate(); setLocalBanners(null); },
    onError: (e) => { alert(e.message || 'Failed to save order'); setLocalBanners(null); },
  });

  const remove = (b) => {
    if (!confirm('Delete this banner? This cannot be undone.')) return;
    deleteMutation.mutate(b);
  };

  // ── Drag-to-reorder ─────────────────────────────────────────────────────────
  const handleDragStart = (i) => { setDragIndex(i); setLocalBanners([...displayBanners]); };
  const handleDragEnter = (i) => { if (i !== dragIndex) setOverIndex(i); };
  const handleDrop = () => {
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) {
      setDragIndex(null); setOverIndex(null); setLocalBanners(null);
      return;
    }
    const reordered = [...displayBanners];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(overIndex, 0, moved);
    setLocalBanners(reordered);
    setDragIndex(null); setOverIndex(null);
    reorderMutation.mutate(reordered);
  };
  const handleDragEnd = () => { setDragIndex(null); setOverIndex(null); };

  return (
    <div>
      <PageHeader
        title="Hero Banners"
        subtitle="Drag rows to reorder — each banner can link anywhere on the site"
      >
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-10 px-4 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-forest transition-colors cursor-pointer"
        >
          <Plus size={15} /> Add Banner
        </button>
      </PageHeader>

      {reorderMutation.isPending && (
        <p className="font-lato text-[12px] text-brand-green mb-3">Saving new order…</p>
      )}

      {loading ? (
        <TableSkeleton cols={5} />
      ) : displayBanners.length === 0 ? (
        <Card>
          <EmptyState icon={ImageIcon} title="No banners yet" subtitle="Upload your first hero banner to get started." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-left">
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] w-12 px-4 py-3" />
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Preview</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Title / Link</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Status</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayBanners.map((b, i) => (
                  <tr
                    key={b._id}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragEnter={() => handleDragEnter(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    className={[
                      'border-b border-[#f5f5f5] last:border-0 transition-colors',
                      dragIndex === i ? 'opacity-40 bg-[#f9f9f9]' : 'hover:bg-[#fafafa]',
                      overIndex === i && dragIndex !== i ? 'border-t-2 border-t-brand-green' : '',
                    ].join(' ')}
                  >
                    {/* Drag handle */}
                    <td className="px-4 py-3 w-12">
                      <div className="flex items-center gap-2 text-[#bbb] cursor-grab active:cursor-grabbing">
                        <GripVertical size={16} />
                        <span className="font-lato text-[11px] text-[#ccc]">#{i + 1}</span>
                      </div>
                    </td>

                    {/* Thumbnail */}
                    <td className="px-3 py-3">
                      <div className="relative w-24 h-14 rounded overflow-hidden bg-[#f0f0f0] shrink-0">
                        <img
                          src={b.image}
                          alt={b.title || 'Banner'}
                          className="w-full h-full object-cover"
                        />
                        {!b.isActive && (
                          <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="font-lato text-white text-[9px] uppercase font-bold tracking-[0.5px]">Hidden</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Title / Link */}
                    <td className="px-3 py-3 max-w-xs">
                      <p className="font-lato font-bold text-[13px] text-dark-green truncate">
                        {b.title || <span className="text-[#bbb] font-normal">Untitled</span>}
                      </p>
                      {b.link ? (
                        <a
                          href={b.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 font-lato text-[12px] text-brand-green hover:underline truncate mt-0.5"
                        >
                          <ExternalLink size={11} className="shrink-0" />
                          {b.link}
                        </a>
                      ) : (
                        <span className="font-lato text-[12px] text-[#bbb]">No link</span>
                      )}
                    </td>

                    {/* Status toggle */}
                    <td className="px-3 py-3">
                      <button onClick={() => toggleMutation.mutate(b)} className="flex items-center gap-2 cursor-pointer">
                        <span className={`relative w-10 h-5.5 rounded-full transition-colors ${b.isActive ? 'bg-brand-green' : 'bg-[#ccc]'}`}>
                          <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${b.isActive ? 'left-5' : 'left-0.5'}`} />
                        </span>
                        <span className="font-lato text-[12px] text-[#666]">
                          {b.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingBanner(b)}
                          className="flex items-center gap-1.5 h-8 px-3 border border-[#e0e0e0] text-[#888] rounded-lg font-lato text-[12px] hover:border-brand-green hover:text-brand-green transition-colors cursor-pointer"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          onClick={() => remove(b)}
                          className="flex items-center gap-1.5 h-8 px-3 border border-red-200 text-red-500 rounded-lg font-lato text-[12px] hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { invalidate(); setShowCreate(false); }}
        />
      )}

      {editingBanner && (
        <EditModal
          banner={editingBanner}
          onClose={() => setEditingBanner(null)}
          onSaved={() => { invalidate(); setEditingBanner(null); }}
        />
      )}
    </div>
  );
};

export default AdminBanners;
