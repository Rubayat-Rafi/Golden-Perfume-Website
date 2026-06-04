import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { Search, User, Heart, ShoppingCart, X, ChevronDown, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Nav } from './Nav/Nav';
import SearchPanel from './SearchPanel';
import { navItem } from '../../data/data.header';
import useWindowSize from '../../hooks/useWindowSize';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';

const Header = () => {
  const { pathname } = useLocation();
  const isHeroPage = pathname === '/';

  const [promo, setPromo]           = useState(true);
  const [scrolled, setScrolled]     = useState(false);
  const fixedNav = !isHeroPage || scrolled;
  const [openMenu, setOpenMenu]     = useState(false);
  const [userMenu, setUserMenu]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [, height] = useWindowSize();
  const menuRef     = useRef(null);
  const userMenuRef = useRef(null);
  const headerRef   = useRef(null);
  const { user, role, logout, roleRedirect } = useAuth();
  const { itemCount } = useCart();
  const { items: wishItems } = useWishlist();
  const navigate = useNavigate();

  // Transparent → opaque transition on hero page; reset scrolled when leaving
  useEffect(() => {
    if (!isHeroPage) return;
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      setScrolled(false);
    };
  }, [isHeroPage]);

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

  // Close search panel on outside click
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [searchOpen]);

  const closeSearch = () => { setSearchOpen(false); setSearchQuery(''); };

  // Close user dropdown on outside click
  useEffect(() => {
    if (!userMenu) return;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenu]);

  const handleLogout = async () => {
    setUserMenu(false);
    navigate('/');
    await logout();
  };

  const iconClass = fixedNav
    ? 'text-forest hover:text-gold transition-colors duration-200'
    : 'text-white/90 hover:text-gold transition-colors duration-200';

  return (
    <header className={
      isHeroPage
        ? 'absolute left-0 top-0 w-full z-101'
        : 'sticky top-0 z-101 bg-cream/97 shadow-[0_2px_12px_rgba(0,0,0,0.08)]'
    }>
      {/* Promo bar */}
      {promo && (
        <div className="bg-brand-green px-4 py-3 text-center relative">
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
        ref={headerRef}
        className={[
          'flex flex-col transition-all duration-300',
          isHeroPage && fixedNav
            ? 'fixed top-0 w-full bg-cream/97 shadow-[0_2px_12px_rgba(0,0,0,0.08)]'
            : 'relative',
        ].join(' ')}
      >
        {/* Brand bar */}
        <div className="flex items-center justify-between px-4 md:px-7.5 xl:px-15 py-3 md:py-6 relative">
          {/* Left — search (hidden on mobile) */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => { setSearchOpen((o) => !o); setSearchQuery(''); }}
              className={`cursor-pointer ${iconClass}`}
              aria-label="Search"
            >
              {searchOpen ? <X size={19} /> : <Search size={19} />}
            </button>
          </div>

          {/* Center — logo */}
          <Link
            to="/"
            className="md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center"
            aria-label="Golden Perfume"
          >
            <img
              src="/logo.png"
              alt="Golden Perfume"
              className={`w-auto object-contain transition-all duration-300 ${
                fixedNav
                  ? 'h-14 md:h-16'
                  : 'h-14 md:h-16'
              }`}
            />
          </Link>

          {/* Right — icons */}
          <ul className="flex items-center gap-2 md:gap-7.5 ml-auto md:ml-0">
            {/* Search — mobile only */}
            <li className="md:hidden">
              <button
                onClick={() => { setSearchOpen((o) => !o); setSearchQuery(''); }}
                className={`cursor-pointer ${iconClass}`}
                aria-label="Search"
              >
                {searchOpen ? <X size={19} /> : <Search size={19} />}
              </button>
            </li>
            {/* User — guest shows login link; logged-in shows avatar dropdown */}
            <li className="relative" ref={userMenuRef}>
              {user ? (
                <>
                  <button
                    onClick={() => setUserMenu(!userMenu)}
                    className={`flex items-center gap-1.5 cursor-pointer ${iconClass}`}
                    aria-label="Account menu"
                  >
                    <span className="w-7 h-7 rounded-full bg-gold flex items-center justify-center font-lato font-bold text-[12px] text-dark-green">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden lg:block font-lato text-[13px] max-w-24 truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={13} className={`hidden lg:block transition-transform duration-200 ${userMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenu && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] py-2 z-200">
                      <div className="px-4 py-3 border-b border-[#f5f5f5]">
                        <p className="font-lato font-bold text-[13px] text-[#222] truncate">{user.name}</p>
                        <p className="font-lato text-[11px] text-[#999] truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gold/10 text-gold font-lato font-bold text-[10px] uppercase tracking-[1px] rounded">
                          {role}
                        </span>
                      </div>
                      <Link
                        to={roleRedirect?.[role] ?? '/profile'}
                        onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 font-lato text-[13px] text-[#444] hover:text-gold hover:bg-[#faf9ff] transition-colors duration-150"
                      >
                        <User size={14} />
                        My Account
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 font-lato text-[13px] text-[#444] hover:text-red-500 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                      >
                        <LogOut size={14} />
                        Log Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login" className={iconClass} aria-label="Log in">
                  <User size={19} />
                </Link>
              )}
            </li>
            <li className="relative">
              <Link to="/wishlist" className={`relative ${iconClass}`} aria-label="Wishlist">
                <Heart size={19} />
                {wishItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center bg-gold font-lato font-bold text-[9px] text-dark-green">
                    {wishItems.length > 9 ? '9+' : wishItems.length}
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link to="/cart" className={`relative ${iconClass}`} aria-label="Cart">
                <ShoppingCart size={19} />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center bg-gold font-lato font-bold text-[9px] text-dark-green">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
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

        {/* Inline search panel */}
        {searchOpen && (
          <SearchPanel
            query={searchQuery}
            onChange={setSearchQuery}
            onClose={closeSearch}
          />
        )}

        {/* Nav panel — mobile slide-in */}
        <div
          ref={menuRef}
          className={[
            'md:hidden fixed top-0 right-0 h-full w-75 bg-white z-101 flex flex-col transition-transform duration-300 ease-in-out shadow-[-4px_0_24px_rgba(0,0,0,0.12)]',
            openMenu ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
        >
          {/* Sidebar header */}
          <div className="flex items-center px-5 py-4 border-b border-[#f0f0f0] shrink-0">
            <Link to="/" onClick={() => setOpenMenu(false)} aria-label="Home">
              <img src="/logo.png" alt="Golden Perfume" className="h-11 w-auto" />
            </Link>
          </div>

          {/* Scrollable nav */}
          <div className="flex-1 overflow-y-auto">
            <Nav navItem={navItem} isFixed={true} isMobile={true} onClose={() => setOpenMenu(false)} />
          </div>

          {/* Sidebar footer */}
          <div className="px-5 py-4 border-t border-[#f0f0f0] shrink-0">
            <Link
              to="/shop"
              onClick={() => setOpenMenu(false)}
              className="flex items-center justify-center h-11 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[2px] rounded-[3px] hover:bg-forest transition-colors"
            >
              Shop All Products
            </Link>
          </div>
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
