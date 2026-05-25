import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const BUSINESS_TYPES = ['LLC', 'Corporation', 'Sole Proprietorship', 'Partnership', 'Non-Profit', 'Other'];
const ORDER_RANGES   = ['Under $500/mo', '$500 – $1,000/mo', '$1,000 – $5,000/mo', '$5,000 – $10,000/mo', 'Over $10,000/mo'];
const PRODUCT_INTERESTS = ['Fragrance & Body Oils', 'Incense', 'Essential Oil', 'Soap', 'Skin Care & Hair', 'African Natural Products', 'Herbs & Smudges'];
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

const SectionLabel = ({ children }) => (
  <p className="font-lato text-[11px] uppercase tracking-[3px] text-[#aaa] mb-5 mt-8 pb-3 border-b border-[#f0f0f0]">
    {children}
  </p>
);

const Field = ({ label, error, children }) => (
  <div>
    {label && (
      <label className="block font-lato text-[12px] uppercase tracking-[1.5px] text-[#666] mb-2">
        {label}
      </label>
    )}
    {children}
    {error && <p className="font-lato text-[12px] text-red-500 mt-1">{error}</p>}
  </div>
);

const inputCls = 'w-full h-12 px-4 border border-[#ddd] rounded-lg font-lato text-[14px] text-[#222] placeholder:text-[#bbb] outline-none focus:border-gold transition-colors duration-200';
const selectCls = 'w-full h-12 px-4 border border-[#ddd] rounded-lg font-lato text-[14px] text-[#222] outline-none focus:border-gold transition-colors duration-200 bg-white';

const WholesaleApplicationPage = () => {
  const [form, setForm] = useState({
    businessName: '', businessType: '', ein: '', licenseNumber: '',
    contactName: '', email: '', phone: '', address: '', city: '', state: '', zip: '',
    monthlyOrder: '', password: '', confirmPassword: '', agreeToTerms: false,
  });
  const [interests, setInterests] = useState([]);
  const [showPw, setShowPw]           = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [errors, setErrors]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);

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
    // --- Replace with: await fetch('/api/auth/wholesale-apply', { method: 'POST', body: JSON.stringify({...form, interests}) }) ---
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#faf9ff] flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] px-8 py-14 text-center">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-7">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M6 18L14 26L30 10" stroke="#C4A24A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-playfair text-[30px] text-[#222] mb-4">Application Received</h2>
          <p className="font-lato text-[14px] text-[#999] leading-relaxed max-w-sm mx-auto mb-3">
            Thank you, <strong className="text-[#666]">{form.contactName}</strong>! We've received your wholesale account application for <strong className="text-[#666]">{form.businessName}</strong>.
          </p>
          <p className="font-lato text-[14px] text-[#999] leading-relaxed max-w-sm mx-auto mb-10">
            Our team will review your application and contact you at <strong className="text-[#666]">{form.email}</strong> within <strong className="text-[#666]">2 business days</strong>.
          </p>
          <Link
            to="/"
            className="inline-block h-13 leading-13 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] px-12 rounded-lg hover:bg-[#c49843] transition-colors duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9ff] px-4 py-16">
      {/* Logo */}
      <div className="text-center mb-10">
        <Link
          to="/"
          className="font-playfair text-[22px] uppercase tracking-[4px] text-forest hover:text-gold transition-colors duration-200"
        >
          Golden Perfume
        </Link>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] px-8 py-10 md:px-14 md:py-12">
        {/* Header */}
        <div className="pb-7 border-b border-[#f0f0f0] mb-2">
          <span className="font-lato text-gold text-[12px] uppercase tracking-[4px] block mb-3">
            Wholesale Portal
          </span>
          <h2 className="font-playfair font-normal text-[28px] md:text-[34px] leading-none text-[#222] mb-3">
            Apply for a Wholesale Account
          </h2>
          <p className="font-lato text-[14px] text-[#999] leading-relaxed">
            Access exclusive bulk pricing on fragrance oils, incense, essential oils, and more.
            Applications are reviewed within <strong>2 business days</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ─── Business Information ─── */}
          <SectionLabel>Business Information</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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

          {/* ─── Contact Information ─── */}
          <SectionLabel>Contact Information</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Contact Name *" error={errors.contactName}>
              <input type="text" value={form.contactName} onChange={set('contactName')} placeholder="Full name" className={inputCls} />
            </Field>
            <Field label="Email Address *" error={errors.email}>
              <input type="email" value={form.email} onChange={set('email')} placeholder="your@business.com" className={inputCls} />
            </Field>
            <Field label="Phone Number *" error={errors.phone}>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 (000) 000-0000" className={inputCls} />
            </Field>
          </div>
          <div className="mb-4">
            <Field label="Business Address *" error={errors.address}>
              <input type="text" value={form.address} onChange={set('address')} placeholder="Street address" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="col-span-2">
              <Field label="City *" error={errors.city}>
                <input type="text" value={form.city} onChange={set('city')} placeholder="City" className={inputCls} />
              </Field>
            </div>
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

          {/* ─── Ordering Intent ─── */}
          <SectionLabel>Ordering Intent</SectionLabel>
          <div className="mb-6">
            <Field label="Avg. Monthly Order Value">
              <select value={form.monthlyOrder} onChange={set('monthlyOrder')} className={selectCls}>
                <option value="">Select range…</option>
                {ORDER_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>
          <div className="mb-2">
            <p className="font-lato text-[12px] uppercase tracking-[1.5px] text-[#666] mb-3">Products Interested In</p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_INTERESTS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInterest(item)}
                  className={`px-4 h-9 rounded-full border font-lato text-[13px] transition-all duration-200 cursor-pointer ${
                    interests.includes(item)
                      ? 'bg-gold border-gold text-dark-green'
                      : 'bg-white border-[#ddd] text-[#666] hover:border-gold'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Account Setup ─── */}
          <SectionLabel>Account Setup</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Field label="Password *" error={errors.password}>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="At least 8 characters" className={`${inputCls} pr-12`} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#666] transition-colors cursor-pointer" aria-label="Toggle password">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Field label="Confirm Password *" error={errors.confirmPassword}>
              <div className="relative">
                <input type={showConfirmPw ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat password" className={`${inputCls} pr-12`} />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#666] transition-colors cursor-pointer" aria-label="Toggle password">
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 mb-8 cursor-pointer group">
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
              <a href="#" className="text-forest hover:text-gold transition-colors duration-200 underline">Wholesale Terms & Conditions</a>
              {' '}and confirm this is a legitimate business account application.
            </span>
          </label>
          {errors.agreeToTerms && <p className="font-lato text-[12px] text-red-500 -mt-5 mb-5">{errors.agreeToTerms}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-13 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] rounded-lg hover:bg-[#c49843] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? 'Submitting application…' : 'Submit Application'}
          </button>
        </form>

        <p className="text-center font-lato text-[13px] text-[#999] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-forest font-bold hover:text-gold transition-colors duration-200">
            Log in
          </Link>
          {' '}·{' '}
          <Link to="/register" className="text-forest hover:text-gold transition-colors duration-200">
            Customer account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default WholesaleApplicationPage;
