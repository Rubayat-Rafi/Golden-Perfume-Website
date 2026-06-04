import ContactMessage from '../models/ContactMessage.js';

// ─── POST /api/contact ─────────────────────────────────────────────────────
// Public — submit a contact form message
export const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject = '', message } = req.body;

    if (!name?.trim())    return res.status(400).json({ success: false, message: 'Name is required' });
    if (!email?.trim() || !/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ success: false, message: 'Valid email is required' });
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });

    await ContactMessage.create({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() });

    res.status(201).json({ success: true, message: "Thank you! We'll get back to you within 1–2 business days." });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/contact ──────────────────────────────────────────────────────
// Admin — list all contact messages
export const getMessages = async (req, res, next) => {
  try {
    const { unread, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (unread === '1') filter.isRead = false;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await ContactMessage.countDocuments(filter);

    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count:      messages.length,
      data:       messages,
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/contact/:id/read ──────────────────────────────────────────
// Admin — mark a message as read
export const markRead = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { returnDocument: 'after' }
    );
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};
