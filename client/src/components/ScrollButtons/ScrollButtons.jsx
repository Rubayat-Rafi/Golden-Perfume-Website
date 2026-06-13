import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

const EXCLUDED = ['/admin', '/staff', '/wholesale'];

const ScrollButtons = () => {
  const { pathname } = useLocation();
  const { sidebarOpen } = useCart();
  const [scrolled, setScrolled]     = useState(false);
  const [atBottom, setAtBottom]     = useState(false);

  const excluded = EXCLUDED.some((p) => pathname.startsWith(p));

  useEffect(() => {
    const onScroll = () => {
      const scrollY  = window.scrollY;
      const docH     = document.documentElement.scrollHeight;
      const winH     = window.innerHeight;
      setScrolled(scrollY > 300);
      setAtBottom(scrollY + winH >= docH - 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (excluded || sidebarOpen) return null;

  const scrollUp   = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollDown = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });

  const btnBase = 'w-10 h-10 flex items-center justify-center rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-all duration-300 cursor-pointer';
  const active  = `${btnBase} bg-gold text-dark-green hover:bg-[#c49843]`;
  const hidden  = `${btnBase} opacity-0 pointer-events-none translate-y-2`;

  return (
    <div className="fixed bottom-6 right-5 z-200 flex flex-col gap-2">
      <button
        onClick={scrollUp}
        aria-label="Scroll to top"
        className={scrolled ? active : hidden}
      >
        <ChevronUp size={18} />
      </button>
      <button
        onClick={scrollDown}
        aria-label="Scroll to bottom"
        className={!atBottom ? active : hidden}
      >
        <ChevronDown size={18} />
      </button>
    </div>
  );
};

export default ScrollButtons;