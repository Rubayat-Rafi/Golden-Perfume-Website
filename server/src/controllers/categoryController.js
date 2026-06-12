import Category from '../models/Category.js';

// Resolve a category slug + all of its descendant slugs (any depth).
// Used by the product filter so selecting a parent shows everything beneath it.
export const getDescendantSlugs = async (slug) => {
  const all = await Category.find({ isActive: true }).select('slug parent');
  const childrenOf = {};
  all.forEach((c) => {
    (childrenOf[c.parent || ''] ||= []).push(c.slug);
  });
  const result = [slug];
  const stack = [slug];
  while (stack.length) {
    const cur = stack.pop();
    (childrenOf[cur] || []).forEach((child) => { result.push(child); stack.push(child); });
  }
  return result;
};

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
    const { name, slug, parent } = req.body;

    if (!name || !slug)
      return res.status(400).json({ success: false, message: 'Name and slug are required' });

    const exists = await Category.findOne({ slug });
    if (exists)
      return res.status(409).json({ success: false, message: 'Slug already exists' });

    const image = req.file
      ? `/uploads/categories/${req.file.filename}`
      : (req.body.image || '');

    let gender = [];
    try { gender = req.body.gender ? JSON.parse(req.body.gender) : []; } catch { gender = []; }

    const category = await Category.create({
      name,
      slug,
      parent: parent || '',
      image,
      order: Number(req.body.order) || 0,
      gender,
    });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/categories/:id ───────────────────────────────────────────────
// Admin only — update a category
export const updateCategory = async (req, res, next) => {
  try {
    const { name, slug, parent } = req.body;

    // Prevent slug collision with another document
    if (slug) {
      const conflict = await Category.findOne({ slug, _id: { $ne: req.params.id } });
      if (conflict)
        return res.status(409).json({ success: false, message: 'Slug already in use by another category' });
    }

    const current = await Category.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: 'Category not found' });

    // Prevent a category from becoming its own parent or a descendant's child (cycle)
    if (parent !== undefined && parent) {
      if (parent === (slug || current.slug))
        return res.status(400).json({ success: false, message: 'A category cannot be its own parent' });
      const descendants = await getDescendantSlugs(current.slug);
      if (descendants.includes(parent))
        return res.status(400).json({ success: false, message: 'Cannot move a category under one of its own sub-categories' });
    }

    const image = req.file
      ? `/uploads/categories/${req.file.filename}`
      : (req.body.image !== undefined ? req.body.image : current.image);

    const isActive = req.body.isActive !== undefined
      ? req.body.isActive !== 'false' && req.body.isActive !== false
      : current.isActive;

    let gender = current.gender;
    if (req.body.gender !== undefined) {
      try { gender = JSON.parse(req.body.gender); } catch { gender = []; }
    }

    const update = { name, slug, image, order: Number(req.body.order) || 0, isActive, gender };
    if (parent !== undefined) update.parent = parent;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      update,
      { returnDocument: 'after', runValidators: true }
    );

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