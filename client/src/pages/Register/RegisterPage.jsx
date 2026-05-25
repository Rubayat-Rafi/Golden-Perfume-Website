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
  const [showPw, setShowPw]         = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);

  if (!isLoading && user) {
    return <Navigate to="/" replace />;
  }

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
    // --- Replace with real API call: await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({...form, role: 'customer'}) }) ---
    await new Promise((r) => setTimeout(r, 800)); // simulate network
    setSubmitting(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#faf9ff] flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] px-8 py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M5 14L11 20L23 8" stroke="#C4A24A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-playfair text-[28px] text-[#222] mb-3">Account Created!</h2>
          <p className="font-lato text-[14px] text-[#999] mb-8">
            Welcome to Golden Perfume. You can now log in to your account.
          </p>
          <Link
            to="/login"
            className="inline-block h-13 leading-13 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] px-12 rounded-lg hover:bg-[#c49843] transition-colors duration-300"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9ff] flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <Link
        to="/"
        className="font-playfair text-[22px] uppercase tracking-[4px] text-forest mb-10 hover:text-gold transition-colors duration-200"
      >
        Golden Perfume
      </Link>

      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] px-8 py-10 md:px-12 md:py-12">
        <h2 className="font-playfair font-normal text-[28px] md:text-[32px] leading-none text-[#222] mb-2">
          Create Account
        </h2>
        <p className="font-lato text-[14px] text-[#999] mb-8">
          Join Golden Perfume — wholesale & retail fragrance oils
        </p>

        {/* Account type toggle */}
        <div className="flex gap-2 mb-8 p-1 bg-[#f5f4f9] rounded-lg">
          <button
            type="button"
            onClick={() => setAccountType('customer')}
            className={`flex-1 h-10 rounded-md font-lato font-bold text-[13px] uppercase tracking-[1px] transition-all duration-200 cursor-pointer ${
              accountType === 'customer'
                ? 'bg-gold text-dark-green shadow-sm'
                : 'text-[#999] hover:text-[#666]'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => navigate('/wholesale-apply')}
            className={`flex-1 h-10 rounded-md font-lato font-bold text-[13px] uppercase tracking-[1px] transition-all duration-200 cursor-pointer ${
              accountType === 'wholesale'
                ? 'bg-gold text-dark-green shadow-sm'
                : 'text-[#999] hover:text-[#666]'
            }`}
          >
            Wholesale Business
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <div className="flex-1">
              <label className="block font-lato text-[12px] uppercase tracking-[1.5px] text-[#666] mb-2">
                First Name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={set('firstName')}
                placeholder="First name"
                className="w-full h-12 px-4 border border-[#ddd] rounded-lg font-lato text-[14px] text-[#222] placeholder:text-[#bbb] outline-none focus:border-gold transition-colors duration-200"
              />
              {errors.firstName && <p className="font-lato text-[12px] text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div className="flex-1">
              <label className="block font-lato text-[12px] uppercase tracking-[1.5px] text-[#666] mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={set('lastName')}
                placeholder="Last name"
                className="w-full h-12 px-4 border border-[#ddd] rounded-lg font-lato text-[14px] text-[#222] placeholder:text-[#bbb] outline-none focus:border-gold transition-colors duration-200"
              />
              {errors.lastName && <p className="font-lato text-[12px] text-red-500 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block font-lato text-[12px] uppercase tracking-[1.5px] text-[#666] mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="your@email.com"
              className="w-full h-12 px-4 border border-[#ddd] rounded-lg font-lato text-[14px] text-[#222] placeholder:text-[#bbb] outline-none focus:border-gold transition-colors duration-200"
            />
            {errors.email && <p className="font-lato text-[12px] text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="mb-5">
            <label className="block font-lato text-[12px] uppercase tracking-[1.5px] text-[#666] mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="+1 (000) 000-0000"
              className="w-full h-12 px-4 border border-[#ddd] rounded-lg font-lato text-[14px] text-[#222] placeholder:text-[#bbb] outline-none focus:border-gold transition-colors duration-200"
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block font-lato text-[12px] uppercase tracking-[1.5px] text-[#666] mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="At least 8 characters"
                className="w-full h-12 px-4 pr-12 border border-[#ddd] rounded-lg font-lato text-[14px] text-[#222] placeholder:text-[#bbb] outline-none focus:border-gold transition-colors duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#666] transition-colors cursor-pointer"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="font-lato text-[12px] text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block font-lato text-[12px] uppercase tracking-[1.5px] text-[#666] mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPw ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Repeat your password"
                className="w-full h-12 px-4 pr-12 border border-[#ddd] rounded-lg font-lato text-[14px] text-[#222] placeholder:text-[#bbb] outline-none focus:border-gold transition-colors duration-200"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#666] transition-colors cursor-pointer"
                aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
              >
                {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="font-lato text-[12px] text-red-500 mt-1">{errors.confirmPassword}</p>}
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
              <a href="#" className="text-forest hover:text-gold transition-colors duration-200 underline">Terms & Conditions</a>
              {' '}and{' '}
              <a href="#" className="text-forest hover:text-gold transition-colors duration-200 underline">Privacy Policy</a>
            </span>
          </label>
          {errors.agreeToTerms && <p className="font-lato text-[12px] text-red-500 -mt-5 mb-5">{errors.agreeToTerms}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-13 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] rounded-lg hover:bg-[#c49843] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center font-lato text-[13px] text-[#999] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-forest font-bold hover:text-gold transition-colors duration-200">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
