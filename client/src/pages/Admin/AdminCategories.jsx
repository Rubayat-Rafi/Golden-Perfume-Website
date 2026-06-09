import { useEffect, useState } from 'react';
import { FolderTree, Plus, X, Trash2, Pencil, ChevronRight, ChevronDown, CornerDownRight } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, Card, Spinner, EmptyState } from './adminUI';

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Build a flat list with depth from the parent links (for dropdowns)
const flatten = (cats, parent = '', depth = 0) => {
  const out = [];
  cats.filter((c) => (c.parent || '') === parent)
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
      .forEach((c) => {
        out.push({ ...c, depth });
        out.push(...flatten(cats, c.slug, depth + 1));
      });
  return out;
};

const inputCls = 'w-full h-10 px-3 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green';
const labelCls = 'block font-lato text-[12px] text-[#666] mb-1.5';

const CategoryModal = ({ all, initial, defaultParent, onClose, onSaved }) => {
  const editing = !!initial;
  const [name, setName]     = useState(initial?.name || '');
  const [slug, setSlug]     = useState(initial?.slug || '');
  const [slugEdited, setSlugEdited] = useState(editing);
  const [parent, setParent] = useState(initial?.parent ?? defaultParent ?? '');
  const [image, setImage]   = useState(initial?.image || '');
  const [order, setOrder]   = useState(initial?.order ?? 0);
  const [err, setErr]       = useState('');
  const [busy, setBusy]     = useState(false);

  const onName = (e) => {
    setName(e.target.value);
    if (!slugEdited) setSlug(slugify(e.target.value));
  };

  const submit = async () => {
    setErr(''); setBusy(true);
    try {
      const body = { name, slug, parent, image, order: Number(order) || 0 };
      const d = editing
        ? await api.put(`/categories/${initial._id}`, body)
        : await api.post('/categories', body);
      onSaved(d.data, editing);
      onClose();
    } catch (e) {
      setErr(e.message || 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  // Parent options exclude self + descendants when editing
  const parentOptions = flatten(all).filter((c) => c._id !== initial?._id);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl z-50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[#ececec] flex items-center justify-between">
          <h3 className="font-playfair text-[18px] text-dark-green">{editing ? 'Edit Category' : 'New Category'}</h3>
          <button onClick={onClose} className="text-[#999] hover:text-dark-green cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {err && <div className="bg-red-50 border border-red-200 text-red-600 font-lato text-[13px] rounded-lg px-3 py-2">{err}</div>}
          <div>
            <label className={labelCls}>Name *</label>
            <input value={name} onChange={onName} placeholder="e.g. Body Oil" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugEdited(true); }} placeholder="body-oil" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Parent Category</label>
            <select value={parent} onChange={(e) => setParent(e.target.value)} className={`${inputCls} bg-white`}>
              <option value="">— Top level —</option>
              {parentOptions.map((c) => (
                <option key={c._id} value={c.slug}>{' '.repeat(c.depth * 3)}{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Order</label>
              <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Image URL</label>
              <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="/assets/brand/…" className={inputCls} />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#ececec]">
          <button onClick={submit} disabled={busy}
            className="w-full h-11 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors cursor-pointer disabled:opacity-60">
            {busy ? 'Saving…' : editing ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>
    </>
  );
};

// Recursive tree row
const TreeNode = ({ node, cats, depth, expanded, toggle, onAddSub, onEdit, onDelete, onToggleActive }) => {
  const children = cats.filter((c) => (c.parent || '') === node.slug).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  const hasChildren = children.length > 0;
  const open = expanded.has(node._id);

  return (
    <>
      <div className={`flex items-center gap-2 py-2.5 px-3 rounded-lg hover:bg-[#fafafa] ${!node.isActive ? 'opacity-50' : ''}`} style={{ paddingLeft: depth * 22 + 12 }}>
        <button onClick={() => toggle(node._id)} className={`w-5 h-5 flex items-center justify-center text-[#999] shrink-0 ${hasChildren ? 'cursor-pointer hover:text-dark-green' : 'invisible'}`}>
          {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>
        {depth > 0 && <CornerDownRight size={13} className="text-[#ccc] shrink-0 -ml-1" />}
        <div className="flex-1 min-w-0">
          <p className="font-lato font-bold text-[13px] text-dark-green truncate">{node.name}</p>
          <p className="font-lato text-[11px] text-[#aaa] truncate">/{node.slug}{hasChildren ? ` · ${children.length} sub` : ''}</p>
        </div>
        <button onClick={() => onToggleActive(node)} title={node.isActive ? 'Active' : 'Hidden'}
          className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${node.isActive ? 'bg-brand-green' : 'bg-[#ccc]'}`}>
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${node.isActive ? 'left-4.5' : 'left-0.5'}`} />
        </button>
        <button onClick={() => onAddSub(node)} title="Add sub-category" className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-brand-green cursor-pointer shrink-0"><Plus size={15} /></button>
        <button onClick={() => onEdit(node)} title="Edit" className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-brand-green cursor-pointer shrink-0"><Pencil size={14} /></button>
        <button onClick={() => onDelete(node)} title="Delete" className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 cursor-pointer shrink-0"><Trash2 size={14} /></button>
      </div>
      {open && children.map((c) => (
        <TreeNode key={c._id} node={c} cats={cats} depth={depth + 1}
          expanded={expanded} toggle={toggle} onAddSub={onAddSub} onEdit={onEdit} onDelete={onDelete} onToggleActive={onToggleActive} />
      ))}
    </>
  );
};

const AdminCategories = () => {
  const [cats, setCats]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(new Set());
  const [modal, setModal]     = useState(null); // { initial?, defaultParent? }

  const load = () => {
    setLoading(true);
    api.get('/categories?includeInactive=true')
      .then((d) => setCats(d.data || []))
      .catch(() => setCats([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggle = (id) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const onSaved = () => load();   // reload to keep the tree consistent

  const onDelete = async (node) => {
    const kids = cats.filter((c) => c.parent === node.slug);
    if (!confirm(`Hide "${node.name}"?${kids.length ? ` It has ${kids.length} sub-categ/ies which will remain.` : ''}`)) return;
    try {
      await api.del(`/categories/${node._id}`);
      load();
    } catch (e) { alert(e.message); }
  };

  const onToggleActive = async (node) => {
    try {
      await api.put(`/categories/${node._id}`, { isActive: !node.isActive });
      setCats((prev) => prev.map((c) => (c._id === node._id ? { ...c, isActive: !node.isActive } : c)));
    } catch (e) { alert(e.message); }
  };

  const tops = cats.filter((c) => !c.parent).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  return (
    <div>
      <PageHeader title="Categories" subtitle="Build your category tree — add sub-categories to any level">
        <button onClick={() => setModal({ defaultParent: '' })}
          className="flex items-center gap-2 h-10 px-4 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-forest transition-colors cursor-pointer">
          <Plus size={15} /> Add Category
        </button>
      </PageHeader>

      {loading ? <Spinner /> : tops.length === 0 ? (
        <Card><EmptyState icon={FolderTree} title="No categories yet" subtitle="Create your first top-level category." /></Card>
      ) : (
        <Card className="p-3">
          {tops.map((c) => (
            <TreeNode key={c._id} node={c} cats={cats} depth={0}
              expanded={expanded} toggle={toggle}
              onAddSub={(parent) => { setExpanded((p) => new Set(p).add(parent._id)); setModal({ defaultParent: parent.slug }); }}
              onEdit={(node) => setModal({ initial: node })}
              onDelete={onDelete}
              onToggleActive={onToggleActive} />
          ))}
        </Card>
      )}

      {modal && (
        <CategoryModal
          all={cats}
          initial={modal.initial}
          defaultParent={modal.defaultParent}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
};

export default AdminCategories;
