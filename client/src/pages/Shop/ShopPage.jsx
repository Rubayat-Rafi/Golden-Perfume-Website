import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, Search, Package } from 'lucide-react';
import SingleProduct from '../../components/Product/SingleProduct';
import allProducts from '../../data/product/product.json';
import allCategoriesData from '../../data/category/category.json';

// ─── Filter & sort config ──────────────────────────────────────────────────

const CATEGORIES = allCategoriesData
  .filter((c) => c.slug !== 'new-arrival')
  .map((c) => ({ label: c.name, value: c.slug }));

const SORT_OPTIONS = [
  { label: 'Name A–Z',           value: 'name-asc'   },
  { label: 'Price: Low to High', value: 'price-asc'  },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest First',       value: 'newest'     },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

const applyFilters = (products, { category, inStock, sale, isNew, search }) => {
  let result = [...products];
  if (category) {
    const catLabel = CATEGORIES.find((c) => c.value === category)?.label;
    result = result.filter((p) => p.category === catLabel);
  }
  if (inStock)  result = result.filter((p) => p.isStocked);
  if (sale)     result = result.filter((p) => p.isSale);
  if (isNew)    result = result.filter((p) => p.isNew);
  if (search)   result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  return result;
};

const applySort = (products, sort) => {
  const copy = [...products];
  if (sort === 'price-asc')  return copy.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  if (sort === 'price-desc') return copy.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  if (sort === 'newest')     return copy.reverse();
  return copy.sort((a, b) => a.name.localeCompare(b.name)); // name-asc default
};

// ─── Sub-components ───────────────────────────────────────────────────────

const SidebarHeading = ({ children }) => (
  <h4 className="font-lato text-[11px] uppercase tracking-[2.5px] text-[#aaa] mb-4 mt-7 first:mt-0">
    {children}
  </h4>
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

// ─── Sidebar content (shared between desktop aside and mobile drawer) ──────

const SidebarContent = ({ params, setParam, clearParam, categoryCounts, search, setSearch }) => {
  const category = params.get('category') || '';
  const inStock  = params.get('inStock') === '1';
  const sale     = params.get('sale') === '1';
  const isNew    = params.get('new') === '1';

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full h-11 pl-10 pr-4 border border-[#ddd] rounded-lg font-lato text-[13px] text-[#222] placeholder:text-[#bbb] outline-none focus:border-gold transition-colors duration-200"
        />
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
      </div>

      {/* Categories */}
      <SidebarHeading>Categories</SidebarHeading>
      <button
        onClick={() => clearParam('category')}
        className={`w-full flex items-center justify-between py-1.5 font-lato text-[13px] transition-colors duration-150 cursor-pointer mb-1 ${!category ? 'text-gold font-bold' : 'text-[#666] hover:text-[#222]'}`}
      >
        <span>All Products</span>
        <span className="text-[#aaa] text-[12px]">({allProducts.length})</span>
      </button>
      {CATEGORIES.map((cat) => {
        const count = categoryCounts[cat.value] ?? 0;
        const active = category === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => setParam('category', cat.value)}
            className={`w-full flex items-center justify-between py-1.5 font-lato text-[13px] transition-colors duration-150 cursor-pointer mb-1 ${active ? 'text-gold font-bold' : 'text-[#666] hover:text-[#222]'}`}
          >
            <span>{cat.label}</span>
            <span className="text-[#aaa] text-[12px]">({count})</span>
          </button>
        );
      })}

      {/* Availability */}
      <SidebarHeading>Availability</SidebarHeading>
      <CheckboxRow label="In Stock Only"   checked={inStock} onChange={() => inStock ? clearParam('inStock') : setParam('inStock', '1')} />
      <CheckboxRow label="On Sale"          checked={sale}    onChange={() => sale    ? clearParam('sale')    : setParam('sale',    '1')} />
      <CheckboxRow label="New Arrivals"     checked={isNew}   onChange={() => isNew   ? clearParam('new')     : setParam('new',     '1')} />
    </div>
  );
};

// ─── Main ShopPage ────────────────────────────────────────────────────────

