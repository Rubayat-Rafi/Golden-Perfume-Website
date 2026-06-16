import NewsletterSubscriber from '../models/NewsletterSubscriber.js';

// ─── POST /api/newsletter ──────────────────────────────────────────────────
// Public — subscribe an email address
export const subscribe = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();

    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ success: false, message: 'A valid email address is required' });

    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      if (existing.isActive)
        return res.status(409).json({ success: false, message: 'This email is already subscribed' });

      // Re-subscribe if previously unsubscribed
      existing.isActive = true;
      await existing.save();
      return res.json({ success: true, message: 'You have been re-subscribed. Thank you!' });
    }

    await NewsletterSubscriber.create({ email });
    res.status(201).json({ success: true, message: 'Thank you for subscribing!' });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/newsletter ───────────────────────────────────────────────────
// Admin — list all subscribers
export const getSubscribers = async (req, res, next) => {
  try {
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.active !== undefined) filter.isActive = req.query.active !== 'false';

    const search = (req.query.search || '').trim();
    if (search) {
      filter.email = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }

    const [subscribers, total, activeCount] = await Promise.all([
      NewsletterSubscriber.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      NewsletterSubscriber.countDocuments(filter),
      NewsletterSubscriber.countDocuments({ isActive: true }),
    ]);

    res.json({ success: true, total, activeCount, page, totalPages: Math.ceil(total / limit), data: subscribers });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/newsletter/:id ────────────────────────────────────────────
// Admin — remove subscriber
export const removeSubscriber = async (req, res, next) => {
  try {
    const sub = await NewsletterSubscriber.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscriber not found' });
    res.json({ success: true, message: 'Subscriber removed' });
  } catch (err) {
    next(err);
  }
};
