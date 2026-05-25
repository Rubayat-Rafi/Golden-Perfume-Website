import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const { user, login, roleRedirect, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in — redirect away
  if (!isLoading && user) {
    return <Navigate to={roleRedirect[user.role] ?? '/'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedIn = await login(email, password);
      navigate(roleRedirect[loggedIn.role] ?? '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] px-8 py-10 md:px-12 md:py-12">
        <h2 className="font-playfair font-normal text-[28px] md:text-[32px] leading-none text-[#222] mb-2">
          Welcome Back
        </h2>
        <p className="font-lato text-[14px] text-[#999] mb-8">
          Sign in to your Golden Perfume account
        </p>

        {/* Dev hint */}
        <div className="bg-[#faf9ff] border border-[#eee] rounded-lg px-4 py-3 mb-6 font-lato text-[12px] text-[#999] leading-relaxed">
          <span className="font-bold text-[#666]">Dev accounts:</span>
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
            <label className="block font-lato text-[12px] uppercase tracking-[1.5px] text-[#666] mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
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
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-3 mb-8 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="sr-only"
              />
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

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-13 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] rounded-lg hover:bg-[#c49843] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? 'Signing in…' : 'Log In'}
          </button>
        </form>

        {/* Footer links */}
        <div className="flex justify-between items-center mt-6 font-lato text-[13px]">
          <span className="text-[#999]">
            No account?{' '}
            <Link to="/register" className="text-forest font-bold hover:text-gold transition-colors duration-200">
              Register now
            </Link>
          </span>
          <a href="#" className="text-[#999] hover:text-gold transition-colors duration-200">
            Forgot password?
          </a>
        </div>
      </div>

      {/* Wholesale CTA */}
      <div className="mt-8 text-center">
        <p className="font-lato text-[13px] text-[#999] mb-3">Applying for a wholesale account?</p>
        <Link
          to="/wholesale-apply"
          className="font-lato font-bold text-[13px] uppercase tracking-[1.5px] text-forest hover:text-gold transition-colors duration-200"
        >
          Apply for Wholesale Access →
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
