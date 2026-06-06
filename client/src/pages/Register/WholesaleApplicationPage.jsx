import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Building2, MapPin, ShoppingBag, Lock, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const BUSINESS_TYPES = ['LLC', 'Corporation', 'Sole Proprietorship', 'Partnership', 'Non-Profit', 'Other'];
const ORDER_RANGES   = ['Under $500/mo', '$500 – $1,000/mo', '$1,000 – $5,000/mo', '$5,000 – $10,000/mo', 'Over $10,000/mo'];
const PRODUCT_INTERESTS = ['Fragrance & Body Oils', 'Incense', 'Essential Oil', 'Soap', 'Skin Care & Hair', 'African Natural Products', 'Herbs & Smudges'];
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

const BENEFITS = [
  'Exclusive bulk pricing on every product',
  'Low minimums — order from just 1 oz',
  'Access to 800+ fragrances & botanicals',
  'Dedicated account rep for large volumes',
];

const TIERS = [
  { vol: '$500 – $999 / mo',     off: '+5% off'  },
  { vol: '$1,000 – $4,999 / mo', off: '+10% off' },
  { vol: '$5,000+ / mo',         off: '+15% off' },
];

const inputCls  = 'w-full h-12 px-4 border border-[#e0e0e0] rounded-lg font-lato text-[14px] text-dark-green placeholder:text-[#bbb] outline-none focus:border-brand-green/60 focus:ring-2 focus:ring-brand-green/10 transition-all duration-200';
const selectCls = `${inputCls} bg-white`;
const labelCls  = 'block font-lato text-[11px] uppercase tracking-[1.5px] text-[#888] mb-2';

const Field = ({ label, error, children, className = '' }) => (
  <div className={className}>
    {label && <label className={labelCls}>{label}</label>}
    {children}
    {error && <p className="font-lato text-[12px] text-red-500 mt-1">{error}</p>}
  </div>
);

