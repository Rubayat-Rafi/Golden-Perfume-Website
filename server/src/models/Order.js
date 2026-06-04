import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantSku:  { type: String, required: true },
  variantSize: { type: String, default: '' },
  qty:         { type: Number, required: true, min: 1 },
  unitPrice:   { type: Number, required: true, min: 0 },  // price snapshot
  total:       { type: Number, required: true, min: 0 },  // qty * unitPrice
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  street:  { type: String, default: '' },
  city:    { type: String, default: '' },
  state:   { type: String, default: '' },
  zip:     { type: String, default: '' },
  country: { type: String, default: 'US' },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerType: { type: String, enum: ['b2c', 'b2b'], default: 'b2c', index: true },

    items:           { type: [orderItemSchema], default: [] },
    subtotal:        { type: Number, default: 0 },
    discount:        { type: Number, default: 0 },
    shippingCost:    { type: Number, default: 0 },
    tax:             { type: Number, default: 0 },
    grandTotal:      { type: Number, default: 0 },
    promoCode:       { type: String, default: '' },

    shippingAddress: { type: shippingAddressSchema, default: () => ({}) },

    paymentStatus:     { type: String, enum: ['pending', 'paid', 'refunded'],                                    default: 'pending' },
    paymentIntentId:   { type: String, default: '' },
    fulfillmentStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],     default: 'pending', index: true },
    trackingNumber:    { type: String, default: '' },
    notes:             { type: String, default: '' },
  },
  { timestamps: true }
);

// GP-2026-00001 — padded 5-digit counter
export const generateOrderNumber = async () => {
  const year  = new Date().getFullYear();
  const count = await Order.countDocuments();
  return `GP-${year}-${String(count + 1).padStart(5, '0')}`;
};

const Order = mongoose.model('Order', orderSchema);
export default Order;
