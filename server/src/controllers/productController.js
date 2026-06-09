import Product from '../models/Product.js';
import { getDescendantSlugs } from './categoryController.js';

// Strip wholesalePrice from every variant when user is not wholesale/admin
const isWholesaleUser = (req) =>
  req.user?.role === 'wholesale' || req.user?.role === 'admin';

const applyPriceProjection = (query, req) => {
  if (!isWholesaleUser(req)) {
    query.select('-variants.wholesalePrice');
  }
  return query;
};

// ─── GET /api/products ─────────────────────────────────────────────────────
// Public — supports filtering, sorting, pagination, search
export const getProducts = async (req, res, next) => {
  try {
    const {
      category, sale, isNew, featured, inStock, gender,
      search, sort = 'name-asc',
      page = 1, limit = 12,
    } = req.query;

    const filter = { isActive: true };

    // A category filter includes that category AND all its sub-categories
    if (category) {
      const slugs = await getDescendantSlugs(category);
      filter.categorySlug = slugs.length > 1 ? { $in: slugs } : category;
    }
    if (sale     === '1') filter.isSale     = true;
    if (isNew    === '1') filter.isNew      = true;
    if (featured === '1') filter.isFeatured = true;
    if (inStock  === '1') filter.isStocked  = true;
    if (gender) filter.gender = { $regex: new RegExp(`^${gender}$`, 'i') };

    if (search) {
      const rx = { $regex: search, $options: 'i' };
      filter.$or = [
        { name:         rx },
        { description:  rx },
        { content:      rx },
        { categoryName: rx },
      ];
    }

    // Sort mapping
    const sortMap = {
      'name-asc':   { name: 1 },
      'name-desc':  { name: -1 },
      'price-asc':  { 'variants.0.retailPrice': 1 },
      'price-desc': { 'variants.0.retailPrice': -1 },
      'newest':     { createdAt: -1 },
      'featured':   { isFeatured: -1, createdAt: -1 },
    };
    const sortObj = sortMap[sort] ?? { name: 1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);

    const query = Product.find(filter).sort(sortObj).skip(skip).limit(Number(limit));
    applyPriceProjection(query, req);

    const products = await query;

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count:      products.length,
      data:       products,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/products/:slug ───────────────────────────────────────────────
// Public — single product by slug, includes related products
export const getProductBySlug = async (req, res, next) => {
  try {
    const query = Product.findOne({ slug: req.params.slug, isActive: true });
    applyPriceProjection(query, req);
    const product = await query;

    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });

    // Related products — same category, exclude self, max 4
    const relatedQuery = Product.find({
      categorySlug: product.categorySlug,
      _id: { $ne: product._id },
      isActive: true,
    }).limit(4);
    applyPriceProjection(relatedQuery, req);
    const related = await relatedQuery;

    res.json({ success: true, data: product, related });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/products ────────────────────────────────────────────────────
// Admin only — create product
export const createProduct = async (req, res, next) => {
  try {
    const {
      productNumber, name, slug, categorySlug, categoryName,
      gender, description, content, image, imageGallery,
      isSale, isNew, isFeatured, isStocked, tags, variants,
    } = req.body;

    if (!productNumber || !name || !slug || !categorySlug || !categoryName)
      return res.status(400).json({ success: false, message: 'productNumber, name, slug, categorySlug and categoryName are required' });

    const exists = await Product.findOne({ $or: [{ slug }, { productNumber }] });
    if (exists)
      return res.status(409).json({ success: false, message: 'Product with this slug or product number already exists' });

    const product = await Product.create({
      productNumber, name, slug, categorySlug, categoryName,
      gender: gender || '',
      description: description || '',
      content: content || '',
      image: image || '',
      imageGallery: imageGallery || [],
      isSale: isSale || false,
      isNew: isNew || false,
      isFeatured: isFeatured || false,
      isStocked: isStocked !== false,
      tags: tags || [],
      variants: variants || [],
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/products/:id ─────────────────────────────────────────────────
// Admin + Staff — update product
export const updateProduct = async (req, res, next) => {
  try {
    // Prevent slug/productNumber collision
    const { slug, productNumber } = req.body;
    if (slug || productNumber) {
      const conflict = await Product.findOne({
        $or: [
          ...(slug          ? [{ slug }]          : []),
          ...(productNumber ? [{ productNumber }]  : []),
        ],
        _id: { $ne: req.params.id },
      });
      if (conflict)
        return res.status(409).json({ success: false, message: 'Slug or product number already in use' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/products/:id ──────────────────────────────────────────────
// Admin only — soft delete
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { returnDocument: 'after' }
    );
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, message: 'Product deactivated', data: product });
  } catch (err) {
    next(err);
  }
};
