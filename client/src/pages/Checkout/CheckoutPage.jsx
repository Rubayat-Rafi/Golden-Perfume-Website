import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, ShoppingBag, CheckCircle, Package, Truck } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';

// ── US States + DC ────────────────────────────────────────────────────────────
const US_STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],
  ['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],
  ['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],
  ['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],
  ['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],
  ['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],
  ['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],
  ['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],
  ['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],
  ['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],
  ['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],
  ['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],
  ['WI','Wisconsin'],['WY','Wyoming'],['DC','District of Columbia'],
  ['AS','American Samoa'],['GU','Guam'],['MP','Northern Mariana Islands'],
  ['PR','Puerto Rico'],['VI','U.S. Virgin Islands'],
];

const inputCls = 'w-full h-11 px-4 border border-[#ddd] rounded-lg font-lato text-[14px] text-dark-green placeholder:text-dark-green/30 outline-none focus:border-brand-green transition-colors duration-200 bg-white';
const labelCls = 'block font-lato text-[11px] uppercase tracking-[1.5px] text-dark-green/60 mb-1.5';
const errCls   = 'font-lato text-[12px] text-red-500 mt-1';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();

  const promoCode     = location.state?.promoCode  || '';
  const promoDiscount = Number(location.state?.discount) || 0;
  const shippingCost  = total >= 50 ? 0 : 10;
  const grandTotal    = Math.max(0, total - promoDiscount) + shippingCost;

  const [form, setForm] = useState({
    name:     '',
    email:    '',
    phone:    '',
    address1: '',
    address2: '',   // apt / suite / unit
    city:     '',
    state:    '',
    zip:      '',
    country:  'US',
    notes:    '',
  });

  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiErr,     setApiErr]     = useState('');
  const [placed,     setPlaced]     = useState(null);

  useEffect(() => {
    if (items.length === 0 && !placed) navigate('/cart', { replace: true });
  }, [items, placed, navigate]);

  useEffect(() => {
    if (user) setForm((p) => ({
      ...p,
      name:  p.name  || user.name  || '',
      email: p.email || user.email || '',
    }));
  }, [user]);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const isUS = form.country === 'US';

  const validate = () => {
    const errs = {};
    if (!form.name.trim())      errs.name     = 'Full name is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email address is required';
    if (!form.address1.trim())  errs.address1 = 'Street address is required';
    if (!form.city.trim())      errs.city     = 'City is required';
    if (isUS && !form.state)    errs.state    = 'State is required';
    if (!form.zip.trim())       errs.zip      = 'ZIP code is required';
    if (isUS && !/^\d{5}(-\d{4})?$/.test(form.zip.trim()))
      errs.zip = 'Enter a valid ZIP code (e.g. 70112 or 70112-3456)';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setApiErr('');
    setSubmitting(true);
    try {
      // Combine address lines into the `street` field (schema only has one line)
      const street = form.address2.trim()
        ? `${form.address1.trim()}, ${form.address2.trim()}`
        : form.address1.trim();

      const d = await api.post('/orders', {
        items: items.map((i) => ({ variantSku: i.variantSku, qty: i.quantity })),
        shippingAddress: { street, city: form.city, state: form.state, zip: form.zip, country: form.country },
        shippingCost,
        tax:       0,
        discount:  promoDiscount,
        promoCode: promoCode || '',
        notes:     form.notes,
      });
      clearCart();
      setPlaced(d.data);
    } catch (err) {
      setApiErr(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (placed) {
    return (
      <div className="max-w-305 mx-auto px-4 md:px-10 py-20 md:py-32 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-brand-green/10 flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-brand-green" />
        </div>
        <h1 className="font-playfair text-[28px] md:text-[36px] text-dark-green mb-2">Order Placed!</h1>
        <p className="font-lato text-[16px] text-gold font-bold mb-1 tracking-wide">
          {placed.orderNumber}
        </p>
        <p className="font-lato text-[13px] text-dark-green/40 mb-2">Save this order number to track your shipment</p>
        <p className="font-lato text-[14px] text-dark-green/55 max-w-sm mb-10 leading-relaxed">
          Thank you! We'll process your order shortly and update you when it ships.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/track-order?order=${placed.orderNumber}`}
            className="h-12 px-7 flex items-center gap-2 bg-brand-green text-white font-lato font-bold text-[12px] uppercase tracking-[1.5px] rounded-lg hover:bg-dark-green transition-colors"
          >
            <Truck size={15} /> Track Order
          </Link>
          <Link
            to="/profile"
            className="h-12 px-7 flex items-center gap-2 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors"
          >
            <Package size={15} /> My Orders
          </Link>
          <Link
            to="/shop"
            className="h-12 px-7 flex items-center justify-center font-lato text-[13px] text-dark-green/50 hover:text-brand-green transition-colors"
          >
            Continue Shopping →
          </Link>
        </div>
      </div>
    );
  }

  // ── Checkout form ─────────────────────────────────────────────────────────
  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="max-w-305 mx-auto px-4 md:px-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 font-lato text-[12px] text-dark-green/50 mb-8">
          <Link to="/" className="hover:text-brand-green transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/cart" className="hover:text-brand-green transition-colors">Cart</Link>
          <ChevronRight size={12} />
          <span className="text-dark-green">Checkout</span>
        </nav>

        <h1 className="font-playfair font-normal text-[28px] md:text-[36px] text-dark-green mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Left col ─────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col gap-6">

              {/* Contact */}
              <section className="bg-white rounded-xl p-6 md:p-8 border border-[#f0f0f0]">
                <h2 className="font-playfair text-[20px] text-dark-green mb-5">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Full Name *</label>
                    <input value={form.name} onChange={set('name')} placeholder="First and last name" className={inputCls} />
                    {errors.name && <p className={errCls}>{errors.name}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputCls} />
                    {errors.email && <p className={errCls}>{errors.email}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number</label>
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000" className={inputCls} />
                  </div>
                </div>
              </section>

              {/* Shipping */}
              <section className="bg-white rounded-xl p-6 md:p-8 border border-[#f0f0f0]">
                <h2 className="font-playfair text-[20px] text-dark-green mb-5">Shipping Address</h2>
                <div className="flex flex-col gap-4">

                  {/* Country first — drives state field */}
                  <div>
                    <label className={labelCls}>Country *</label>
                    <select value={form.country} onChange={(e) => { set('country')(e); setForm((p) => ({ ...p, state: '' })); }} className={inputCls}>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="MX">Mexico</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Address lines */}
                  <div>
                    <label className={labelCls}>Address Line 1 *</label>
                    <input value={form.address1} onChange={set('address1')} placeholder="Street number and name" className={inputCls} />
                    {errors.address1 && <p className={errCls}>{errors.address1}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Address Line 2 <span className="normal-case tracking-normal text-dark-green/30">(Apt, Suite, Unit)</span></label>
                    <input value={form.address2} onChange={set('address2')} placeholder="Apt 4B, Suite 200, etc. (optional)" className={inputCls} />
                  </div>

                  {/* City / State / ZIP */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className={labelCls}>City *</label>
                      <input value={form.city} onChange={set('city')} placeholder="New Orleans" className={inputCls} />
                      {errors.city && <p className={errCls}>{errors.city}</p>}
                    </div>

                    <div>
                      <label className={labelCls}>{isUS ? 'State *' : 'State / Province'}</label>
                      {isUS ? (
                        <select value={form.state} onChange={set('state')} className={inputCls}>
                          <option value="">— Select state —</option>
                          {US_STATES.map(([code, name]) => (
                            <option key={code} value={code}>{name}</option>
                          ))}
                        </select>
                      ) : (
                        <input value={form.state} onChange={set('state')} placeholder="State / Province" className={inputCls} />
                      )}
                      {errors.state && <p className={errCls}>{errors.state}</p>}
                    </div>

                    <div>
                      <label className={labelCls}>{isUS ? 'ZIP Code *' : 'Postal Code *'}</label>
                      <input
                        value={form.zip}
                        onChange={set('zip')}
                        placeholder={isUS ? '70112' : 'Postal code'}
                        maxLength={isUS ? 10 : 20}
                        className={inputCls}
                      />
                      {errors.zip && <p className={errCls}>{errors.zip}</p>}
                    </div>
                  </div>
                </div>
              </section>

              {/* Notes */}
              <section className="bg-white rounded-xl p-6 md:p-8 border border-[#f0f0f0]">
                <h2 className="font-playfair text-[20px] text-dark-green mb-4">Order Notes <span className="font-lato text-[13px] text-dark-green/30 font-normal">(optional)</span></h2>
                <textarea
                  value={form.notes}
                  onChange={set('notes')}
                  placeholder="Gift message, delivery instructions, or any special requests…"
                  rows={3}
                  className="w-full px-4 py-3 border border-[#ddd] rounded-lg font-lato text-[14px] text-dark-green placeholder:text-dark-green/30 outline-none focus:border-brand-green transition-colors resize-none"
                />
              </section>

              {/* Payment note */}
              <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-5 flex items-start gap-3">
                <span className="text-brand-green text-[16px] mt-0.5 shrink-0 font-bold">ℹ</span>
                <p className="font-lato text-[13px] text-dark-green/70 leading-relaxed">
                  <strong className="text-dark-green">Payment on delivery / Invoice.</strong>{' '}
                  Our team will contact you to arrange payment after your order is confirmed. No payment information is required now.
                </p>
              </div>
            </div>

            {/* ── Right col: Order Summary ────────────────────────────── */}
            <div className="lg:w-96 shrink-0">
              <div className="bg-white rounded-xl border border-[#f0f0f0] p-6 md:p-8 sticky top-24">
                <h2 className="font-playfair text-[20px] text-dark-green mb-5 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-brand-green" />
                  Order Summary
                </h2>

                {/* Items */}
                <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1 mb-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded overflow-hidden bg-cream shrink-0 border border-linen">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-lato font-bold text-[13px] text-dark-green line-clamp-1">{item.name}</p>
                        <p className="font-lato text-[11px] text-dark-green/40">
                          {item.variantSize ? `${item.variantSize} · ` : ''}Qty {item.quantity}
                        </p>
                      </div>
                      <span className="font-lato font-bold text-[13px] text-dark-green shrink-0">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-[#f0f0f0] pt-4 flex flex-col gap-2.5 mb-5">
                  <div className="flex justify-between font-lato text-[13px] text-dark-green/60">
                    <span>Subtotal</span>
                    <span className="text-dark-green">${total.toFixed(2)}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between font-lato text-[13px] text-green-600">
                      <span>Promo {promoCode && `(${promoCode})`}</span>
                      <span>–${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-lato text-[13px] text-dark-green/60">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? 'text-green-600 font-bold' : 'text-dark-green'}>
                      {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-lato text-[13px] text-dark-green/60">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline border-t border-[#f0f0f0] pt-4 mb-6">
                  <span className="font-playfair text-[18px] text-dark-green">Total</span>
                  <span className="font-playfair font-bold text-[26px] text-gold">${grandTotal.toFixed(2)}</span>
                </div>

                {apiErr && (
                  <div className="bg-red-50 border border-red-200 text-red-600 font-lato text-[13px] rounded-lg px-3 py-2.5 mb-4 leading-relaxed">
                    {apiErr}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-13 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] rounded-lg hover:bg-[#c49843] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? 'Placing Order…' : 'Place Order'}
                </button>

                <Link to="/cart" className="block text-center mt-4 font-lato text-[12px] text-dark-green/40 hover:text-brand-green transition-colors">
                  ← Back to Cart
                </Link>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
