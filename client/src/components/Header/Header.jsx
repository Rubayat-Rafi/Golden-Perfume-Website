import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { Search, User, Heart, ShoppingCart, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Nav } from './Nav/Nav';
import { navItem } from '../../data/data.header';
import useWindowSize from '../../hooks/useWindowSize';

const Header = () => {
  const [promo, setPromo] = useState(true);
  const [fixedNav, setFixedNav] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [, height] = useWindowSize();
  const menuRef = useRef(null);

  // On pages without a hero, start fixed immediately
  useEffect(() => {
    if (!document.querySelector('[data-hero]')) {
      setFixedNav(true);
    }
  }, []);

  // Sticky on scroll
  useEffect(() => {
    const isSticky = () => setFixedNav(window.scrollY > 10);
    window.addEventListener('scroll', isSticky);
    return () => window.removeEventListener('scroll', isSticky);
  }, []);

  // Body scroll lock for mobile menu
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    if (openMenu && height < 768) {
      disableBodyScroll(el);
    } else {
      enableBodyScroll(el);
    }
    return () => enableBodyScroll(el);
  }, [openMenu, height]);

  const iconClass = fixedNav
    ? 'text-forest hover:text-gold transition-colors duration-200'
    : 'text-white/90 hover:text-gold transition-colors duration-200';

  const logoClass = fixedNav
    ? 'text-forest'
    : 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]';

  return (
    <header className="absolute left-0 top-0 w-full z-101">
      {/* Promo bar */}
      {promo && (
        <div className="bg-dark-green px-4 py-3 text-center relative">
          <span className="font-lato font-bold text-[13px] text-linen/90 uppercase tracking-wide">
            FREE SHIPPING ON ORDERS OVER $50 &nbsp;|&nbsp; CALL US: +1 (504) 529-2069
          </span>
          <button
            onClick={() => setPromo(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-linen/90 hover:opacity-70 transition-opacity duration-200 cursor-pointer"
            aria-label="Close promo bar"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main header content */}
      <div
        className={[
          'flex flex-col transition-all duration-300',
          fixedNav
            ? 'fixed top-0 w-full bg-cream/97 shadow-[0_2px_12px_rgba(0,0,0,0.08)]'
            : 'relative',
        ].join(' ')}
      >
        {/* Brand bar */}
        <div className="flex items-center justify-between px-4 md:px-7.5 xl:px-15 py-3 md:py-4 relative">
          {/* Left — search (hidden on mobile) */}
          <div className="hidden md:flex items-center">
            <Link to="/search" className={iconClass} aria-label="Search">
              <Search size={19} />
            </Link>
          </div>

          {/* Center — logo */}
          <Link
            to="/"
            className={[
              'font-playfair text-[18px] md:text-[22px] uppercase tracking-[3px] whitespace-nowrap transition-colors duration-300',
              'md:absolute md:left-1/2 md:-translate-x-1/2',
              logoClass,
            ].join(' ')}
          >
            Golden Perfume
          </Link>

          {/* Right — icons */}
          <ul className="flex items-center gap-2 md:gap-7.5 ml-auto md:ml-0">
            <li>
              <Link to="/profile" className={iconClass} aria-label="Profile">
                <User size={19} />
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className={iconClass} aria-label="Wishlist">
                <Heart size={19} />
              </Link>
            </li>
            <li>
              <Link to="/cart" className={`relative flex items-center ${iconClass}`} aria-label="Cart">
                <ShoppingCart size={19} />
                <span className="w-5.5 h-5.5 rounded-full flex justify-center items-center bg-gold font-lato font-bold text-[12px] text-dark-green ml-1">
                  0
                </span>
              </Link>
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="md:hidden flex flex-col justify-center items-center w-5.5 h-11.25 ml-3 relative z-111 cursor-pointer"
            aria-label="Toggle menu"
          >
            <span
              className={[
                'block h-0.5 w-5.5 absolute transition-all duration-86 ease-out',
                fixedNav ? 'bg-forest' : 'bg-white/90',
                openMenu ? 'top-1/2 rotate-45' : 'top-[calc(50%-7px)]',
              ].join(' ')}
            />
            <span
              className={[
                'block h-0.5 w-5.5 absolute top-1/2 -translate-y-px transition-all duration-86 ease-out',
                fixedNav ? 'bg-forest' : 'bg-white/90',
                openMenu ? 'opacity-0' : 'opacity-100',
              ].join(' ')}
            />
            <span
              className={[
                'block h-0.5 w-5.5 absolute transition-all duration-86 ease-out',
                fixedNav ? 'bg-forest' : 'bg-white/90',
                openMenu ? 'top-1/2 -rotate-45' : 'top-[calc(50%+5px)]',
              ].join(' ')}
            />
          </button>
        </div>

        {/* Nav row — desktop */}
        <div
          className={[
            'hidden md:flex justify-center px-4 md:px-7.5 xl:px-15 pb-2 md:pb-2.5',
            fixedNav ? 'border-t border-linen' : 'border-t border-white/20',
          ].join(' ')}
        >
          <Nav navItem={navItem} isFixed={fixedNav} isMobile={false} />
        </div>

        {/* Nav panel — mobile slide-in */}
        <div
          ref={menuRef}
          className={[
            'md:hidden fixed top-0 right-0 h-full w-65 bg-cream z-101 flex flex-col pt-15 px-7.5 pb-7.5 overflow-y-auto transition-transform duration-300 ease-in-out',
            openMenu ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
        >
          <Nav navItem={navItem} isFixed={true} isMobile={true} />
        </div>

        {/* Mobile overlay */}
        {openMenu && (
          <div
            className="md:hidden fixed inset-0 bg-black/30 z-100"
            onClick={() => setOpenMenu(false)}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
