import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

// 6-box one-time-code input with auto-advance, backspace and paste support
const CodeInput = ({ value, onChange }) => {
  const refs = useRef([]);

  const setDigit = (i, d) => {
    const next = value.split('');
    next[i] = d;
    onChange(next.join('').slice(0, CODE_LENGTH));
  };

  const handleChange = (i, e) => {
    const d = e.target.value.replace(/\D/g, '').slice(-1);
    if (!d) return;
    setDigit(i, d);
    if (i < CODE_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (value[i]) {
        setDigit(i, '');
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
        setDigit(i - 1, '');
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (pasted) {
      onChange(pasted);
      refs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-between" onPaste={handlePaste}>
      {Array.from({ length: CODE_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-12 h-14 text-center font-playfair text-[22px] text-dark-green border border-[#e0e0e0] rounded-lg outline-none focus:border-brand-green/60 focus:ring-2 focus:ring-brand-green/10 transition-all duration-200"
        />
      ))}
    </div>
  );
};

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep]           = useState('email'); // email | code | reset | done
  const [email, setEmail]         = useState('');
  const [code, setCode]           = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [resendIn, setResendIn]   = useState(0);

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // Step 1 — request a code
  const sendCode = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!trimmed || !/\S+@\S+\.\S+/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    // TODO: connect API — POST /auth/forgot-password { email } → emails a 6-digit code
    setTimeout(() => {
      setSubmitting(false);
      setStep('code');
      setResendIn(RESEND_SECONDS);
    }, 600);
  };

  const resendCode = () => {
    if (resendIn > 0) return;
    // TODO: connect API — POST /auth/forgot-password { email } (resend)
    setResendIn(RESEND_SECONDS);
    setCode('');
  };

  // Step 2 — verify the code
  const verifyCode = async (e) => {
    e.preventDefault();
    setError('');
    if (code.length !== CODE_LENGTH) {
      setError(`Please enter the ${CODE_LENGTH}-digit code.`);
      return;
    }
    setSubmitting(true);
    // TODO: connect API — POST /auth/verify-reset-code { email, code }
    setTimeout(() => {
      setSubmitting(false);
      setStep('reset');
    }, 600);
  };

  // Step 3 — set the new password
  const resetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    // TODO: connect API — POST /auth/reset-password { email, code, password }
    setTimeout(() => {
      setSubmitting(false);
      setStep('done');
    }, 600);
  };

  const headings = {
    email: ['Forgot Password?', "No worries — we'll email you a verification code"],
    code:  ['Enter Code', `We sent a ${CODE_LENGTH}-digit code to ${email}`],
    reset: ['Set New Password', 'Choose a new password for your account'],
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
            Reset Your<br />Password
          </h2>
          <p className="font-lato text-[14px] text-white/55 max-w-xs leading-relaxed">
            Enter the email linked to your account and we&apos;ll send a verification code to confirm it&apos;s you.
          </p>
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

          {step === 'done' ? (
            /* ── Success ── */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={30} className="text-brand-green" />
              </div>
              <h2 className="font-playfair font-normal text-[26px] leading-none text-dark-green mb-2">
                Password updated
              </h2>
              <p className="font-lato text-[14px] text-[#888] leading-relaxed mb-8">
                Your password has been changed successfully. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full h-12 bg-brand-green text-white font-lato font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:bg-forest transition-colors duration-300 cursor-pointer"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-playfair font-normal text-[28px] leading-none text-dark-green mb-1.5">
                {headings[step][0]}
              </h2>
              <p className="font-lato text-[14px] text-[#999] mb-8 break-words">
                {headings[step][1]}
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 font-lato text-[13px] rounded-lg px-4 py-3 mb-6">
                  {error}
                </div>
              )}

              {/* ── Step 1: email ── */}
              {step === 'email' && (
                <form onSubmit={sendCode} noValidate>
                  <div className="mb-6">
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
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-brand-green text-white font-lato font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:bg-forest transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? 'Sending…' : 'Send Code'}
                  </button>
                </form>
              )}

              {/* ── Step 2: code ── */}
              {step === 'code' && (
                <form onSubmit={verifyCode} noValidate>
                  <div className="mb-6">
                    <label className="block font-lato text-[11px] uppercase tracking-[1.5px] text-[#888] mb-3">
                      Verification Code
                    </label>
                    <CodeInput value={code} onChange={setCode} />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-brand-green text-white font-lato font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:bg-forest transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? 'Verifying…' : 'Verify Code'}
                  </button>

                  <p className="text-center font-lato text-[13px] text-[#999] mt-5">
                    Didn&apos;t get the code?{' '}
                    {resendIn > 0 ? (
                      <span className="text-[#bbb]">Resend in {resendIn}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={resendCode}
                        className="text-brand-green font-bold hover:text-dark-green transition-colors cursor-pointer"
                      >
                        Resend code
                      </button>
                    )}
                  </p>
                </form>
              )}

              {/* ── Step 3: new password ── */}
              {step === 'reset' && (
                <form onSubmit={resetPassword} noValidate>
                  <div className="mb-5">
                    <label className="block font-lato text-[11px] uppercase tracking-[1.5px] text-[#888] mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
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

                  <div className="mb-8">
                    <label className="block font-lato text-[11px] uppercase tracking-[1.5px] text-[#888] mb-2">
                      Confirm Password
                    </label>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter your new password"
                      required
                      className="w-full h-12 px-4 border border-[#e0e0e0] rounded-lg font-lato text-[14px] text-dark-green placeholder:text-[#bbb] outline-none focus:border-brand-green/60 focus:ring-2 focus:ring-brand-green/10 transition-all duration-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-brand-green text-white font-lato font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:bg-forest transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? 'Updating…' : 'Reset Password'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Back to login */}
          {step !== 'done' && (
            <Link
              to="/login"
              className="mt-6 flex items-center justify-center gap-1.5 font-lato text-[13px] text-[#999] hover:text-dark-green transition-colors duration-200"
            >
              <ArrowLeft size={15} /> Back to sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
