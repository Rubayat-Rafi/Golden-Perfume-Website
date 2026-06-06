import { useEffect, useState, useRef } from 'react';
import { Image as ImageIcon, Plus, X, Trash2, ExternalLink, UploadCloud, GripVertical } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, Card, Spinner, EmptyState } from './adminUI';

const inputCls = 'w-full h-10 px-3 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green';
const labelCls = 'block font-lato text-[12px] text-[#666] mb-1.5';

const CreateModal = ({ onClose, onCreated }) => {
  const [file, setFile]     = useState(null);
  const [preview, setPreview] = useState('');
  const [link, setLink]     = useState('');
  const [title, setTitle]   = useState('');
  const [order, setOrder]   = useState('');
  const [err, setErr]       = useState('');
  const [busy, setBusy]     = useState(false);
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
      fd.append('image', file);
      fd.append('link', link);
      fd.append('title', title);
      fd.append('order', order || '0');
      const d = await api.upload('/banners', fd);
      onCreated(d.data);
      onClose();
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
                  <span className="font-lato text-[11px] text-[#bbb]">JPEG / PNG / WEBP · max 5 MB</span>
                </div>
              )}
            </button>
          </div>

          <div>
            <label className={labelCls}>Link (where the banner sends users)</label>
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/shop  or  https://example.com" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Title (optional)</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Alt text" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Order</label>
              <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} placeholder="0" className={inputCls} />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#ececec]">
          <button onClick={submit} disabled={busy}
            className="w-full h-11 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors cursor-pointer disabled:opacity-60">
            {busy ? 'Uploading…' : 'Upload Banner'}
          </button>
        </div>
      </div>
    </>
  );
};

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/banners/all')
      .then((d) => setBanners(d.data || []))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggleActive = async (b) => {
    try {
      const d = await api.put(`/banners/${b._id}`, { isActive: !b.isActive });
      setBanners((prev) => prev.map((x) => (x._id === d.data._id ? d.data : x)));
    } catch (e) { alert(e.message); }
  };

  const remove = async (b) => {
    if (!confirm('Delete this banner? This cannot be undone.')) return;
    try {
      await api.del(`/banners/${b._id}`);
      setBanners((prev) => prev.filter((x) => x._id !== b._id));
    } catch (e) { alert(e.message); }
  };

  // ── Drag-to-reorder ──────────────────────────────────────────────────────
  const persistOrder = async (list) => {
    setSavingOrder(true);
    const items = list.map((b, i) => ({ id: b._id, order: i }));
    try {
      const d = await api.put('/banners/reorder', { items });
      setBanners(d.data || list);
    } catch (e) {
      alert(e.message || 'Failed to save order');
      load(); // revert to server state on failure
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDragStart = (i) => setDragIndex(i);
  const handleDragEnter = (i) => { if (i !== dragIndex) setOverIndex(i); };

  const handleDrop = () => {
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) {
      setDragIndex(null); setOverIndex(null);
      return;
    }
    const reordered = [...banners];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(overIndex, 0, moved);
    setBanners(reordered);            // optimistic
    setDragIndex(null); setOverIndex(null);
    persistOrder(reordered);          // persist new order
  };

  const handleDragEnd = () => { setDragIndex(null); setOverIndex(null); };

  return (
    <div>
      <PageHeader title="Hero Banners" subtitle="Drag the cards to reorder how banners appear in the hero — each can link anywhere">
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-10 px-4 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-forest transition-colors cursor-pointer">
          <Plus size={15} /> Add Banner
        </button>
      </PageHeader>

      {savingOrder && (
        <p className="font-lato text-[12px] text-brand-green mb-3">Saving new order…</p>
      )}

      {loading ? <Spinner /> : banners.length === 0 ? (
        <Card><EmptyState icon={ImageIcon} title="No banners yet" subtitle="Upload your first hero banner to get started." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {banners.map((b, i) => (
            <Card
              key={b._id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              className={`overflow-hidden transition-all duration-150 ${
                dragIndex === i ? 'opacity-40' : ''
              } ${overIndex === i && dragIndex !== i ? 'ring-2 ring-brand-green ring-offset-2' : ''}`}
            >
              <div className="relative">
                {/* Drag handle */}
                <span className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-white/85 backdrop-blur text-dark-green/60 cursor-grab active:cursor-grabbing shadow-sm" title="Drag to reorder">
                  <GripVertical size={16} />
                </span>
                <img src={b.image} alt={b.title} className="w-full h-44 object-cover bg-[#f0f0f0] pointer-events-none" />
                {!b.isActive && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 text-white rounded-full font-lato font-bold text-[10px] uppercase tracking-[0.5px]">
                    Hidden
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-lato font-bold text-[14px] text-dark-green truncate">{b.title || 'Untitled banner'}</p>
                    {b.link ? (
                      <a href={b.link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 font-lato text-[12px] text-brand-green hover:underline truncate">
                        <ExternalLink size={11} className="shrink-0" /> {b.link}
                      </a>
                    ) : (
                      <span className="font-lato text-[12px] text-[#aaa]">No link</span>
                    )}
                  </div>
                  <span className="shrink-0 font-lato text-[11px] text-[#999]">#{b.order}</span>
                </div>

                <div className="flex items-center justify-between">
                  {/* Active toggle */}
                  <button onClick={() => toggleActive(b)}
                    className="flex items-center gap-2 cursor-pointer">
                    <span className={`relative w-10 h-5.5 rounded-full transition-colors ${b.isActive ? 'bg-brand-green' : 'bg-[#ccc]'}`}>
                      <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${b.isActive ? 'left-5' : 'left-0.5'}`} />
                    </span>
                    <span className="font-lato text-[12px] text-[#666]">{b.isActive ? 'Active' : 'Hidden'}</span>
                  </button>

                  <button onClick={() => remove(b)}
                    className="flex items-center gap-1.5 h-8 px-3 border border-red-200 text-red-500 rounded-lg font-lato text-[12px] hover:bg-red-50 transition-colors cursor-pointer">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreated={(b) => setBanners((prev) => [b, ...prev])} />
      )}
    </div>
  );
};

export default AdminBanners;
