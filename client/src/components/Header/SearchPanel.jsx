import { useEffect, useRef } from 'react';
import { Search, X, Package } from 'lucide-react';
import SingleProduct from '../Product/SingleProduct';
import allProducts from '../../data/product/product.json';

const SearchPanel = ({ query, onChange, onClose }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const results = q
    ? allProducts.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="absolute top-full left-0 w-full bg-cream shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50 border-t border-linen">
      {/* Input row */}
      <div className="max-w-305 mx-auto px-4 md:px-10 py-4">
        <div className="relative">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-green/40 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search products, categories…"
            className="w-full h-12 pl-11 pr-10 bg-white border border-linen font-lato text-[14px] text-dark-green placeholder:text-dark-green/30 outline-none focus:border-brand-green/50 focus:ring-1 focus:ring-brand-green/20 rounded-sm transition-colors"
          />
          {query && (
            <button
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-green/30 hover:text-dark-green transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {q && (
        <div className="max-w-305 mx-auto px-4 md:px-10 pb-6 max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="flex items-center gap-3 py-6 text-dark-green/40">
              <Package size={20} />
              <span className="font-lato text-[14px]">No results for &ldquo;{query}&rdquo;</span>
            </div>
          ) : (
            <>
              <p className="font-lato text-[12px] text-dark-green/40 mb-4">
                {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;<span className="text-brand-green">{query}</span>&rdquo;
              </p>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                onClick={onClose}
              >
                {results.map((product) => (
                  <SingleProduct key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPanel;
