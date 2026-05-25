import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ChevronRight, Package, Weight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import SingleProduct from '../../components/Product/SingleProduct';
import allProducts from '../../data/product/product.json';

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={13}
        className={n <= rating ? 'text-gold fill-gold' : 'text-sage fill-sage'}
      />
    ))}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const product = allProducts.find((p) => p.id === id);

  const { role } = useAuth();
  const { addItem, items: cartItems } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  const [activeImg, setActiveImg]     = useState(0);
  const [selectedVar, setSelectedVar] = useState(0);
  const [qty, setQty]                 = useState(1);

  if (!product) return <Navigate to="/shop" replace />;

  const { name, category, content, description, imageGallery, image, productNumber, reviews, variants, isSale, isNew, gender } = product;

  const CATEGORY_FILTER = {
    'Fragrance & Body Oils':    'fragrance-body-oils',
    'Incense':                  'incense',
    'Essential Oil':            'essential-oil',
    'Soap':                     'soap',
    'Skin Care & Hair Product': 'skin-care-hair-product',
    'Herbs & Smudges':          'herbs-smudges',
  };

  const related = allProducts.filter((p) => p.category === category && p.id !== id).slice(0, 4);
  const shopCategoryParam = CATEGORY_FILTER[category];
  const isWholesale = role === 'wholesale' || role === 'admin';
  const hasVariants = variants?.length > 0;
  const currentVariant = hasVariants ? variants[selectedVar] : null;
  const currentPrice = currentVariant ? currentVariant.price : product.price;
  const currentWholesalePrice = currentVariant?.wholesalePrice ?? null;
  const currentSku = currentVariant?.sku ?? productNumber;
  const currentWeight = currentVariant?.weight ?? null;
  const gallery = imageGallery?.length ? imageGallery : [image];
  const inCart = cartItems.some((i) => i.id === id && i.variantSku === currentSku);
  const wishlisted = isWishlisted(id);

  const handleAddToCart = () => {
    if (inCart) return;
    addItem(
      {
        ...product,
        price: currentPrice,
        variantSku: currentSku,
        variantSize: currentVariant?.size,
      },
      qty,
    );
  };

  const avgRating = reviews?.length
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : 0;

  return (
    <div className="bg-cream min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-305 mx-auto px-4 md:px-10 py-4 md:py-6">
        <nav className="flex items-center gap-1.5 font-lato text-[12px] text-dark-green/60">
          <Link to="/" className="hover:text-brand-green transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-brand-green transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-dark-green truncate max-w-48">{name}</span>
        </nav>
      </div>

      {/* Main product section */}
      <div className="max-w-305 mx-auto px-4 md:px-10 pb-12 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">

          {/* ── Left: Image gallery ── */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden bg-white rounded-sm">
              <img
                src={gallery[activeImg]}
                alt={name}
                className="w-full h-full object-cover"
              />
              {isSale && (
                <span className="absolute top-3 left-3 bg-gold text-dark-green font-lato font-bold text-[10px] uppercase tracking-[1px] px-2.5 py-1 rounded-sm">
                  Sale
                </span>
              )}
              {isNew && (
                <span className={`absolute top-3 ${isSale ? 'left-14' : 'left-3'} bg-brand-green text-white font-lato font-bold text-[10px] uppercase tracking-[1px] px-2.5 py-1 rounded-sm`}>
                  New
                </span>
              )}
            </div>
            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-2">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-sm border-2 transition-all duration-200 cursor-pointer ${
                      i === activeImg ? 'border-brand-green' : 'border-transparent hover:border-sage'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product info ── */}
          <div className="flex flex-col">
            {/* Category + gender chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-block font-lato text-[10px] uppercase tracking-[2px] text-brand-green border border-brand-green px-2.5 py-1 rounded-sm">
                {category}
              </span>
              {gender && (
                <span className="inline-block font-lato text-[10px] uppercase tracking-[2px] text-forest/70 border border-sage px-2.5 py-1 rounded-sm">
                  {gender}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="font-playfair font-normal text-[22px] sm:text-[28px] md:text-[32px] text-dark-green leading-tight mb-2">
              {name}
            </h1>

            {/* Rating + SKU */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {reviews?.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarRating rating={avgRating} />
                  <span className="font-lato text-[12px] text-dark-green/50">({reviews.length})</span>
                </div>
              )}
              <span className="font-lato text-[11px] text-dark-green/40 uppercase tracking-[1px]">
                SKU: {currentSku}
              </span>
            </div>

            {/* Price */}
            <div className="mb-5 pb-5 border-b border-linen">
              <div className="flex items-baseline gap-3">
                <span className="font-playfair font-bold text-[26px] md:text-[30px] text-dark-green">
                  ${currentPrice}
                </span>
                {product.oldPrice && (
                  <span className="font-playfair text-[18px] text-mid-green line-through">
                    ${product.oldPrice}
                  </span>
                )}
              </div>
              {isWholesale && currentWholesalePrice && (
                <div className="mt-2 inline-flex items-center gap-2 bg-brand-green/10 border border-brand-green/30 px-3 py-1.5 rounded-sm">
                  <span className="font-lato text-[11px] uppercase tracking-[1px] text-brand-green font-bold">
                    Wholesale:
                  </span>
                  <span className="font-playfair font-bold text-[16px] text-brand-green">
                    ${currentWholesalePrice}
                  </span>
                  <span className="font-lato text-[11px] text-brand-green/70">/ unit</span>
                </div>
              )}
            </div>

            {/* Size selector */}
            {hasVariants && (
              <div className="mb-5">
                <p className="font-lato text-[12px] uppercase tracking-[1.5px] text-dark-green/60 mb-2">
                  Select Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, i) => (
                    <button
                      key={v.sku}
                      onClick={() => { setSelectedVar(i); setQty(1); }}
                      className={`font-lato text-[12px] px-3 py-2 border rounded-sm transition-all duration-200 cursor-pointer ${
                        i === selectedVar
                          ? 'bg-dark-green text-linen border-dark-green'
                          : 'bg-white text-dark-green border-linen hover:border-brand-green'
                      } ${!v.inStock ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                      disabled={!v.inStock}
                    >
                      {v.size}
                      {isWholesale && (
                        <span className="ml-1.5 text-[10px] text-mid-green">
                          (${v.wholesalePrice})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Qty counter */}
              <div className="flex items-center border border-linen rounded-sm overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center font-lato text-lg text-dark-green hover:bg-linen transition-colors cursor-pointer"
                >
                  −
                </button>
                <span className="w-10 h-11 flex items-center justify-center font-lato text-[14px] text-dark-green border-x border-linen">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-10 h-11 flex items-center justify-center font-lato text-lg text-dark-green hover:bg-linen transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={inCart}
                className={`flex-1 sm:flex-none h-11 px-6 flex items-center justify-center gap-2 font-lato font-bold text-[12px] uppercase tracking-[1.5px] rounded-sm transition-colors duration-200 cursor-pointer ${
                  inCart
                    ? 'bg-sage text-dark-green/50 cursor-not-allowed'
                    : 'bg-brand-green text-white hover:bg-dark-green'
                }`}
              >
                <ShoppingCart size={15} />
                {inCart ? 'In Cart' : 'Add to Cart'}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => toggleItem(product)}
                className={`w-11 h-11 flex items-center justify-center border rounded-sm transition-all duration-200 cursor-pointer ${
                  wishlisted
                    ? 'bg-gold border-gold text-dark-green'
                    : 'border-linen text-dark-green/50 hover:border-brand-green hover:text-brand-green'
                }`}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={17} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Description */}
            {description && (
              <p className="font-lato text-[14px] leading-relaxed text-dark-green/70 mb-4">
                {description}
              </p>
            )}

            {/* Details */}
            <div className="bg-white rounded-sm p-4 flex flex-col gap-2.5">
              {currentWeight && (
                <div className="flex items-center gap-2.5 font-lato text-[13px] text-dark-green/70">
                  <Weight size={14} className="text-brand-green shrink-0" />
                  <span><span className="font-bold text-dark-green">Weight:</span> {currentWeight}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 font-lato text-[13px] text-dark-green/70">
                <Package size={14} className="text-brand-green shrink-0" />
                <span><span className="font-bold text-dark-green">SKU:</span> {currentSku}</span>
              </div>
              {category && (
                <div className="flex items-center gap-2.5 font-lato text-[13px] text-dark-green/70">
                  <span className="w-3.5 h-3.5 rounded-full bg-brand-green shrink-0" />
                  <span><span className="font-bold text-dark-green">Category:</span> {category}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Product description ── */}
        {content && (
          <div className="mt-12 md:mt-16 border-t border-linen pt-8 md:pt-12">
            <h2 className="font-playfair font-normal text-[20px] md:text-[24px] text-dark-green mb-4">
              Product Description
            </h2>
            <p className="font-lato text-[14px] md:text-[15px] leading-relaxed text-dark-green/70 max-w-3xl">
              {content}
            </p>
          </div>
        )}

        {/* ── Reviews ── */}
        {reviews?.length > 0 && (
          <div className="mt-12 md:mt-16 border-t border-linen pt-8 md:pt-12">
            <h2 className="font-playfair font-normal text-[20px] md:text-[24px] text-dark-green mb-6">
              Customer Reviews
              <span className="font-lato text-[14px] text-dark-green/40 ml-3">({reviews.length})</span>
            </h2>
            <div className="flex flex-col gap-6">
              {reviews.map((review, i) => (
                <div key={i} className="bg-white rounded-sm p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={review.author.image}
                      alt={review.author.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <p className="font-lato font-bold text-[13px] text-dark-green">{review.author.name}</p>
                      <p className="font-lato text-[11px] text-dark-green/40">{review.reviewDate}</p>
                      <div className="mt-1">
                        <StarRating rating={review.rating} />
                      </div>
                    </div>
                  </div>
                  <p className="font-lato text-[13px] leading-relaxed text-dark-green/70">
                    {review.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="mt-12 md:mt-16 border-t border-linen pt-8 md:pt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="font-lato text-brand-green text-[11px] uppercase tracking-[4px] block mb-1">
                  {category}
                </span>
                <h2 className="font-playfair font-normal text-[20px] md:text-[24px] text-dark-green">
                  You May Also Like
                </h2>
              </div>
              <Link
                to={shopCategoryParam ? `/shop?category=${shopCategoryParam}` : '/shop'}
                className="font-lato text-[12px] uppercase tracking-[1.5px] text-brand-green hover:text-dark-green transition-colors duration-200 hidden sm:block"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {related.map((p) => (
                <SingleProduct key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
