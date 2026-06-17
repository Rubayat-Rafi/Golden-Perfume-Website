import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ArrowRight, Store } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const EXCLUDED = ['/admin', '/staff', '/wholesale', '/login', '/register', '/wholesale-apply'];

const WholesalePopup = () => {
  const { pathname } = useLocation();
  const { role } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const excluded = EXCLUDED.some((p) => pathname.startsWith(p));
  if (excluded || dismissed || role === 'wholesale' || role === 'admin' || role === 'staff') return null;

  return (
    <div className="fixed bottom-6 left-5 z-[190] max-w-[280px] group">
      <div className="relative bg-brand-green text-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.22)] overflow-hidden">
        {/* Close */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X size={13} />
        </button>

        {/* Content */}
        <Link to="/wholesale-apply" className="flex items-start gap-3 px-4 pt-4 pb-4 pr-9 cursor-pointer">
          <span className="shrink-0 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center mt-0.5">
            <Store size={17} className="text-[#F0D592]" />
          </span>
          <div>
            <p className="font-lato font-bold text-[12px] uppercase tracking-[1.5px] text-[#F0D592] mb-1">
              Wholesale & Distributor
            </p>
            <p className="font-lato text-[13px] leading-snug text-white">
              Want to Become a Distributor or Wholesaler?
            </p>
            <span className="inline-flex items-center gap-1 font-lato font-bold text-[11px] text-white hover:text-[#F0D592] mt-2 transition-colors">
              Apply now <ArrowRight size={11} />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default WholesalePopup;
