import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, UploadCloud, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useCategories } from '../../hooks/queries';
import { PageHeader, Card, Spinner } from './adminUI';

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const inputCls = 'w-full h-10 px-3 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green transition-colors';
const labelCls = 'block font-lato text-[12px] text-[#666] mb-1.5';

const GENDER_OPTIONS = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'all',    label: 'All' },
];

const AdminCategoryForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const fileRef = useRef(null);
  const populated = useRef(false);

  // Parent comes from URL param only (set by "+ Sub" button in the table)
  const parentFromUrl = searchParams.get('parent') || '';

  const { data: allCats = [], isLoading: loading } = useCategories({ includeInactive: true });
  const [err, setErr]                 = useState('');
  const [busy, setBusy]               = useState(false);

  const [name, setName]               = useState('');
  const [slug, setSlug]               = useState('');
  const [slugEdited, setSlugEdited]   = useState(false);
  const [parent, setParent]           = useState(parentFromUrl);
  const [order, setOrder]             = useState(0);
  const [isActive, setIsActive]       = useState(true);
  const [gender, setGender]           = useState([]);

  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (!isEdit || !allCats.length || populated.current) return;
    const cat = allCats.find((c) => c._id === id);
    if (!cat) return;
    populated.current = true;
    setName(cat.name);
    setSlug(cat.slug);
    setSlugEdited(true);
    setParent(cat.parent || '');
    setOrder(cat.order ?? 0);
    setIsActive(cat.isActive ?? true);
    setGender(cat.gender || []);
    if (cat.image) setImagePreview(cat.image);
  }, [allCats, id, isEdit]);

  const onName = (e) => {
    setName(e.target.value);
    if (!slugEdited) setSlug(slugify(e.target.value));
  };

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
    e.target.value = '';
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const toggleGender = (val) =>
    setGender((prev) =>
      prev.includes(val) ? prev.filter((g) => g !== val) : [...prev, val]
    );

  // Resolve parent category name for the read-only badge
  const parentName = allCats.find((c) => c.slug === parent)?.name || parent;

  const submit = async () => {
    if (!name.trim()) { setErr('Name is required'); return; }
    if (!slug.trim()) { setErr('Slug is required'); return; }
    setErr(''); setBusy(true);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('slug', slug.trim());
      fd.append('parent', parent);
      fd.append('order', String(Number(order) || 0));
      fd.append('isActive', String(isActive));
      fd.append('gender', JSON.stringify(gender));

      if (imageFile) {
        fd.append('image', imageFile);
      } else if (imagePreview && !imagePreview.startsWith('blob:')) {
        fd.append('image', imagePreview);
      }

      if (isEdit) {
        await api.upload(`/categories/${id}`, fd, 'PUT');
      } else {
        await api.upload('/categories', fd);
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      navigate('/admin/categories');
    } catch (e) {
      setErr(e.message || 'Failed to save');
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <button
        onClick={() => navigate('/admin/categories')}
        className="flex items-center gap-1.5 font-lato text-[13px] text-[#888] hover:text-dark-green transition-colors mb-5 cursor-pointer"
      >
        <ArrowLeft size={15} /> Back to Categories
      </button>

      <PageHeader
        title={isEdit ? 'Edit Category' : parent ? 'New Sub-category' : 'New Category'}
        subtitle={
          isEdit
            ? 'Update category details'
            : parent
            ? `Sub-category under "${parentName}"`
            : 'Add a new top-level category'
        }
      />

      <Card className="max-w-2xl">
        <div className="p-6 flex flex-col gap-5">
          {err && (
            <div className="bg-red-50 border border-red-200 text-red-600 font-lato text-[13px] rounded-lg px-3 py-2">
              {err}
            </div>
          )}

          {/* Parent badge (read-only, shown when set via "+ Sub" button or when editing a sub) */}
          {parent && (
            <div className="flex items-center gap-2">
              <span className="font-lato text-[12px] text-[#888]">Sub-category of:</span>
              <span className="inline-flex items-center h-6 px-2.5 bg-brand-green/10 text-brand-green font-lato font-bold text-[12px] rounded-full">
                {parentName}
              </span>
            </div>
          )}

          {/* Image upload — top-level categories only */}
          {!parent && (
            <div>
              <label className={labelCls}>
                Category Image <span className="font-normal text-[#bbb]">(optional)</span>
              </label>
              <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} className="hidden" />

              {imagePreview ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full rounded-lg border-2 border-dashed border-[#ddd] hover:border-brand-green transition-colors overflow-hidden cursor-pointer block"
                  >
                    <img src={imagePreview} alt="category preview" className="w-full h-40 object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <X size={13} />
                  </button>
                  <p className="font-lato text-[11px] text-[#aaa] mt-1.5">Click image to replace · Recommended: 400×400px</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-32 rounded-lg border-2 border-dashed border-[#ddd] hover:border-brand-green hover:bg-[#f9fdf9] transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <UploadCloud size={22} className="text-[#ccc]" />
                  <span className="font-lato text-[12px] text-[#aaa]">Click to upload image</span>
                  <span className="font-lato text-[11px] text-[#ccc]">Recommended: 400×400px · max 5 MB</span>
                </button>
              )}
            </div>
          )}

          {/* Name */}
          <div>
            <label className={labelCls}>Name *</label>
            <input value={name} onChange={onName} placeholder="e.g. Body Oil" className={inputCls} />
          </div>

          {/* Slug */}
          <div>
            <label className={labelCls}>Slug *</label>
            <input
              value={slug}
              onChange={(e) => { setSlug(slugify(e.target.value)); setSlugEdited(true); }}
              placeholder="body-oil"
              className={inputCls}
            />
            <p className="font-lato text-[11px] text-[#aaa] mt-1">Used in URLs — auto-generated from name</p>
          </div>

          {/* Gender checklist — top-level categories only (sub-categories inherit from parent) */}
          {!parent && <div>
            <label className={labelCls}>Gender</label>
            <div className="flex items-center gap-4">
              {GENDER_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={gender.includes(value)}
                    onChange={() => toggleGender(value)}
                    className="w-4 h-4 rounded border-[#ddd] accent-brand-green cursor-pointer"
                  />
                  <span className="font-lato text-[13px] text-[#555]">{label}</span>
                </label>
              ))}
            </div>
          </div>}

          {/* Display order */}
          <div className="max-w-40">
            <label className={labelCls}>Display Order</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Status */}
          <div>
            <label className={labelCls}>Status</label>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <span className={`relative w-10 h-5.5 rounded-full transition-colors ${isActive ? 'bg-brand-green' : 'bg-[#ccc]'}`}>
                <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${isActive ? 'left-5' : 'left-0.5'}`} />
              </span>
              <span className="font-lato text-[13px] text-[#555]">
                {isActive ? 'Active — visible in store' : 'Hidden — not visible in store'}
              </span>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#ececec] flex items-center gap-3">
          <button
            onClick={submit}
            disabled={busy}
            className="h-11 px-8 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors cursor-pointer disabled:opacity-60"
          >
            {busy ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Category'}
          </button>
          <button
            onClick={() => navigate('/admin/categories')}
            className="h-11 px-6 border border-[#ddd] text-[#666] font-lato text-[13px] rounded-lg hover:border-[#999] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AdminCategoryForm;
