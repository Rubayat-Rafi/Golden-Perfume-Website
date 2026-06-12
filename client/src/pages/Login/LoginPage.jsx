import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const { user, login, roleRedirect, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [remember, setRemember]     = useState(false);
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && user) {
    return <Navigate to={roleRedirect[user.role] ?? '/'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedIn = await login(email, password);
      toast.success(`Welcome back, ${loggedIn.name.split(' ')[0]}!`);
      navigate(roleRedirect[loggedIn.role] ?? '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-dark-green relative flex-col items-center justify-center p-14 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url('/assets/brand/hero-4.webp')" }}
        />
        <div className="relative z-10 flex flex-col items-center text-center">
          <Link to="/">
            <img src="/logo.png" alt="Golden Perfume" className="h-28 w-auto mb-10 drop-shadow-lg" />
          </Link>
          <h2 className="font-playfair font-normal text-[30px] xl:text-[36px] text-white leading-snug mb-5">
            Natural Fragrances<br />&amp; Botanicals
          </h2>
          <p className="font-lato text-[14px] text-white/55 max-w-xs leading-relaxed">
            Hand-blended essential oils and botanical perfumes, crafted in small batches from the finest natural ingredients.
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
        <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] px-8 py-10 md:px-10 md:py-12">

          <h2 className="font-playfair font-normal text-[28px] leading-none text-dark-green mb-1.5">
            Welcome Back
          </h2>
          <p className="font-lato text-[14px] text-[#999] mb-8">
            Sign in to your Golden Perfume account
          </p>

          {/* Dev hint */}
          <div className="bg-linen/60 border border-linen rounded-lg px-4 py-3 mb-6 font-lato text-[12px] text-[#999] leading-relaxed">
            <span className="font-bold text-[#777]">Dev accounts:</span>
            {' '}customer@test.com · wholesale@test.com · staff@test.com · admin@test.com
            {' '}(any password)
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 font-lato text-[13px] rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-5">
              <label className="block font-lato text-[11px] uppercase tracking-[1.5px] text-[#888] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full h-12 px-4 border border-[#e0e0e0] rounded-lg font-lato text-[14px] text-dark-green placeholder:text-[#bbb] outline-none focus:border-brand-green/60 focus:ring-2 focus:ring-brand-green/10 transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block font-lato text-[11px] uppercase tracking-[1.5px] text-[#888] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-12 px-4 pr-12 border border-[#e0e0e0] rounded-lg font-lato text-[14px] text-dark-green placeholder:text-[#bbb] outline-none focus:border-brand-green/60 focus:ring-2 focus:ring-brand-green/10 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-dark-green transition-colors cursor-pointer"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between mb-8">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="sr-only" />
                  <div className={`w-4 h-4 border rounded transition-colors duration-200 flex items-center justify-center ${remember ? 'bg-gold border-gold' : 'border-[#ddd] bg-white group-hover:border-gold'}`}>
                    {remember && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="font-lato text-[13px] text-[#666]">Remember me</span>
              </label>
              <a href="#" className="font-lato text-[13px] text-[#999] hover:text-gold transition-colors duration-200">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:bg-forest transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#f0f0f0]" />
            <span className="font-lato text-[12px] text-[#ccc] uppercase tracking-[1px]">or</span>
            <div className="flex-1 h-px bg-[#f0f0f0]" />
          </div>

          <p className="text-center font-lato text-[13px] text-[#999]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-green font-bold hover:text-dark-green transition-colors duration-200">
              Create one
            </Link>
          </p>
        </div>

        {/* Wholesale CTA */}
        <div className="mt-6 text-center">
          <p className="font-lato text-[12px] text-[#aaa] mb-2">Applying for a wholesale account?</p>
          <Link
            to="/wholesale-apply"
            className="font-lato font-bold text-[12px] uppercase tracking-[1.5px] text-brand-green hover:text-dark-green transition-colors duration-200"
          >
            Apply for Wholesale Access →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;