import Order, { generateOrderNumber } from '../models/Order.js';
import Product from '../models/Product.js';

// ─── GET /api/orders/track?orderNumber=GP-xxx ──────────────────────────────
// Public — no auth required. Returns safe tracking info for a given order.
export const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.query;
    if (!orderNumber)
      return res.status(400).json({ success: false, message: 'Order number is required' });

    const order = await Order.findOne({ orderNumber: orderNumber.trim().toUpperCase() })
      .populate('items.product', 'name image slug');

    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found. Please check the order number and try again.' });

    res.json({
      success: true,
      data: {
        orderNumber:       order.orderNumber,
        fulfillmentStatus: order.fulfillmentStatus,
        paymentStatus:     order.paymentStatus,
        trackingNumber:    order.trackingNumber || '',
        createdAt:         order.createdAt,
        shippingAddress:   order.shippingAddress,
        subtotal:          order.subtotal,
        discount:          order.discount,
        shippingCost:      order.shippingCost,
        grandTotal:        order.grandTotal,
        items: order.items.map((i) => ({
          name:        i.product?.name    || 'Product',
          image:       i.product?.image   || '',
          slug:        i.product?.slug    || '',
          variantSize: i.variantSize,
          qty:         i.qty,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

const isPrivileged = (role) => role === 'wholesale' || role === 'admin';

const round2 = (n) => Math.round(n * 100) / 100;

// ─── POST /api/orders ──────────────────────────────────────────────────────
export const createOrder = async (req, res, next) => {
  try {
    const {
      items = [],
      shippingAddress = {},
      shippingCost = 0,
      tax = 0,
      discount = 0,
      promoCode = '',
      notes = '',
    } = req.body;

    if (!items.length)
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });

    if (!shippingAddress.street)
      return res.status(400).json({ success: false, message: 'Shipping address is required' });

    // ── Resolve every item against the DB ──
    const resolvedItems = [];

    for (const item of items) {
      const { variantSku, qty = 1 } = item;
      if (!variantSku)
        return res.status(400).json({ success: false, message: 'Each item must include a variantSku' });
      if (qty < 1)
        return res.status(400).json({ success: false, message: `Invalid quantity for SKU ${variantSku}` });

      const product = await Product.findOne({ 'variants.sku': variantSku, isActive: true });
      if (!product)
        return res.status(400).json({ success: false, message: `Product not found for SKU: ${variantSku}` });

      const variant = product.variants.find((v) => v.sku === variantSku);
      if (!variant)
        return res.status(400).json({ success: false, message: `Variant not found: ${variantSku}` });
      if (!variant.inStock)
        return res.status(400).json({ success: false, message: `${product.name} (${variant.size}) is out of stock` });

      // Server-side price enforcement — never trust the client
      const unitPrice = isPrivileged(req.user.role)
        ? variant.wholesalePrice
        : variant.retailPrice;

      resolvedItems.push({
        product:     product._id,
        variantSku,
        variantSize: variant.size,
        qty:         Number(qty),
        unitPrice:   round2(unitPrice),
        total:       round2(unitPrice * Number(qty)),
      });
    }

    // ── Totals ──
    const subtotal   = round2(resolvedItems.reduce((sum, i) => sum + i.total, 0));
    const grandTotal = round2(subtotal + Number(shippingCost) + Number(tax) - Number(discount));

    const orderNumber  = await generateOrderNumber();
    const customerType = isPrivileged(req.user.role) ? 'b2b' : 'b2c';

    const order = await Order.create({
      orderNumber,
      user:         req.user._id,
      customerType,
      items:        resolvedItems,
      subtotal,
      discount:     round2(Number(discount)),
      shippingCost: round2(Number(shippingCost)),
      tax:          round2(Number(tax)),
      grandTotal,
      promoCode,
      shippingAddress,
      notes,
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders — admin only ─────────────────────────────────────────
export const getOrders = async (req, res, next) => {
  try {
    const { fulfillmentStatus, customerType, paymentStatus, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (fulfillmentStatus) filter.fulfillmentStatus = fulfillmentStatus;
    if (customerType)      filter.customerType      = customerType;
    if (paymentStatus)     filter.paymentStatus     = paymentStatus;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate('user', 'name email role')
      .populate('items.product', 'name image slug categoryName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count:      orders.length,
      data:       orders,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders/mine — auth ──────────────────────────────────────────
export const getMyOrders = async (req, res, next) => {
  try {
    const { fulfillmentStatus, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (fulfillmentStatus) filter.fulfillmentStatus = fulfillmentStatus;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate('items.product', 'name image slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count:      orders.length,
      data:       orders,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders/:id — auth (own or admin/staff) ──────────────────────
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone role')
      .populate('items.product', 'name image slug categoryName');

    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found' });

    const isAdminOrStaff = req.user.role === 'admin' || req.user.role === 'staff';
    if (!isAdminOrStaff && order.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/orders/:id/status — admin, staff ──────────────────────────
export const updateOrderStatus = async (req, res, next) => {
  try {
    const VALID_FULFILLMENT = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const VALID_PAYMENT     = ['pending', 'paid', 'refunded'];

    const { fulfillmentStatus, trackingNumber, paymentStatus, notes } = req.body;

    if (fulfillmentStatus && !VALID_FULFILLMENT.includes(fulfillmentStatus))
      return res.status(400).json({ success: false, message: `Invalid fulfillmentStatus. Must be one of: ${VALID_FULFILLMENT.join(', ')}` });

    if (paymentStatus && !VALID_PAYMENT.includes(paymentStatus))
      return res.status(400).json({ success: false, message: `Invalid paymentStatus. Must be one of: ${VALID_PAYMENT.join(', ')}` });

    const update = {};
    if (fulfillmentStatus !== undefined) update.fulfillmentStatus = fulfillmentStatus;
    if (trackingNumber    !== undefined) update.trackingNumber    = trackingNumber;
    if (paymentStatus     !== undefined) update.paymentStatus     = paymentStatus;
    if (notes             !== undefined) update.notes             = notes;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      update,
      { returnDocument: 'after', runValidators: true }
    ).populate('user', 'name email').populate('items.product', 'name slug');

    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
