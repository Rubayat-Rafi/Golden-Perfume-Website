import WholesaleApplication from '../models/WholesaleApplication.js';
import User from '../models/User.js';

// ─── GET /api/wholesale/applications ──────────────────────────────────────
// Admin — list all applications, filterable by status
export const getApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await WholesaleApplication.countDocuments(filter);

    const applications = await WholesaleApplication.find(filter)
      .populate('userId',     'name email role createdAt')
      .populate('reviewedBy', 'name email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count:      applications.length,
      data:       applications,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/wholesale/applications/:id ──────────────────────────────────
// Admin — single application detail
export const getApplication = async (req, res, next) => {
  try {
    const application = await WholesaleApplication.findById(req.params.id)
      .populate('userId',     'name email phone role createdAt addresses')
      .populate('reviewedBy', 'name email');

    if (!application)
      return res.status(404).json({ success: false, message: 'Application not found' });

    res.json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/wholesale/applications/:id ─────────────────────────────────
// Admin — set an application's state to any value (approve / reject / re-open)
// Body: { status: 'pending' | 'approved' | 'rejected', adminNote?: string }
// Also accepts legacy { action: 'approve' | 'reject' }.
const VALID_STATUS = ['pending', 'approved', 'rejected'];

export const reviewApplication = async (req, res, next) => {
  try {
    let { status, action, adminNote = '' } = req.body;

    // Backward-compat: map action → status
    if (!status && action) status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action;

    if (!VALID_STATUS.includes(status))
      return res.status(400).json({ success: false, message: `status must be one of: ${VALID_STATUS.join(', ')}` });

    const application = await WholesaleApplication.findById(req.params.id).populate('userId', 'name email role');
    if (!application)
      return res.status(404).json({ success: false, message: 'Application not found' });

    // Update the application
    application.status     = status;
    application.adminNote  = adminNote;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();

    // Sync the applicant's role with the decision.
    // Never touch staff/admin accounts — only flip between customer ⇄ wholesale.
    const applicant = application.userId;
    if (applicant && (applicant.role === 'customer' || applicant.role === 'wholesale')) {
      const targetRole = status === 'approved' ? 'wholesale' : 'customer';
      if (applicant.role !== targetRole) {
        await User.findByIdAndUpdate(applicant._id, { role: targetRole });
      }
    }

    const updated = await WholesaleApplication.findById(req.params.id)
      .populate('userId',     'name email role')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: `Application set to ${status}`,
      data:    updated,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/wholesale/my-application ────────────────────────────────────
// Authenticated user — check the status of their own application
export const getMyApplication = async (req, res, next) => {
  try {
    const application = await WholesaleApplication.findOne({ userId: req.user._id })
      .populate('reviewedBy', 'name');

    if (!application)
      return res.status(404).json({ success: false, message: 'No application found for your account' });

    res.json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};
