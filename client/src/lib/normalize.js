// Map API product shape → the shape every frontend component expects
export const normalizeProduct = (p) => ({
  // Identity — slug matches the old JSON id (e.g. "gf-fragrance-001")
  id:           p.slug,
  _id:          p._id,
  slug:         p.slug,

  name:         p.name,
  category:     p.categoryName,   // components use "category" for display
  categorySlug: p.categorySlug,
  gender:       p.gender || '',

  // Price — keep as string to match existing component expectations
  price:        String(p.priceMin ?? 0),
  priceMax:     String(p.priceMax ?? 0),

  image:        p.image || '',
  imageGallery: p.imageGallery || [],

  isSale:       p.isSale     || false,
  isNew:        p.isNew      || false,
  isFeatured:   p.isFeatured || false,
  isStocked:    p.isStocked  !== false,
  productNumber: p.productNumber || '',
  description:  p.description || '',
  content:      p.content     || '',
  rating:       p.rating      || 0,
  reviewCount:  p.reviewCount || 0,

  variants: (p.variants || []).map((v) => ({
    sku:            v.sku,
    size:           v.size,
    price:          String(v.retailPrice ?? 0),
    wholesalePrice: v.wholesalePrice != null ? String(v.wholesalePrice) : undefined,
    weight:         v.weight || '',
    inStock:        v.inStock !== false,
  })),

  // Normalise review shape from API → what ProductDetail renders
  reviews: (p.reviews || []).map((r) => ({
    author:     { name: r.authorName, image: r.authorImage || '' },
    reviewDate: r.date || '',
    rating:     r.rating || 5,
    content:    r.content || '',
  })),
});

// Map API category → what TopCategories / ShopPage sidebar expect
export const normalizeCategory = (c) => ({
  id:    c._id,
  slug:  c.slug,
  name:  c.name,
  image: c.image || '',    // TopCategories now uses cat.image
  order: c.order || 0,
});
