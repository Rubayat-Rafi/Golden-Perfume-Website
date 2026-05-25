import { useEffect, useRef, useState } from 'react';
import { Search, X, Package } from 'lucide-react';
import SingleProduct from '../../components/Product/SingleProduct';
import allProducts from '../../data/product/product.json';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    <div className="min-h-screen bg-cream">
      {/* Search bar hero */}
      <div className="bg-dark-green py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-4">
          <p className="font-lato text-brand-green text-[11px] uppercase tracking-[4px] text-center mb-3">
            Search
          </p>
          <h1 className="font-playfair font-normal text-[24px] md:text-[32px] text-linen text-center mb-8">
            Find Your Perfect Fragrance
          </h1>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-green/40 pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, categories…"
              className="w-full h-14 pl-12 pr-12 bg-white font-lato text-[15px] text-dark-green placeholder:text-dark-green/30 outline-none rounded-sm focus:ring-2 focus:ring-brand-green/40"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-green/30 hover:text-dark-green transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-305 mx-auto px-4 md:px-10 py-10 md:py-14">
        {!q ? (
          /* Initial state */
          <div className="text-center py-16">
            <Search size={40} className="text-dark-green/15 mx-auto mb-4" />
            <p className="font-playfair text-[20px] text-dark-green/40">
              Start typing to search products
            </p>
          </div>
        ) : results.length === 0 ? (
          /* No results */
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-linen flex items-center justify-center mx-auto mb-5">
              <Package size={26} className="text-dark-green/30" />
            </div>
            <h3 className="font-playfair text-[22px] text-dark-green mb-2">
              No results for &ldquo;{query}&rdquo;
            </h3>
            <p className="font-lato text-[14px] text-dark-green/50 mb-6">
              Try a different keyword or browse all products.
            </p>
            <button
              onClick={() => setQuery('')}
              className="font-lato text-[12px] uppercase tracking-[1.5px] text-brand-green hover:text-dark-green transition-colors border-b border-brand-green pb-0.5"
            >
              Clear search
            </button>
          </div>
        ) : (
          /* Results grid */
          <>
            <p className="font-lato text-[13px] text-dark-green/50 mb-6">
              Showing <strong className="text-dark-green">{results.length}</strong> result{results.length !== 1 ? 's' : ''} for &ldquo;<span className="text-brand-green">{query}</span>&rdquo;
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {results.map((product) => (
                <SingleProduct key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