const StepCard = ({ step, icon: Icon, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6 md:p-8">
    <div className="flex items-center gap-4 mb-6 pb-5 border-b border-[#f3f3f3]">
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full bg-brand-green/10 flex items-center justify-center">
          <Icon size={19} className="text-brand-green" />
        </div>
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-dark-green text-linen font-lato font-bold text-[10px] flex items-center justify-center">
          {step}
        </span>
      </div>
      <div>
        <h3 className="font-playfair text-[18px] md:text-[20px] text-dark-green leading-tight">{title}</h3>
        {subtitle && <p className="font-lato text-[12px] text-dark-green/45 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const WholesaleApplicationPage = () => {
  const { applyWholesale } = useAuth();
  const [form, setForm] = useState({
    businessName: '', businessType: '', ein: '', licenseNumber: '',
    contactName: '', email: '', phone: '', address: '', city: '', state: '', zip: '',
    monthlyOrder: '', password: '', confirmPassword: '', agreeToTerms: false,
  });
  const [interests, setInterests] = useState([]);
  const [showPw, setShowPw]               = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [errors, setErrors]               = useState({});
  const [submitting, setSubmitting]       = useState(false);
  const [submitted, setSubmitted]         = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const toggleInterest = (item) =>
    setInterests((prev) => prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]);

  const validate = () => {
    const errs = {};
    if (!form.businessName.trim()) errs.businessName = 'Business name is required';
    if (!form.businessType)        errs.businessType  = 'Select a business type';
    if (!form.contactName.trim())  errs.contactName   = 'Contact name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.phone.trim())        errs.phone    = 'Phone is required';
    if (!form.address.trim())      errs.address  = 'Address is required';
    if (!form.city.trim())         errs.city     = 'City is required';
    if (!form.state)               errs.state    = 'State is required';
    if (!form.zip.trim())          errs.zip      = 'ZIP is required';
    if (form.password.length < 8)  errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.agreeToTerms)        errs.agreeToTerms = 'You must agree to the Wholesale Terms';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await applyWholesale({
        ...form,
        address: { street: form.address, city: form.city, state: form.state, zip: form.zip },
        productInterests: interests,
        agreeToTerms:     form.agreeToTerms,
      });
      setSubmitted(true);
    } catch (err) {
      setErrors({ form: err.message || 'Submission failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] px-8 py-14 text-center">
          <Link to="/" className="inline-block mb-8">
            <img src="/logo.png" alt="Golden Perfume" className="h-16 w-auto mx-auto" />
          </Link>
          <div className="w-20 h-20 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-7">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M6 18L14 26L30 10" stroke="#267B44" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-playfair text-[30px] text-dark-green mb-4">Application Received</h2>
          <p className="font-lato text-[14px] text-[#999] leading-relaxed max-w-sm mx-auto mb-3">
            Thank you, <strong className="text-[#666]">{form.contactName}</strong>! We've received your wholesale account application for <strong className="text-[#666]">{form.businessName}</strong>.
          </p>
          <p className="font-lato text-[14px] text-[#999] leading-relaxed max-w-sm mx-auto mb-10">
            Our team will review your application and contact you at <strong className="text-[#666]">{form.email}</strong> within <strong className="text-[#666]">2 business days</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/wholesale"
              className="inline-flex items-center justify-center h-12 px-8 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:bg-forest transition-colors duration-300"
            >
              Check Application Status
            </Link>
            <Link to="/"
              className="inline-flex items-center justify-center h-12 px-8 border border-[#ddd] text-dark-green font-lato font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:border-dark-green transition-colors duration-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream">

      {/* ── Left info rail ── */}
      <aside className="lg:w-[38%] lg:max-w-md bg-dark-green relative lg:sticky lg:top-0 lg:h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('/assets/brand/cat-fragrance.jpg')" }}
        />
        <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 lg:overflow-y-auto">
          <Link to="/" className="inline-block mb-8 lg:mb-10">
            <img src="/logo.png" alt="Golden Perfume" className="h-14 lg:h-20 w-auto" />
          </Link>

          <span className="font-lato text-gold text-[11px] uppercase tracking-[4px] block mb-3">
            Wholesale Portal
          </span>
          <h1 className="font-playfair font-normal text-[26px] lg:text-[34px] text-white leading-tight mb-4">
            Grow Your Business<br className="hidden lg:block" /> with Wholesale
          </h1>
          <p className="font-lato text-[14px] text-white/55 leading-relaxed mb-8 max-w-sm">
            Join hundreds of retailers, salons, and spas who source their natural fragrances and botanicals from Golden Perfume.
          </p>

          {/* Benefits */}
          <ul className="flex flex-col gap-3 mb-9">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center mt-0.5">
                  <Check size={12} className="text-gold" />
                </span>
                <span className="font-lato text-[13.5px] text-white/80 leading-snug">{b}</span>
              </li>
            ))}
          </ul>

          {/* Pricing tiers */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8">
            <p className="font-lato text-[10px] uppercase tracking-[2px] text-gold mb-4">Volume Discounts</p>
            <div className="flex flex-col gap-3">
              {TIERS.map((t) => (
                <div key={t.vol} className="flex items-center justify-between">
                  <span className="font-lato text-[13px] text-white/70">{t.vol}</span>
                  <span className="font-lato font-bold text-[13px] text-gold">{t.off}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto flex items-center gap-3 text-white/30">
            <div className="flex-1 h-px bg-white/15" />
            <span className="font-lato text-[10px] uppercase tracking-[3px] whitespace-nowrap">Reviewed in 2 business days</span>
            <div className="flex-1 h-px bg-white/15" />
          </div>
        </div>
      </aside>

      {/* ── Right form area ── */}
      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-10 lg:py-14">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h2 className="font-playfair font-normal text-[26px] md:text-[32px] text-dark-green mb-2">
              Apply for a Wholesale Account
            </h2>
            <p className="font-lato text-[14px] text-dark-green/55">
              Complete the steps below — it only takes a few minutes.
            </p>
          </div>

          {errors.form && (
            <div className="bg-red-50 border border-red-200 text-red-600 font-lato text-[13px] rounded-lg px-4 py-3 mb-6">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {/* Step 1 — Business */}
            <StepCard step="1" icon={Building2} title="Business Information" subtitle="Tell us about your company">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Business Name *" error={errors.businessName}>
                  <input type="text" value={form.businessName} onChange={set('businessName')} placeholder="Your business name" className={inputCls} />
                </Field>
                <Field label="Business Type *" error={errors.businessType}>
                  <select value={form.businessType} onChange={set('businessType')} className={selectCls}>
                    <option value="">Select type…</option>
                    {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="EIN / Tax ID" error={errors.ein}>
                  <input type="text" value={form.ein} onChange={set('ein')} placeholder="XX-XXXXXXX" className={inputCls} />
                </Field>
                <Field label="Business License #" error={errors.licenseNumber}>
                  <input type="text" value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="Optional" className={inputCls} />
                </Field>
              </div>
            </StepCard>

            {/* Step 2 — Contact & Address */}
            <StepCard step="2" icon={MapPin} title="Contact & Address" subtitle="Where we'll reach and ship to you">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Field label="Contact Name *" error={errors.contactName}>
                  <input type="text" value={form.contactName} onChange={set('contactName')} placeholder="Full name" className={inputCls} />
                </Field>
                <Field label="Email Address *" error={errors.email}>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="your@business.com" className={inputCls} />
                </Field>
                <Field label="Phone Number *" error={errors.phone} className="sm:col-span-2">
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 (000) 000-0000" className={inputCls} />
                </Field>
              </div>
              <Field label="Business Address *" error={errors.address} className="mb-4">
                <input type="text" value={form.address} onChange={set('address')} placeholder="Street address" className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="City *" error={errors.city} className="col-span-2">
                  <input type="text" value={form.city} onChange={set('city')} placeholder="City" className={inputCls} />
                </Field>
                <Field label="State *" error={errors.state}>
                  <select value={form.state} onChange={set('state')} className={selectCls}>
                    <option value="">State</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="ZIP *" error={errors.zip}>
                  <input type="text" value={form.zip} onChange={set('zip')} placeholder="00000" className={inputCls} />
                </Field>
              </div>
            </StepCard>

            {/* Step 3 — Ordering Intent */}
            <StepCard step="3" icon={ShoppingBag} title="Ordering Intent" subtitle="Helps us tailor your pricing tier">
              <Field label="Avg. Monthly Order Value" className="mb-5">
                <select value={form.monthlyOrder} onChange={set('monthlyOrder')} className={selectCls}>
                  <option value="">Select range…</option>
                  {ORDER_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <p className="font-lato text-[11px] uppercase tracking-[1.5px] text-[#888] mb-3">Products Interested In</p>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_INTERESTS.map((item) => (
                  <button key={item} type="button" onClick={() => toggleInterest(item)}
                    className={`px-4 h-9 rounded-full border font-lato text-[13px] transition-all duration-200 cursor-pointer ${
                      interests.includes(item)
                        ? 'bg-brand-green border-brand-green text-white'
                        : 'bg-white border-[#ddd] text-[#666] hover:border-brand-green'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </StepCard>

            {/* Step 4 — Account Setup */}
            <StepCard step="4" icon={Lock} title="Account Setup" subtitle="Secure your wholesale login">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Field label="Password *" error={errors.password}>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="At least 8 characters" className={`${inputCls} pr-12`} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-dark-green transition-colors cursor-pointer" aria-label="Toggle password">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>
                <Field label="Confirm Password *" error={errors.confirmPassword}>
                  <div className="relative">
                    <input type={showConfirmPw ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat password" className={`${inputCls} pr-12`} />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-dark-green transition-colors cursor-pointer" aria-label="Toggle password">
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 shrink-0">
                  <input type="checkbox" checked={form.agreeToTerms} onChange={set('agreeToTerms')} className="sr-only" />
                  <div className={`w-4 h-4 border rounded transition-colors duration-200 flex items-center justify-center ${form.agreeToTerms ? 'bg-gold border-gold' : 'border-[#ddd] bg-white group-hover:border-gold'}`}>
                    {form.agreeToTerms && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="font-lato text-[13px] text-[#666] leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-brand-green hover:text-dark-green transition-colors duration-200 underline">Wholesale Terms &amp; Conditions</Link>
                  {' '}and confirm this is a legitimate business account application.
                </span>
              </label>
              {errors.agreeToTerms && <p className="font-lato text-[12px] text-red-500 mt-2">{errors.agreeToTerms}</p>}
            </StepCard>

            {/* Submit */}
            <button type="submit" disabled={submitting}
              className="w-full h-13 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:bg-forest transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Submitting application…' : 'Submit Application'}
            </button>

            <p className="text-center font-lato text-[13px] text-[#999]">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-green font-bold hover:text-dark-green transition-colors duration-200">Sign in</Link>
              {' '}·{' '}
              <Link to="/register" className="text-brand-green hover:text-dark-green transition-colors duration-200">Customer account</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default WholesaleApplicationPage;
