import Category from '../models/Category.js';

// ─── GET /api/categories ───────────────────────────────────────────────────
// Public — returns all active categories sorted by order
export const getCategories = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;

    const filter = {};
    // Admins/staff can pass ?includeInactive=true to see hidden categories
    if (includeInactive !== 'true' || !['admin', 'staff'].includes(req.user?.role)) {
      filter.isActive = true;
    }

    const categories = await Category.find(filter).sort({ order: 1, name: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/categories/:slug ─────────────────────────────────────────────
// Public — single category by slug
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/categories ──────────────────────────────────────────────────
// Admin only — create a new category
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, image, order } = req.body;

    if (!name || !slug)
      return res.status(400).json({ success: false, message: 'Name and slug are required' });

    const exists = await Category.findOne({ slug });
    if (exists)
      return res.status(409).json({ success: false, message: 'Slug already exists' });

    const category = await Category.create({ name, slug, image: image || '', order: order ?? 0 });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/categories/:id ───────────────────────────────────────────────
// Admin only — update a category
export const updateCategory = async (req, res, next) => {
  try {
    const { name, slug, image, order, isActive } = req.body;

    // Prevent slug collision with another document
    if (slug) {
      const conflict = await Category.findOne({ slug, _id: { $ne: req.params.id } });
      if (conflict)
        return res.status(409).json({ success: false, message: 'Slug already in use by another category' });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug, image, order, isActive },
      { returnDocument: 'after', runValidators: true }
    );

    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/categories/:id ────────────────────────────────────────────
// Admin only — soft-delete (sets isActive: false)
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { returnDocument: 'after' }
    );
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deactivated', data: category });
  } catch (err) {
    next(err);
  }
};