import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ChevronRight, Package, Weight, UploadCloud, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import SingleProduct from '../../components/Product/SingleProduct';
import { useProduct, useProductReviews } from '../../hooks/queries';
import { normalizeProduct } from '../../lib/normalize';
import axiosSecure from '../../lib/axiosSecure';

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={13} className={n <= rating ? 'text-gold fill-gold' : 'text-sage fill-sage'} />
    ))}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();   // id = slug, e.g. "gf-fragrance-001"
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { addItem, items: cartItems } = useCart();
  const { toggleItem, isWishlisted }  = useWishlist();

  const [activeImg,    setActiveImg]    = useState(0);
  const [selectedVar,  setSelectedVar]  = useState(0);
  const [activeColor,  setActiveColor]  = useState(null); // index of selected color, or null
  const [qty,          setQty]          = useState(1);

  // Review form state
  const reviewImgRef                    = useRef(null);
  const [reviewRating,  setReviewRating]  = useState(0);
  const [reviewHover,   setReviewHover]   = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewFiles,   setReviewFiles]   = useState([]);
  const [reviewStatus,  setReviewStatus]  = useState('idle'); // idle | submitting | success | error
  const [reviewErr,     setReviewErr]     = useState('');

  const qc = useQueryClient();

  const { data: raw, isLoading: loading, isError } = useProduct(id);
  const product = raw?.data ? normalizeProduct(raw.data) : null;
  const related = (raw?.related || []).map(normalizeProduct);

  // Reviews
  const productDbId = raw?.data?._id ?? null;
  const { data: reviewsData, isLoading: reviewsLoading } = useProductReviews(productDbId);
  const reviews = reviewsData ?? [];

  useEffect(() => {
    if (isError) navigate('/shop', { replace: true });
  }, [isError, navigate]);

  if (loading) {
    return (
      <div className="bg-cream min-h-screen">
        <div className="max-w-305 mx-auto px-4 md:px-10 py-4 md:py-6">
          <div className="h-3 w-48 bg-linen/70 rounded animate-pulse" />
        </div>
        <div className="max-w-305 mx-auto px-4 md:px-10 pb-12 md:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
            {/* Image */}
            <div className="flex flex-col gap-3">
              <div className="aspect-square bg-linen/70 rounded-sm animate-pulse" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 bg-linen/70 rounded-sm animate-pulse" />
                ))}
              </div>
            </div>
            {/* Info */}
            <div className="flex flex-col gap-4">
              <div className="h-5 w-24 bg-linen/70 rounded-sm animate-pulse" />
              <div className="h-9 w-3/4 bg-linen/70 rounded animate-pulse" />
              <div className="h-3 w-32 bg-linen/70 rounded animate-pulse" />
              <div className="h-8 w-40 bg-linen/70 rounded animate-pulse mb-2" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 w-20 bg-linen/70 rounded-sm animate-pulse" />
                ))}
              </div>
              <div className="flex gap-3 mt-2">
                <div className="h-11 w-32 bg-linen/70 rounded-sm animate-pulse" />
                <div className="h-11 flex-1 max-w-48 bg-linen/70 rounded-sm animate-pulse" />
              </div>
              <div className="h-24 w-full bg-linen/70 rounded-sm animate-pulse mt-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const { name, category, categorySlug, content, description, imageGallery, image,
          productNumber, variants, colors, isSale, isNew, gender } = product;

  const isWholesale    = role === 'wholesale';
  const hasVariants    = variants?.length > 0;
  const currentVariant = hasVariants ? variants[selectedVar] : null;
  const currentPrice   = currentVariant ? currentVariant.price : product.price;
  const currentWholesalePrice = currentVariant?.wholesalePrice ?? null;
  const currentSku     = currentVariant?.sku ?? productNumber;
  const currentWeight  = currentVariant?.weight ?? null;
  const gallery        = imageGallery?.length ? imageGallery : [image];
  // Dedupe colors by name (case-insensitive) — the same color shows only one swatch
  const uniqueColors   = [];
  const seenColors     = new Set();
  (colors || []).forEach((c) => {
    const key = (c.name || '').trim().toLowerCase();
    if (!key || seenColors.has(key)) return;
    seenColors.add(key);
    uniqueColors.push(c);
  });
  const hasColors      = uniqueColors.length > 0;
  // Selected color's image takes over the hero; otherwise show the active gallery image
  const heroImage      = (activeColor != null && uniqueColors[activeColor]?.image)
    ? uniqueColors[activeColor].image
    : gallery[activeImg];
  const inCart         = cartItems.some((i) => i.id === id && i.variantSku === currentSku);
  const wishlisted     = isWishlisted(id);

  const effectivePrice = (isWholesale && currentWholesalePrice) ? currentWholesalePrice : currentPrice;

  const handleAddToCart = () => {
    if (inCart) return;
    addItem({ ...product, price: effectivePrice, variantSku: currentSku, variantSize: currentVariant?.size }, qty);
  };

  const avgRating = product.rating ? Math.round(product.rating) : 0;

  const myUserId = user?._id || user?.id || null;
  const myReview = myUserId ? reviews.find((r) => String(r.userId) === String(myUserId)) : null;
  // Public list: only approved reviews are visible to everyone.
  const approvedReviews = reviews.filter((r) => r.isApproved);
  // Show the personal "Your Review" card only while the review is still pending —
  // once approved it appears in the public list, so we avoid showing it twice.
  const showPendingCard = myReview && !myReview.isApproved;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewErr('');
    if (!reviewRating) { setReviewErr('Please select a star rating.'); return; }
    if (reviewContent.trim().length < 10) { setReviewErr('Review must be at least 10 characters.'); return; }
    setReviewStatus('submitting');
    try {
      const fd = new FormData();
      fd.append('rating', reviewRating);
      fd.append('content', reviewContent.trim());
      reviewFiles.forEach((f) => fd.append('images', f));
      await axiosSecure.post(`/reviews/product/${productDbId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReviewStatus('idle');
      setReviewContent('');
      setReviewRating(0);
      setReviewFiles([]);
      toast.success('Review submitted! It will be public once approved.');
      qc.invalidateQueries({ queryKey: ['reviews', productDbId] });
    } catch (err) {
      if (err.response?.status === 409) {
        setReviewErr('You have already submitted a review for this product.');
      } else {
        setReviewErr(err.response?.data?.message || 'Failed to submit. Please try again.');
      }
      setReviewStatus('error');
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <Helmet>
        <title>{raw?.data?.seoTitle || name} | Golden Perfume</title>
        {raw?.data?.seoDescription && (
          <meta name="description" content={raw.data.seoDescription} />
        )}
      </Helmet>

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

      <div className="max-w-305 mx-auto px-4 md:px-10 pb-12 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">

          {/* ── Images ── */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square overflow-hidden bg-white rounded-sm">
              <img src={heroImage} alt={name} className="w-full h-full object-cover" />
              {isSale && (
                <span className="absolute top-3 left-3 bg-gold text-dark-green font-lato font-bold text-[10px] uppercase tracking-[1px] px-2.5 py-1 rounded-sm">Sale</span>
              )}
              {isNew && (
                <span className={`absolute top-3 ${isSale ? 'left-14' : 'left-3'} bg-brand-green text-white font-lato font-bold text-[10px] uppercase tracking-[1px] px-2.5 py-1 rounded-sm`}>New</span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2">
                {gallery.map((src, i) => (
                  <button key={i} onClick={() => { setActiveImg(i); setActiveColor(null); }}
                    className={`w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-sm border-2 transition-all duration-200 cursor-pointer ${i === activeImg && activeColor == null ? 'border-brand-green' : 'border-transparent hover:border-sage'}`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-block font-lato text-[10px] uppercase tracking-[2px] text-brand-green border border-brand-green px-2.5 py-1 rounded-sm">{category}</span>
              {gender && (
                <span className="inline-block font-lato text-[10px] uppercase tracking-[2px] text-forest/70 border border-sage px-2.5 py-1 rounded-sm">{gender}</span>
              )}
            </div>

            <h1 className="font-playfair font-normal text-[22px] sm:text-[28px] md:text-[32px] text-dark-green leading-tight mb-2">{name}</h1>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              {approvedReviews.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarRating rating={avgRating} />
                  <span className="font-lato text-[12px] text-dark-green/50">({approvedReviews.length})</span>
                </div>
              )}
              <span className="font-lato text-[11px] text-dark-green/40 uppercase tracking-[1px]">SKU: {currentSku}</span>
            </div>

            {/* Price */}
            <div className="mb-5 pb-5 border-b border-linen">
              {isWholesale && currentWholesalePrice ? (
                <div className="flex flex-col gap-1">
                  <span className="font-playfair font-bold text-[26px] md:text-[30px] text-brand-green">
                    ${currentWholesalePrice}
                    <span className="font-lato font-normal text-brand-green/60 text-[12px] ml-1.5">wholesale</span>
                  </span>
                  <span className="font-lato text-dark-green/40 text-[14px] line-through">${currentPrice} retail</span>
                </div>
              ) : (
                <span className="font-playfair font-bold text-[26px] md:text-[30px] text-gold">${currentPrice}</span>
              )}
            </div>

            {/* Short description */}
            {description && (
              <div
                className="font-lato text-[14px] leading-relaxed text-dark-green/70 mb-5 [&_p]:mb-2 [&_a]:text-brand-green [&_a]:underline [&_a:hover]:text-dark-green"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}

            {/* Size selector */}
            {hasVariants && (
              <div className="mb-5">
                <p className="font-lato text-[12px] uppercase tracking-[1.5px] text-dark-green/60 mb-2">
                  Size <span className="text-dark-green/40">({currentVariant?.size})</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, i) => (
                    <button key={v.sku} onClick={() => { setSelectedVar(i); setQty(1); }}
                      disabled={!v.inStock}
                      className={`font-lato text-[12px] px-3 py-2 border rounded-sm transition-all duration-200 cursor-pointer ${
                        i === selectedVar ? 'bg-brand-green text-white border-dark-green' : 'bg-white text-dark-green border-linen hover:border-brand-green'
                      } ${!v.inStock ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                    >
                      {v.size}
                      {isWholesale && v.wholesalePrice && (
                        <span className="ml-1.5 text-[10px] text-mid-green">(${v.wholesalePrice})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color selector */}
            {hasColors && (
              <div className="mb-5">
                <p className="font-lato text-[12px] uppercase tracking-[1.5px] text-dark-green/60 mb-2">
                  Color {activeColor != null && <span className="text-dark-green/40">({uniqueColors[activeColor].name})</span>}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {uniqueColors.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveColor(i)}
                      title={c.name}
                      aria-label={c.name}
                      className={`w-9 h-9 rounded-full border-2 transition-all duration-200 cursor-pointer flex items-center justify-center ${
                        activeColor === i ? 'ring-2 ring-brand-green ring-offset-2 border-white' : 'border-dark-green/25 hover:border-brand-green'
                      }`}
                      style={{ backgroundColor: c.name }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center border border-linen rounded-sm overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center font-lato text-lg text-dark-green hover:bg-linen transition-colors cursor-pointer">−</button>
                <span className="w-10 h-11 flex items-center justify-center font-lato text-[14px] text-dark-green border-x border-linen">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-10 h-11 flex items-center justify-center font-lato text-lg text-dark-green hover:bg-linen transition-colors cursor-pointer">+</button>
              </div>

              <button onClick={handleAddToCart} disabled={inCart}
                className={`flex-1 sm:flex-none h-11 px-6 flex items-center justify-center gap-2 font-lato font-bold text-[12px] uppercase tracking-[1.5px] rounded-sm transition-colors duration-200 cursor-pointer ${
                  inCart ? 'bg-sage text-dark-green/50 cursor-not-allowed' : 'bg-brand-green text-white hover:bg-forest'
                }`}
              >
                <ShoppingCart size={15} />
                {inCart ? 'In Cart' : 'Add to Cart'}
              </button>

              <button onClick={() => toggleItem(product)}
                className={`w-11 h-11 flex items-center justify-center border rounded-sm transition-all duration-200 cursor-pointer ${
                  wishlisted ? 'bg-gold border-gold text-dark-green' : 'border-linen text-dark-green/50 hover:border-brand-green hover:text-brand-green'
                }`}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={17} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

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

        {/* Description */}
        {content && (
          <div className="mt-12 md:mt-16 border-t border-linen pt-8 md:pt-12">
            <h2 className="font-playfair font-normal text-[20px] md:text-[24px] text-dark-green mb-4">Product Description</h2>
            <div
              className="font-lato text-[14px] md:text-[15px] leading-relaxed text-dark-green/70 max-w-3xl [&_p]:mb-3 [&_a]:text-brand-green [&_a]:underline [&_a:hover]:text-dark-green [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        )}

        {/* Reviews */}
        <div className="mt-12 md:mt-16 border-t border-linen pt-8 md:pt-12">
          <h2 className="font-playfair font-normal text-[20px] md:text-[24px] text-dark-green mb-6">
            Customer Reviews
            {approvedReviews.length > 0 && (
              <span className="font-lato text-[14px] text-dark-green/40 ml-2">({approvedReviews.length})</span>
            )}
          </h2>

          {/* Public review list — approved only */}
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-brand-green/30 border-t-brand-green rounded-full animate-spin" />
            </div>
          ) : approvedReviews.length > 0 ? (
            <div className="flex flex-col gap-6 mb-10">
              {approvedReviews.map((review) => (
                <div key={review._id} className="bg-white rounded-sm p-5">
                  <div className="flex items-start gap-3 mb-3">
                    {review.userImage ? (
                      <img src={review.userImage} alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-linen flex items-center justify-center font-lato font-bold text-[13px] text-dark-green shrink-0">
                        {review.userName?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-lato font-bold text-[13px] text-dark-green">{review.userName}</p>
                      <p className="font-lato text-[11px] text-dark-green/40">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                      <div className="mt-1"><StarRating rating={review.rating} /></div>
                    </div>
                  </div>
                  <p className="font-lato text-[13px] leading-relaxed text-dark-green/70">{review.content}</p>
                  {review.images?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-3">
                      {review.images.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer">
                          <img src={img} alt="" className="w-16 h-16 object-cover rounded-sm border border-linen hover:opacity-80 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="font-lato text-[14px] text-dark-green/50 mb-10">
              No reviews yet. Be the first to share your experience!
            </p>
          )}

          {/* Write a review — logged-in users only */}
          {user ? (
            myReview ? (
              showPendingCard ? (
              <div className="bg-white rounded-sm p-6">
                <div className="flex items-start gap-3 mb-3">
                  {myReview.userImage ? (
                    <img src={myReview.userImage} alt={myReview.userName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-linen flex items-center justify-center font-lato font-bold text-[13px] text-dark-green shrink-0">
                      {myReview.userName?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-lato font-bold text-[13px] text-dark-green">Your Review</p>
                    <p className="font-lato text-[11px] text-dark-green/40">
                      {new Date(myReview.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <div className="mt-1"><StarRating rating={myReview.rating} /></div>
                  </div>
                </div>
                <p className="font-lato text-[13px] leading-relaxed text-dark-green/70 mb-3">{myReview.content}</p>
                {myReview.images?.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {myReview.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer">
                        <img src={img} alt="" className="w-16 h-16 object-cover rounded-sm border border-linen hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
              ) : null
            ) : (
            <div className="bg-white rounded-sm p-6">
              <h3 className="font-playfair font-normal text-[18px] text-dark-green mb-5">Write a Review</h3>

              {(
                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-5">
                  {/* Star selector */}
                  <div>
                    <label className="font-lato text-[12px] uppercase tracking-[1.5px] text-dark-green/60 block mb-2">Your Rating *</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewRating(n)}
                          onMouseEnter={() => setReviewHover(n)}
                          onMouseLeave={() => setReviewHover(0)}
                          className="cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star
                            size={26}
                            className={n <= (reviewHover || reviewRating) ? 'text-gold fill-gold' : 'text-sage fill-sage'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text */}
                  <div>
                    <label className="font-lato text-[12px] uppercase tracking-[1.5px] text-dark-green/60 block mb-2">
                      Your Review * <span className="normal-case text-[11px]">(min. 10 characters)</span>
                    </label>
                    <textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      rows={4}
                      placeholder="Share your experience with this product..."
                      className="w-full border border-linen rounded-sm px-4 py-3 font-lato text-[14px] text-dark-green placeholder:text-dark-green/30 focus:outline-none focus:border-brand-green resize-none"
                    />
                  </div>

                  {/* Image upload */}
                  <div>
                    <label className="font-lato text-[12px] uppercase tracking-[1.5px] text-dark-green/60 block mb-2">
                      Photos <span className="normal-case text-[11px]">(optional, up to 5)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {reviewFiles.map((file, i) => (
                        <div key={i} className="relative w-16 h-16">
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover rounded-sm border border-linen" />
                          <button
                            type="button"
                            onClick={() => setReviewFiles((prev) => prev.filter((_, j) => j !== i))}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-green text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-500 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      {reviewFiles.length < 5 && (
                        <button
                          type="button"
                          onClick={() => reviewImgRef.current?.click()}
                          className="w-16 h-16 border-2 border-dashed border-linen rounded-sm flex flex-col items-center justify-center gap-1 text-dark-green/40 hover:border-brand-green hover:text-brand-green transition-colors cursor-pointer"
                        >
                          <UploadCloud size={18} />
                          <span className="font-lato text-[9px] uppercase tracking-[1px]">Add</span>
                        </button>
                      )}
                    </div>
                    <input
                      ref={reviewImgRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const picked = Array.from(e.target.files || []);
                        setReviewFiles((prev) => [...prev, ...picked].slice(0, 5));
                        e.target.value = '';
                      }}
                    />
                  </div>

                  {reviewErr && (
                    <p className="font-lato text-[13px] text-red-500">{reviewErr}</p>
                  )}

                  <button
                    type="submit"
                    disabled={reviewStatus === 'submitting'}
                    className="self-start h-11 px-8 bg-brand-green text-white font-lato font-bold text-[12px] uppercase tracking-[1.5px] rounded-sm hover:bg-forest transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {reviewStatus === 'submitting' ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
            )
          ) : (
            <p className="font-lato text-[13px] text-dark-green/50">
              <Link to="/login" className="text-brand-green hover:underline">Sign in</Link> to leave a review.
            </p>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12 md:mt-16 border-t border-linen pt-8 md:pt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="font-lato text-brand-green text-[11px] uppercase tracking-[4px] block mb-1">{category}</span>
                <h2 className="font-playfair font-normal text-[20px] md:text-[24px] text-dark-green">You May Also Like</h2>
              </div>
              <Link
                to={categorySlug ? `/shop?category=${categorySlug}` : '/shop'}
                className="font-lato text-[12px] uppercase tracking-[1.5px] text-brand-green hover:text-dark-green transition-colors duration-200 hidden sm:block"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {related.map((p) => <SingleProduct key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
