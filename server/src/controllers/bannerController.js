import Banner from '../models/Banner.js';
import { deleteFile } from '../utils/deleteFile.js';

// ─── GET /api/banners ──────────────────────────────────────────────────────
// Public — active banners for the hero, sorted by order
export const getActiveBanners = async (_req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: banners.length, data: banners });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/banners/all ──────────────────────────────────────────────────
// Admin — every banner
export const getAllBanners = async (_req, res, next) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: banners.length, data: banners });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/banners ─────────────────────────────────────────────────────
// Admin — upload a banner image (multer) + link/title/order
export const createBanner = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'A banner image is required' });

    const { link = '', title = '', order = 0 } = req.body;

    const banner = await Banner.create({
      image: `/uploads/banners/${req.file.filename}`,
      link:  link.trim(),
      title: title.trim(),
      order: Number(order) || 0,
    });

    res.status(201).json({ success: true, data: banner });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/banners/:id ──────────────────────────────────────────────────
// Admin — update fields; optionally replace the image
export const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      if (req.file) deleteFile(`/uploads/banners/${req.file.filename}`);
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    const { link, title, order, isActive } = req.body;
    if (link     !== undefined) banner.link  = String(link).trim();
    if (title          !== undefined) banner.title          = String(title).trim();
    if (order          !== undefined) banner.order          = Number(order) || 0;
    if (isActive       !== undefined) banner.isActive       = isActive === true || isActive === 'true';
    if (req.body.seoTitle       !== undefined) banner.seoTitle       = String(req.body.seoTitle).trim();
    if (req.body.seoDescription !== undefined) banner.seoDescription = String(req.body.seoDescription).trim();

    // Replace image if a new file was uploaded
    if (req.file) {
      deleteFile(banner.image);
      banner.image = `/uploads/banners/${req.file.filename}`;
    }

    await banner.save();
    res.json({ success: true, data: banner });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/banners/reorder ──────────────────────────────────────────────
// Admin — persist a new display order. Body: { items: [{ id, order }] }
export const reorderBanners = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ success: false, message: 'items array is required' });

    await Banner.bulkWrite(
      items.map(({ id, order }) => ({
        updateOne: { filter: { _id: id }, update: { $set: { order: Number(order) } } },
      }))
    );

    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/banners/:id ───────────────────────────────────────────────
// Admin — remove banner + its file
export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner)
      return res.status(404).json({ success: false, message: 'Banner not found' });

    deleteFile(banner.image);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    next(err);
  }
};
