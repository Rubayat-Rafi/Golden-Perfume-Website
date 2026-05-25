import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const RegisterPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState('customer');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '', agreeToTerms: false,
  });
  const [showPw, setShowPw]               = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [errors, setErrors]               = useState({});
  const [submitting, setSubmitting]       = useState(false);
  const [success, setSuccess]             = useState(false);

  if (!isLoading && user) return <Navigate to="/" replace />;

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim())  errs.lastName  = 'Last name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.agreeToTerms) errs.agreeToTerms = 'You must agree to the Terms & Conditions';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] px-8 py-14 text-center">
          <Link to="/" className="inline-block mb-8">
            <img src="/logo.png" alt="Golden Perfume" className="h-16 w-auto mx-auto" />
          </Link>
          <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M5 14L11 20L23 8" stroke="#267B44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-playfair text-[28px] text-dark-green mb-3">Account Created!</h2>
          <p className="font-lato text-[14px] text-[#999] mb-8">
            Welcome to Golden Perfume. You can now sign in to your account.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center h-12 px-12 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:bg-forest transition-colors duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const inputCls = 'w-full h-12 px-4 border border-[#e0e0e0] rounded-lg font-lato text-[14px] text-dark-green placeholder:text-[#bbb] outline-none focus:border-brand-green/60 focus:ring-2 focus:ring-brand-green/10 transition-all duration-200';
  const labelCls = 'block font-lato text-[11px] uppercase tracking-[1.5px] text-[#888] mb-2';

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[40%] bg-dark-green relative flex-col items-center justify-center p-14 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url('/assets/brand/cat-fragrance.jpg')" }}
        />
        <div className="relative z-10 flex flex-col items-center text-center">
          <Link to="/">
            <img src="/logo.png" alt="Golden Perfume" className="h-28 w-auto mb-10 drop-shadow-lg" />
          </Link>
          <h2 className="font-playfair font-normal text-[28px] xl:text-[34px] text-white leading-snug mb-5">
            Join the Golden<br />Perfume Family
          </h2>
          <p className="font-lato text-[14px] text-white/55 max-w-xs leading-relaxed">
            Create your account to access exclusive products, track orders, and unlock wholesale pricing.
          </p>
          <div className="mt-12 flex items-center gap-3 text-white/30">
            <div className="flex-1 h-px bg-white/15" />
            <span className="font-lato text-[10px] uppercase tracking-[3px] whitespace-nowrap">New Orleans · Est. 2010</span>
            <div className="flex-1 h-px bg-white/15" />
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-cream px-5 py-12 overflow-y-auto">

        {/* Mobile logo */}
        <Link to="/" className="lg:hidden mb-8">
          <img src="/logo.png" alt="Golden Perfume" className="h-16 w-auto" />
        </Link>

        {/* Card */}
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] px-8 py-10 md:px-10 md:py-12">

          <h2 className="font-playfair font-normal text-[28px] leading-none text-dark-green mb-1.5">
            Create Account
          </h2>
          <p className="font-lato text-[14px] text-[#999] mb-7">
            Join Golden Perfume — wholesale &amp; retail fragrance oils
          </p>

          {/* Account type toggle */}
          <div className="flex gap-2 mb-7 p-1 bg-linen/60 rounded-lg">
            <button
              type="button"
              onClick={() => setAccountType('customer')}
              className={`flex-1 h-10 rounded-md font-lato font-bold text-[12px] uppercase tracking-[1px] transition-all duration-200 cursor-pointer ${
                accountType === 'customer' ? 'bg-dark-green text-linen shadow-sm' : 'text-[#999] hover:text-dark-green'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => navigate('/wholesale-apply')}
              className="flex-1 h-10 rounded-md font-lato font-bold text-[12px] uppercase tracking-[1px] transition-all duration-200 cursor-pointer text-[#999] hover:text-dark-green"
            >
              Wholesale Business
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Name row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-5">
              <div className="flex-1">
                <label className={labelCls}>First Name</label>
                <input type="text" value={form.firstName} onChange={set('firstName')} placeholder="First name" className={inputCls} />
                {errors.firstName && <p className="font-lato text-[12px] text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div className="flex-1">
                <label className={labelCls}>Last Name</label>
                <input type="text" value={form.lastName} onChange={set('lastName')} placeholder="Last name" className={inputCls} />
                {errors.lastName && <p className="font-lato text-[12px] text-red-500 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className={labelCls}>Email Address</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" className={inputCls} />
              {errors.email && <p className="font-lato text-[12px] text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="mb-5">
              <label className={labelCls}>Phone Number</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 (000) 000-0000" className={inputCls} />
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className={labelCls}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="At least 8 characters" className={`${inputCls} pr-12`} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-dark-green transition-colors cursor-pointer">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="font-lato text-[12px] text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className={labelCls}>Confirm Password</label>
              <div className="relative">
                <input type={showConfirmPw ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat your password" className={`${inputCls} pr-12`} />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-dark-green transition-colors cursor-pointer">
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="font-lato text-[12px] text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 mb-7 cursor-pointer group">
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
                <a href="#" className="text-brand-green hover:text-dark-green transition-colors duration-200 underline">Terms &amp; Conditions</a>
                {' '}and{' '}
                <a href="#" className="text-brand-green hover:text-dark-green transition-colors duration-200 underline">Privacy Policy</a>
              </span>
            </label>
            {errors.agreeToTerms && <p className="font-lato text-[12px] text-red-500 -mt-4 mb-5">{errors.agreeToTerms}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:bg-forest transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#f0f0f0]" />
            <span className="font-lato text-[12px] text-[#ccc] uppercase tracking-[1px]">or</span>
            <div className="flex-1 h-px bg-[#f0f0f0]" />
          </div>

          <p className="text-center font-lato text-[13px] text-[#999]">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-green font-bold hover:text-dark-green transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;