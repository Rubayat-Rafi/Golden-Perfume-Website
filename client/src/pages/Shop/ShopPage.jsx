import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ChevronRight, Search, Package } from 'lucide-react';
import SingleProduct from '../../components/Product/SingleProduct';
import { useCategories, useProducts } from '../../hooks/queries';
import { normalizeProduct, normalizeCategory } from '../../lib/normalize';

// Collapsible category tree (any depth)
const CategoryTree = ({ categories, parent = '', depth = 0, active, onSelect, open, toggleOpen }) => {
  const nodes = categories
    .filter((c) => (c.parent || '') === parent)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  if (!nodes.length) return null;

  return (
    <div className={depth > 0 ? 'ml-3 border-l border-linen pl-2' : ''}>
      {nodes.map((cat) => {
        const hasKids = categories.some((c) => c.parent === cat.slug);
        const isActive = active === cat.slug;
        const isOpen = open.has(cat.slug);
        return (
          <div key={cat.slug}>
            <div className="flex items-center">
              {hasKids ? (
                <button onClick={() => toggleOpen(cat.slug)} className="w-5 h-6 flex items-center justify-center text-[#aaa] hover:text-dark-green cursor-pointer shrink-0">
                  {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
              ) : <span className="w-5 shrink-0" />}
              <button onClick={() => onSelect(cat.slug)}
                className={`flex-1 text-left py-1.5 font-lato text-[13px] transition-colors duration-150 cursor-pointer truncate ${isActive ? 'text-brand-green font-bold' : 'text-[#666] hover:text-dark-green'}`}>
                {cat.name}
              </button>
            </div>
            {hasKids && isOpen && (
              <CategoryTree categories={categories} parent={cat.slug} depth={depth + 1}
                active={active} onSelect={onSelect} open={open} toggleOpen={toggleOpen} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const SORT_OPTIONS = [
  { label: 'Name A–Z',           value: 'name-asc'   },
  { label: 'Price: Low to High', value: 'price-asc'  },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest First',       value: 'newest'     },
];

const LIMIT = 12;

// ─── Skeleton ─────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white border border-[#e8e8e8] overflow-hidden animate-pulse">
    <div className="aspect-square bg-[#f0f0f0]" />
    <div className="p-3 sm:p-4">
      <div className="h-2.5 bg-[#f0f0f0] rounded w-1/3 mb-2" />
      <div className="h-4 bg-[#f0f0f0] rounded w-3/4 mb-3" />
      <div className="h-4 bg-[#f0f0f0] rounded w-1/4" />
    </div>
  </div>
);

// ─── Sidebar sub-components ───────────────────────────────────────────────

const SidebarHeading = ({ children }) => (
  <h4 className="font-lato text-[11px] uppercase tracking-[2.5px] text-[#aaa] mb-4 mt-7 first:mt-0">{children}</h4>
);

const CheckboxRow = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 mb-3 cursor-pointer group">
    <div className="relative shrink-0">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <div className={`w-4 h-4 border rounded transition-colors duration-150 flex items-center justify-center ${checked ? 'bg-gold border-gold' : 'border-[#ddd] bg-white group-hover:border-gold'}`}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
    <span className="font-lato text-[13px] text-[#666] group-hover:text-[#222] transition-colors">{label}</span>
  </label>
);

// ─── Sidebar content ──────────────────────────────────────────────────────

const SidebarContent = ({ params, setParam, clearParam, categories, searchInput, setSearchInput, openCats, toggleCat }) => {
  const category = params.get('category') || '';
  const gender   = params.get('gender') || '';
  const inStock  = params.get('inStock') === '1';
  const sale     = params.get('sale') === '1';
  const isNew    = params.get('new') === '1';

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <input
          type="search" value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products…"
          className="w-full h-11 pl-10 pr-4 border border-[#ddd] rounded-lg font-lato text-[13px] text-[#222] placeholder:text-[#bbb] outline-none focus:border-gold transition-colors duration-200"
        />
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
      </div>

      {/* Shop For (gender) */}
      <SidebarHeading>Shop For</SidebarHeading>
      <div className="flex gap-2 mb-2">
        {[{ label: 'All', value: '' }, { label: 'Men', value: 'men' }, { label: 'Women', value: 'women' }].map((g) => {
          const active = gender === g.value;
          return (
            <button key={g.label}
              onClick={() => g.value ? setParam('gender', g.value) : clearParam('gender')}
              className={`flex-1 h-9 rounded-lg font-lato text-[12px] transition-colors cursor-pointer ${active ? 'bg-dark-green text-linen font-bold' : 'bg-white border border-[#ddd] text-[#666] hover:border-dark-green'}`}>
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Categories */}
      <SidebarHeading>Categories</SidebarHeading>
      <button
        onClick={() => clearParam('category')}
        className={`w-full flex items-center py-1.5 pl-5 font-lato text-[13px] transition-colors duration-150 cursor-pointer mb-1 ${!category ? 'text-brand-green font-bold' : 'text-[#666] hover:text-dark-green'}`}
      >
        All Products
      </button>
      <CategoryTree
        categories={categories}
        active={category}
        onSelect={(slug) => setParam('category', slug)}
        open={openCats}
        toggleOpen={toggleCat}
      />

      {/* Availability */}
      <SidebarHeading>Availability</SidebarHeading>
      <CheckboxRow label="In Stock Only" checked={inStock} onChange={() => inStock ? clearParam('inStock') : setParam('inStock', '1')} />
      <CheckboxRow label="On Sale"        checked={sale}    onChange={() => sale    ? clearParam('sale')    : setParam('sale', '1')} />
      <CheckboxRow label="New Arrivals"   checked={isNew}   onChange={() => isNew   ? clearParam('new')     : setParam('new', '1')} />
    </div>
  );
};

// ─── Main ShopPage ────────────────────────────────────────────────────────

const ShopPage = () => {
  const [params, setSearchParams] = useSearchParams();

  const [filterOpen,    setFilterOpen]    = useState(false);
  const [sortOpen,      setSortOpen]      = useState(false);
  const [searchInput,   setSearchInput]   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [openCats,      setOpenCats]      = useState(new Set());

  const toggleCat = (slug) => setOpenCats((prev) => {
    const next = new Set(prev);
    next.has(slug) ? next.delete(slug) : next.add(slug);
    return next;
  });

  // Read active filter state from URL
  const category = params.get('category') || '';
  const gender   = params.get('gender')   || '';
  const sort     = params.get('sort')     || 'name-asc';
  const inStock  = params.get('inStock') === '1';
  const sale     = params.get('sale')    === '1';
  const isNew    = params.get('new')     === '1';
  const page     = Number(params.get('page') || 1);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    next.delete('page');      // reset to page 1 on filter change
    setSearchParams(next);
  };
  const clearParam = (key) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };
  const clearAll = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSearchParams(new URLSearchParams());
  };

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput);
      if (searchInput !== debouncedSearch) {
        const next = new URLSearchParams(params);
        next.delete('page');
        setSearchParams(next);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const queryParams = {
    sort,
    page: String(page),
    limit: String(LIMIT),
    ...(category ? { category } : {}),
    ...(gender ? { gender } : {}),
    ...(inStock ? { inStock: '1' } : {}),
    ...(sale ? { sale: '1' } : {}),
    ...(isNew ? { isNew: '1' } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };
  const { data: rawCategories = [] } = useCategories();
  const categories = rawCategories.map(normalizeCategory);
  const { data: productsData, isLoading } = useProducts(queryParams);
  const products   = (productsData?.data || []).map(normalizeProduct);
  const total      = productsData?.total      || 0;
  const totalPages = productsData?.totalPages || 1;

  // Active filter chips for display
  const catName   = categories.find((c) => c.slug === category)?.name ?? category;
  const genderLabel = gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : '';
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort';
  const activeCount = [category, gender, inStock, sale, isNew, debouncedSearch].filter(Boolean).length;

  const chips = [
    gender          && { label: genderLabel,      remove: () => clearParam('gender')   },
    category        && { label: catName,         remove: () => clearParam('category') },
    inStock         && { label: 'In Stock',       remove: () => clearParam('inStock')  },
    sale            && { label: 'On Sale',         remove: () => clearParam('sale')     },
    isNew           && { label: 'New Arrivals',    remove: () => clearParam('new')      },
    debouncedSearch && { label: `"${debouncedSearch}"`, remove: () => { setSearchInput(''); setDebouncedSearch(''); } },
  ].filter(Boolean);

  return (
    <div className="max-w-305 mx-auto px-4 md:px-10 py-8 md:py-12">
      {/* Page title */}
      <div className="mb-8">
        <span className="font-lato text-gold text-[12px] uppercase tracking-[4px] block mb-2">Our Products</span>
        <h1 className="font-playfair font-normal text-[32px] md:text-[42px] text-[#222] leading-none">Shop All Products</h1>
      </div>

      <div className="flex gap-8 items-start">

        {/* Desktop sidebar */}
        <aside className="hidden md:block w-60 shrink-0 sticky top-44">
          <SidebarContent
            params={params} setParam={setParam} clearParam={clearParam}
            categories={categories} searchInput={searchInput} setSearchInput={setSearchInput}
            openCats={openCats} toggleCat={toggleCat}
          />
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <button onClick={() => setFilterOpen(true)}
              className="md:hidden flex items-center gap-2 h-10 px-4 border border-[#ddd] rounded-lg font-lato text-[13px] text-[#666] hover:border-gold transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              Filter
              {activeCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-gold text-dark-green font-bold text-[10px] flex items-center justify-center">{activeCount}</span>
              )}
            </button>

            <span className="font-lato text-[13px] text-[#999]">
              Showing <strong className="text-[#222]">{total}</strong> products
            </span>

            {/* Sort */}
            <div className="relative">
              <button onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 h-10 px-4 border border-[#ddd] rounded-lg font-lato text-[13px] text-[#666] hover:border-gold transition-colors cursor-pointer"
              >
                {sortLabel}
                <ChevronDown size={13} className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#eee] rounded-xl shadow-lg py-1 z-50">
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt.value}
                      onClick={() => { setParam('sort', opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 font-lato text-[13px] transition-colors cursor-pointer ${sort === opt.value ? 'text-gold font-bold bg-gold/5' : 'text-[#666] hover:bg-[#faf9ff] hover:text-[#222]'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {chips.map((chip) => (
                <button key={chip.label} onClick={chip.remove}
                  className="flex items-center gap-1.5 h-7 px-3 bg-gold/10 border border-gold/30 text-gold rounded-full font-lato text-[12px] hover:bg-gold/20 transition-colors cursor-pointer"
                >
                  {chip.label} <X size={11} />
                </button>
              ))}
              <button onClick={clearAll} className="h-7 px-3 font-lato text-[12px] text-[#999] hover:text-[#222] transition-colors cursor-pointer underline">
                Clear all
              </button>
            </div>
          )}

          {/* Product grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
              {Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-5">
                <Package size={28} className="text-[#ccc]" />
              </div>
              <h3 className="font-playfair text-[22px] text-[#222] mb-3">No products found</h3>
              <p className="font-lato text-[14px] text-[#999] mb-7">Try adjusting your filters or search terms.</p>
              <button onClick={clearAll}
                className="h-11 px-8 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[1.5px] rounded-[3px] hover:bg-[#c49843] transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
              {products.map((product) => (
                <SingleProduct key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setParam('page', String(page - 1))}
                disabled={page <= 1}
                className="h-9 px-4 font-lato text-[13px] border border-[#ddd] rounded-lg text-[#666] hover:border-gold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p}
                  onClick={() => setParam('page', String(p))}
                  className={`w-9 h-9 font-lato text-[13px] border rounded-lg transition-colors cursor-pointer ${p === page ? 'bg-dark-green text-linen border-dark-green' : 'border-[#ddd] text-[#666] hover:border-gold'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setParam('page', String(page + 1))}
                disabled={page >= totalPages}
                className="h-9 px-4 font-lato text-[13px] border border-[#ddd] rounded-lg text-[#666] hover:border-gold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/40 z-200" onClick={() => setFilterOpen(false)} />
          <div className="md:hidden fixed top-0 left-0 h-full w-72 bg-white z-201 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0]">
              <h3 className="font-playfair text-[20px] text-[#222]">Filters</h3>
              <button onClick={() => setFilterOpen(false)} className="text-[#aaa] hover:text-[#222] cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <SidebarContent
                params={params} setParam={setParam} clearParam={clearParam}
                categories={categories} searchInput={searchInput} setSearchInput={setSearchInput}
                openCats={openCats} toggleCat={toggleCat}
              />
            </div>
            <div className="px-6 py-4 border-t border-[#f0f0f0]">
              <button onClick={() => setFilterOpen(false)}
                className="w-full h-12 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[1.5px] rounded-lg hover:bg-[#c49843] transition-colors cursor-pointer"
              >
                Show {total} Products
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShopPage;
