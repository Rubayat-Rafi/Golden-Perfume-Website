import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, UploadCloud, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import axiosSecure from '../../lib/axiosSecure';
import { useCategories } from '../../hooks/queries';
import { PageHeader, Card, FormSkeleton } from './adminUI';
import RichEditor from '../../components/RichEditor/RichEditor';

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const genNum  = () => `GP-${Math.floor(100000 + Math.random() * 900000)}`;

const inputCls = 'w-full h-10 px-3 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green transition-colors';
const labelCls = 'block font-lato text-[12px] text-[#666] mb-1.5';

const blankVariant = () => ({ sku: '', size: '', color: '', retailPrice: '', wholesalePrice: '', inStock: true, stockQty: '' });

const AdminProductForm = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit   = !!id;

  const mainImgRef    = useRef(null);
  const galleryImgRef = useRef(null);

  const { data: allCats = [] } = useCategories({ includeInactive: true });
  const allCatsRef = useRef([]);
  allCatsRef.current = allCats;
  const [loading,  setLoading]  = useState(true);
  const [err,      setErr]      = useState('');
  const [busy,     setBusy]     = useState(false);
  // key increments after async load so RichEditors re-mount with correct initialValue
  const [editorKey, setEditorKey] = useState(0);

  // Basic fields
  const [pNum,       setPNum]       = useState(genNum());
  const [name,       setName]       = useState('');
  const [slug,       setSlug]       = useState('');
  const [slugEd,     setSlugEd]     = useState(false);
  const [topCatSlug, setTopCatSlug] = useState('');
  const [subCatSlug, setSubCatSlug] = useState('');
  const [gender,     setGender]     = useState('');

  // Rich text
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc,  setFullDesc]  = useState('');

  // Flags
  const [isFeatured, setFeatured] = useState(false);
  const [isNew,      setIsNew]    = useState(false);
  const [isSale,     setIsSale]   = useState(false);
  const [isStocked,  setStocked]  = useState(true);
  const [isActive,   setActive]   = useState(true);

  // Main image
  const [mainImgFile,    setMainImgFile]    = useState(null);
  const [mainImgPreview, setMainImgPreview] = useState('');

  // Gallery images — split into kept existing URLs and new File objects
  const [galleryUrls,  setGalleryUrls]  = useState([]); // existing URLs to keep
  const [galleryFiles, setGalleryFiles] = useState([]); // new File objects + blob previews
  // galleryFiles entries: { file: File, preview: string }

  // SEO
  const [seoTitle,       setSeoTitle]       = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Variants
  const [variants, setVariants] = useState([blankVariant()]);

  useEffect(() => {
    if (!isEdit) { setLoading(false); return; }
    let active = true;
    (async () => {
      try {
        const res = await axiosSecure.get(`/products/admin/${id}`);
        const product = res.data?.data;
        if (product && active) {
          setPNum(product.productNumber || genNum());
          setName(product.name || '');
          setSlug(product.slug || '');
          setSlugEd(true);
          setGender(product.gender || '');
          setShortDesc(product.description || '');
          setFullDesc(product.content || '');
          setFeatured(product.isFeatured ?? false);
          setIsNew(product.isNew ?? false);
          setIsSale(product.isSale ?? false);
          setStocked(product.isStocked ?? true);
          setActive(product.isActive ?? true);
          // Split saved categorySlug back into top-level + optional sub
          const savedCat = allCatsRef.current.find((c) => c.slug === product.categorySlug);
          if (savedCat?.parent) {
            setTopCatSlug(savedCat.parent);
            setSubCatSlug(product.categorySlug);
          } else {
            setTopCatSlug(product.categorySlug || '');
            setSubCatSlug('');
          }
          setSeoTitle(product.seoTitle || '');
          setSeoDescription(product.seoDescription || '');
          if (product.image)               setMainImgPreview(product.image);
          if (product.imageGallery?.length) setGalleryUrls(product.imageGallery);
          if (product.variants?.length) {
            setVariants(product.variants.map((v) => ({
              sku:            v.sku            ?? '',
              size:           v.size           ?? '',
              color:          v.color          ?? '',
              retailPrice:    v.retailPrice    ?? '',
              wholesalePrice: v.wholesalePrice ?? '',
              inStock:        v.inStock        !== false,
              stockQty:       v.stockQty       ?? '',
            })));
          }
          setEditorKey((k) => k + 1);
        }
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id, isEdit]);

  const onName = (v) => {
    setName(v);
    if (!slugEd) setSlug(slugify(v));
  };

  const onTopCat = (s) => {
    setTopCatSlug(s);
    setSubCatSlug('');
  };

  const pickMainImg = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMainImgFile(f);
    setMainImgPreview(URL.createObjectURL(f));
    e.target.value = '';
  };

  const pickGalleryImgs = (e) => {
    const files = Array.from(e.target.files || []);
    const newEntries = files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setGalleryFiles((prev) => [...prev, ...newEntries]);
    e.target.value = '';
  };

  const removeGalleryUrl  = (url)  => setGalleryUrls((prev) => prev.filter((u) => u !== url));
  const removeGalleryFile = (idx)  => setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));

  // Variant helpers
  const addVariant = () => setVariants((v) => [...v, blankVariant()]);
  const delVariant = (i) => setVariants((v) => v.filter((_, j) => j !== i));
  const setVf      = (i, f, val) => setVariants((v) => v.map((r, j) => j === i ? { ...r, [f]: val } : r));

  const submit = async () => {
    const finalCat = subCatSlug
      ? allCats.find((c) => c.slug === subCatSlug)
      : allCats.find((c) => c.slug === topCatSlug);

    if (!name.trim())       { setErr('Product name is required'); return; }
    if (!finalCat)          { setErr('Category is required'); return; }
    if (!pNum.trim())       { setErr('Product number is required'); return; }
    const missingWholesale = variants.some((v) => !v.wholesalePrice || Number(v.wholesalePrice) <= 0);
    if (missingWholesale)   { setErr('Wholesale price is required for all variants'); return; }
    setErr(''); setBusy(true);
    try {
      const fd = new FormData();
      fd.append('productNumber', pNum.trim());
      fd.append('name',         name.trim());
      fd.append('slug',         slug.trim() || slugify(name));
      fd.append('categorySlug', finalCat.slug);
      fd.append('categoryName', finalCat.name);
      fd.append('gender',       gender);
      fd.append('description',  shortDesc);
      fd.append('content',      fullDesc);
      fd.append('isFeatured',      String(isFeatured));
      fd.append('isNew',           String(isNew));
      fd.append('isSale',          String(isSale));
      fd.append('isStocked',       String(isStocked));
      fd.append('isActive',        String(isActive));
      fd.append('seoTitle',        seoTitle.trim());
      fd.append('seoDescription',  seoDescription.trim());
      fd.append('variants', JSON.stringify(
        variants.map((v) => ({
          sku:            v.sku,
          size:           v.size,
          color:          v.color?.trim() || '',
          retailPrice:    Number(v.retailPrice)    || 0,
          wholesalePrice: Number(v.wholesalePrice) || 0,
          inStock:        v.inStock,
          stockQty:       Number(v.stockQty)       || 0,
        }))
      ));

      // Main image
      if (mainImgFile) {
        fd.append('image', mainImgFile);
      } else if (mainImgPreview && !mainImgPreview.startsWith('blob:')) {
        fd.append('image', mainImgPreview);
      }

      // Gallery: existing kept URLs + new files
      fd.append('existingGallery', JSON.stringify(galleryUrls));
      galleryFiles.forEach(({ file }) => fd.append('imageGallery', file));

      if (isEdit) {
        await api.upload(`/products/${id}`, fd, 'PUT');
      } else {
        await api.upload('/products', fd);
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products');
    } catch (e) {
      setErr(e.message || 'Failed to save');
      setBusy(false);
    }
  };

  const totalGallery = galleryUrls.length + galleryFiles.length;

  if (loading) return <FormSkeleton />;

  return (
    <div>
      <button
        onClick={() => navigate('/admin/products')}
        className="flex items-center gap-1.5 font-lato text-[13px] text-[#888] hover:text-dark-green transition-colors mb-5 cursor-pointer"
      >
        <ArrowLeft size={15} /> Back to Products
      </button>

      <PageHeader
        title={isEdit ? 'Edit Product' : 'New Product'}
        subtitle={isEdit ? 'Update product details' : 'Add a new product to your store'}
      />

      <div className="flex flex-col gap-5 max-w-3xl">

        {/* ── Basic Info ── */}
        <Card>
          <div className="px-6 py-4 border-b border-[#f0f0f0]">
            <h2 className="font-playfair text-[16px] text-dark-green">Basic Info</h2>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {err && (
              <div className="bg-red-50 border border-red-200 text-red-600 font-lato text-[13px] rounded-lg px-3 py-2">
                {err}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Product Number *</label>
                <input value={pNum} onChange={(e) => setPNum(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Name *</label>
                <input value={name} onChange={(e) => onName(e.target.value)} placeholder="Rose Body Oil" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Slug *</label>
              <input
                value={slug}
                onChange={(e) => { setSlug(slugify(e.target.value)); setSlugEd(true); }}
                placeholder="rose-body-oil"
                className={inputCls}
              />
              <p className="font-lato text-[11px] text-[#aaa] mt-1">Used in URLs — auto-generated from name</p>
            </div>

            <div>
              <label className={labelCls}>Category *</label>
              <select value={topCatSlug} onChange={(e) => onTopCat(e.target.value)} className={`${inputCls} bg-white`}>
                <option value="">— Select category —</option>
                {allCats
                  .filter((c) => !c.parent)
                  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
                  .map((c) => (
                    <option key={c._id} value={c.slug}>{c.name}</option>
                  ))}
              </select>
            </div>

            {topCatSlug && allCats.filter((c) => c.parent === topCatSlug).length > 0 && (
              <div>
                <label className={labelCls}>
                  Sub-category <span className="text-[#bbb] font-normal">(optional)</span>
                </label>
                <select value={subCatSlug} onChange={(e) => setSubCatSlug(e.target.value)} className={`${inputCls} bg-white`}>
                  <option value="">— None (use parent category) —</option>
                  {allCats
                    .filter((c) => c.parent === topCatSlug)
                    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
                    .map((c) => (
                      <option key={c._id} value={c.slug}>{c.name}</option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className={labelCls}>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={`${inputCls} bg-white`}>
                <option value="">— Unspecified —</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>
        </Card>

        {/* ── Short Description ── */}
        <Card>
          <div className="px-6 py-4 border-b border-[#f0f0f0]">
            <h2 className="font-playfair text-[16px] text-dark-green">Short Description</h2>
            <p className="font-lato text-[12px] text-[#aaa] mt-0.5">Brief summary shown on product cards and listings</p>
          </div>
          <div className="p-6">
            <RichEditor
              key={`short-${editorKey}`}
              initialValue={shortDesc}
              onChange={setShortDesc}
              placeholder="Write a short product summary…"
              minHeight={120}
            />
          </div>
        </Card>

        {/* ── Full Description ── */}
        <Card>
          <div className="px-6 py-4 border-b border-[#f0f0f0]">
            <h2 className="font-playfair text-[16px] text-dark-green">Full Description</h2>
            <p className="font-lato text-[12px] text-[#aaa] mt-0.5">Detailed content shown on the product detail page</p>
          </div>
          <div className="p-6">
            <RichEditor
              key={`full-${editorKey}`}
              initialValue={fullDesc}
              onChange={setFullDesc}
              placeholder="Write detailed product information, ingredients, usage instructions…"
              minHeight={220}
            />
          </div>
        </Card>

        {/* ── Images ── */}
        <Card>
          <div className="px-6 py-4 border-b border-[#f0f0f0]">
            <h2 className="font-playfair text-[16px] text-dark-green">Images</h2>
            <p className="font-lato text-[12px] text-[#aaa] mt-0.5">Main image shown first; gallery images appear in the product slideshow</p>
          </div>
          <div className="p-6 flex flex-col gap-5">

            {/* Main image */}
            <div>
              <p className={labelCls}>Main Image</p>
              <input ref={mainImgRef} type="file" accept="image/*" onChange={pickMainImg} className="hidden" />
              {mainImgPreview ? (
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => mainImgRef.current?.click()}
                    className="block rounded-xl border-2 border-dashed border-[#ddd] hover:border-brand-green transition-colors overflow-hidden cursor-pointer"
                  >
                    <img src={mainImgPreview} alt="main" className="w-44 h-44 object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMainImgFile(null); setMainImgPreview(''); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                  <p className="font-lato text-[11px] text-[#aaa] mt-1.5">Click to replace</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => mainImgRef.current?.click()}
                  className="w-44 h-44 rounded-xl border-2 border-dashed border-[#ddd] hover:border-brand-green hover:bg-[#f9fdf9] transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <UploadCloud size={22} className="text-[#ccc]" />
                  <span className="font-lato text-[12px] text-[#aaa] text-center px-2">Upload main image</span>
                  <span className="font-lato text-[10px] text-[#ccc] text-center px-2">800×800px recommended</span>
                </button>
              )}
              <p className="font-lato text-[11px] text-[#bbb] mt-1.5">Recommended: 800×800px square · JPEG/PNG/WEBP · max 5 MB</p>
            </div>

            {/* Gallery */}
            <div>
              <p className={labelCls}>Gallery Images <span className="text-[#bbb]">({totalGallery} / 10)</span></p>
              <input
                ref={galleryImgRef}
                type="file"
                accept="image/*"
                multiple
                onChange={pickGalleryImgs}
                className="hidden"
              />
              <div className="flex flex-wrap gap-3">
                {/* Existing saved URLs */}
                {galleryUrls.map((url) => (
                  <div key={url} className="relative">
                    <img src={url} alt="" className="w-24 h-24 object-cover rounded-lg border border-[#eee]" />
                    <button
                      type="button"
                      onClick={() => removeGalleryUrl(url)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}

                {/* Newly picked files */}
                {galleryFiles.map(({ preview }, idx) => (
                  <div key={idx} className="relative">
                    <img src={preview} alt="" className="w-24 h-24 object-cover rounded-lg border-2 border-brand-green/40" />
                    <button
                      type="button"
                      onClick={() => removeGalleryFile(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}

                {/* Add button — only if under limit */}
                {totalGallery < 10 && (
                  <button
                    type="button"
                    onClick={() => galleryImgRef.current?.click()}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-[#ddd] hover:border-brand-green hover:bg-[#f9fdf9] transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus size={18} className="text-[#ccc]" />
                    <span className="font-lato text-[11px] text-[#bbb]">Add</span>
                  </button>
                )}
              </div>
              <p className="font-lato text-[11px] text-[#bbb] mt-2">JPEG, PNG, WEBP — max 5 MB each — up to 10 images</p>
            </div>
          </div>
        </Card>

        {/* ── Variants / Pricing ── */}
        <Card>
          <div className="px-6 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
            <div>
              <h2 className="font-playfair text-[16px] text-dark-green">Variants & Pricing</h2>
              <p className="font-lato text-[12px] text-[#aaa] mt-0.5">Each variant has individual retail and wholesale prices</p>
            </div>
            <button
              onClick={addVariant}
              className="flex items-center gap-1.5 h-8 px-3 border border-brand-green/40 text-brand-green rounded-lg font-lato text-[12px] hover:bg-brand-green/5 transition-colors cursor-pointer"
            >
              <Plus size={13} /> Add Variant
            </button>
          </div>

          <div className="p-6">
            {variants.length === 0 ? (
              <p className="text-center font-lato text-[13px] text-[#bbb] py-6">No variants yet — click "Add Variant"</p>
            ) : (
              <div className="flex flex-col gap-3">
                {variants.map((v, i) => (
                  <div key={i} className="border border-[#eee] rounded-xl p-4 flex flex-col gap-3 relative">
                    {variants.length > 1 && (
                      <button
                        onClick={() => delVariant(i)}
                        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-[#ccc] hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}

                    <p className="font-lato text-[11px] uppercase tracking-[1px] text-[#bbb]">Variant {i + 1}</p>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls}>Label / Size</label>
                        <input
                          value={v.size}
                          onChange={(e) => setVf(i, 'size', e.target.value)}
                          placeholder="e.g. 1 oz, 100ml, Small"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Color <span className="text-[#bbb] font-normal">(optional)</span></label>
                        <input
                          value={v.color}
                          onChange={(e) => setVf(i, 'color', e.target.value)}
                          placeholder="e.g. Red, Ocean Blue"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>SKU</label>
                        <input
                          value={v.sku}
                          onChange={(e) => setVf(i, 'sku', e.target.value)}
                          placeholder="SKU-001"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls}>Retail Price ($)</label>
                        <input
                          type="number" min="0" step="0.01"
                          value={v.retailPrice}
                          onChange={(e) => setVf(i, 'retailPrice', e.target.value)}
                          placeholder="0.00"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Wholesale Price ($) <span className="text-red-500">*</span></label>
                        <input
                          type="number" min="0" step="0.01" required
                          value={v.wholesalePrice}
                          onChange={(e) => setVf(i, 'wholesalePrice', e.target.value)}
                          placeholder="0.00"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Stock Qty</label>
                        <input
                          type="number" min="0"
                          value={v.stockQty}
                          onChange={(e) => setVf(i, 'stockQty', e.target.value)}
                          placeholder="0"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => setVf(i, 'inStock', !v.inStock)}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <span className={`relative w-9 h-5 rounded-full transition-colors ${v.inStock ? 'bg-brand-green' : 'bg-[#ccc]'}`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${v.inStock ? 'left-4.5' : 'left-0.5'}`} />
                        </span>
                        <span className="font-lato text-[13px] text-[#555]">{v.inStock ? 'In stock' : 'Out of stock'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* ── Flags ── */}
        <Card>
          <div className="px-6 py-4 border-b border-[#f0f0f0]">
            <h2 className="font-playfair text-[16px] text-dark-green">Flags & Status</h2>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {[
              ['Featured',    isFeatured, setFeatured, 'Show in featured section on the homepage'],
              ['New Arrival', isNew,      setIsNew,    'Badge as a new product'],
              ['On Sale',     isSale,     setIsSale,   'Show sale badge on product card'],
              ['In Stock',    isStocked,  setStocked,  'Product is available to order'],
              ['Active',      isActive,   setActive,   'Visible on the storefront'],
            ].map(([label, val, set, hint]) => (
              <div key={label} className="flex items-center justify-between">
                <div>
                  <p className="font-lato text-[13px] text-dark-green">{label}</p>
                  <p className="font-lato text-[11px] text-[#aaa]">{hint}</p>
                </div>
                <button
                  type="button"
                  onClick={() => set((v) => !v)}
                  className="cursor-pointer shrink-0"
                >
                  <span className={`relative w-10 h-5.5 rounded-full transition-colors block ${val ? 'bg-brand-green' : 'bg-[#ccc]'}`}>
                    <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${val ? 'left-5' : 'left-0.5'}`} />
                  </span>
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* ── SEO ── */}
        <Card>
          <div className="px-6 py-4 border-b border-[#f0f0f0]">
            <h2 className="font-playfair text-[16px] text-dark-green">SEO</h2>
            <p className="font-lato text-[12px] text-[#aaa] mt-0.5">Controls title tag and meta description shown in search results</p>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div>
              <label className={labelCls}>SEO Title <span className="text-[#bbb] font-normal">(defaults to product name)</span></label>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="e.g. Rose Body Oil – Natural Fragrance | Golden Perfume"
                maxLength={70}
                className={inputCls}
              />
              <p className="font-lato text-[11px] text-[#aaa] mt-1">{seoTitle.length}/70 characters</p>
            </div>
            <div>
              <label className={labelCls}>Meta Description <span className="text-[#bbb] font-normal">(defaults to short description)</span></label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Brief description for search engines…"
                maxLength={160}
                rows={3}
                className={`${inputCls} h-auto py-2.5 resize-none`}
              />
              <p className="font-lato text-[11px] text-[#aaa] mt-1">{seoDescription.length}/160 characters</p>
            </div>
          </div>
        </Card>

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 pb-8">
          <button
            onClick={submit}
            disabled={busy}
            className="h-11 px-10 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors cursor-pointer disabled:opacity-60"
          >
            {busy ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
          <button
            onClick={() => navigate('/admin/products')}
            className="h-11 px-6 border border-[#ddd] text-[#666] font-lato text-[13px] rounded-lg hover:border-[#999] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;