const ShopPage = () => {
  const [params, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setSearchParams(next);
  };

  const clearParam = (key) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams(new URLSearchParams());

  const category = params.get('category') || '';
  const sort     = params.get('sort') || 'name-asc';
  const inStock  = params.get('inStock') === '1';
  const sale     = params.get('sale') === '1';
  const isNew    = params.get('new') === '1';

  // Category counts (from all products, ignoring other filters)
  const categoryCounts = useMemo(() =>
    Object.fromEntries(
      CATEGORIES.map((cat) => [
        cat.value,
        allProducts.filter((p) => p.category === cat.label).length,
      ])
    ), []);

  // Active filters count (for mobile badge)
  const activeCount = [category, inStock, sale, isNew, search].filter(Boolean).length;

  // Filtered + sorted products
  const displayed = useMemo(
    () => applySort(applyFilters(allProducts, { category, inStock, sale, isNew, search }), sort),
    [category, inStock, sale, isNew, search, sort]
  );

  // Active filter chips
  const chips = [
    category && { label: CATEGORIES.find((c) => c.value === category)?.label ?? category, remove: () => clearParam('category') },
    inStock   && { label: 'In Stock',     remove: () => clearParam('inStock') },
    sale      && { label: 'On Sale',      remove: () => clearParam('sale')    },
    isNew     && { label: 'New Arrivals', remove: () => clearParam('new')     },
    search    && { label: `"${search}"`,  remove: () => setSearch('')        },
  ].filter(Boolean);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort';

  return (
    <div className="max-w-305 mx-auto px-4 md:px-10 py-8 md:py-12">
      {/* Page title */}
      <div className="mb-8">
        <span className="font-lato text-gold text-[12px] uppercase tracking-[4px] block mb-2">
          Our Products
        </span>
        <h1 className="font-playfair font-normal text-[32px] md:text-[42px] text-[#222] leading-none">
          Shop All Products
        </h1>
      </div>

      <div className="flex gap-8 items-start">

        {/* ── Desktop sidebar ── */}
        <aside className="hidden md:block w-60 shrink-0 sticky top-44">
          <SidebarContent
            params={params} setParam={setParam} clearParam={clearParam}
            categoryCounts={categoryCounts} search={search} setSearch={setSearch}
          />
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            {/* Mobile filter button */}
            <button
              onClick={() => setFilterOpen(true)}
              className="md:hidden flex items-center gap-2 h-10 px-4 border border-[#ddd] rounded-lg font-lato text-[13px] text-[#666] hover:border-gold transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              Filter
              {activeCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-gold text-dark-green font-bold text-[10px] flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>

            <span className="font-lato text-[13px] text-[#999]">
              Showing <strong className="text-[#222]">{displayed.length}</strong> products
            </span>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 h-10 px-4 border border-[#ddd] rounded-lg font-lato text-[13px] text-[#666] hover:border-gold transition-colors cursor-pointer"
              >
                {sortLabel}
                <ChevronDown size={13} className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#eee] rounded-xl shadow-lg py-1 z-50">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
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
                <button
                  key={chip.label}
                  onClick={chip.remove}
                  className="flex items-center gap-1.5 h-7 px-3 bg-gold/10 border border-gold/30 text-gold rounded-full font-lato text-[12px] hover:bg-gold/20 transition-colors cursor-pointer"
                >
                  {chip.label}
                  <X size={11} />
                </button>
              ))}
              <button
                onClick={clearAll}
                className="h-7 px-3 font-lato text-[12px] text-[#999] hover:text-[#222] transition-colors cursor-pointer underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product grid */}
          {displayed.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-5">
                <Package size={28} className="text-[#ccc]" />
              </div>
              <h3 className="font-playfair text-[22px] text-[#222] mb-3">No products found</h3>
              <p className="font-lato text-[14px] text-[#999] mb-7">
                Try adjusting your filters or search terms.
              </p>
              <button
                onClick={clearAll}
                className="h-11 px-8 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[1.5px] rounded-[3px] hover:bg-[#c49843] transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
              {displayed.map((product) => (
                <SingleProduct key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {filterOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-200"
            onClick={() => setFilterOpen(false)}
          />
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
                categoryCounts={categoryCounts} search={search} setSearch={setSearch}
              />
            </div>
            <div className="px-6 py-4 border-t border-[#f0f0f0]">
              <button
                onClick={() => setFilterOpen(false)}
                className="w-full h-12 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[1.5px] rounded-lg hover:bg-[#c49843] transition-colors cursor-pointer"
              >
                Show {displayed.length} Products
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShopPage;
