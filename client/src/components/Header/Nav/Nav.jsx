import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export const Nav = ({ navItem, isFixed, isMobile }) => {
  const location = useLocation();
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId(openId === id ? null : id);

  const linkColor = isFixed || isMobile
    ? 'text-forest hover:text-gold'
    : 'text-white/90 hover:text-gold';

  const activeColor = 'text-gold';

  return (
    <ul className="flex flex-col md:flex-row md:justify-center w-full">
      {navItem.map((nav) => (
        <li
          key={nav.id}
          className="relative group mb-4 md:mb-0 md:mx-[30px] xl:mx-[30px]"
          onClick={() => (nav.megaNav || nav.subNav) && toggle(nav.id)}
        >
          <Link
            to={nav.path}
            className={[
              'text-[13px] uppercase tracking-[2px] font-lato transition-colors duration-200 flex items-center gap-1 z-10 relative',
              location.pathname === nav.path ? activeColor : linkColor,
            ].join(' ')}
          >
            {nav.name}
            {(nav.megaNav || nav.subNav) && (
              <span className={`text-[10px] transition-transform duration-200 inline-block ${openId === nav.id ? 'rotate-180' : ''}`}>
                &#8964;
              </span>
            )}
          </Link>

          {/* hover bridge so mega menu stays open */}
          {(nav.megaNav || nav.subNav) && (
            <span className="hidden md:block absolute left-0 top-0 w-full h-[60px] z-[1]" />
          )}

          {/* Mega menu */}
          {nav.megaNav && (
            <div
              className={[
                // mobile: block/hidden toggle
                'md:fixed md:left-0 md:right-0 md:w-full bg-white border-t-[3px] border-gold shadow-[0_8px_32px_rgba(0,0,0,0.14)] z-[200]',
                // desktop: opacity-based show/hide via group-hover
                'md:opacity-0 md:invisible md:group-hover:opacity-100 md:group-hover:visible transition-[opacity,visibility] duration-200',
                // mobile: show when openId matches
                openId === nav.id ? 'block' : 'hidden md:block',
              ].join(' ')}
            >
              <div className="flex flex-col md:flex-row max-w-[1280px] mx-auto px-4 md:px-10 py-3 md:py-8 gap-6">
                {/* Columns */}
                <div className="flex flex-col md:flex-row flex-1 gap-0 md:gap-2">
                  {nav.megaNav.columns.map((col) => (
                    <div
                      key={col.title}
                      className="flex-1 px-0 md:px-3 py-2 md:py-0 border-b border-linen md:border-b-0 md:border-r md:last:border-r-0"
                    >
                      <Link
                        to={col.path}
                        className="flex items-center gap-1.5 font-playfair text-[13px] font-semibold text-forest hover:text-gold uppercase tracking-[0.5px] mb-3 pb-2 border-b border-linen leading-snug"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-base">{col.emoji}</span>
                        {col.title}
                      </Link>
                      <ul className="mb-2">
                        {col.items.map((item) => (
                          <li key={item.path}>
                            <Link
                              to={item.path}
                              className="flex items-center justify-between py-[5px] font-lato text-[13px] text-[#555] hover:text-gold transition-colors duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.name}
                              {item.badge && (
                                <span className="bg-gold text-dark-green text-[9px] font-bold uppercase tracking-[0.5px] px-1.5 py-[2px] rounded-[3px] ml-1 shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        to={col.path}
                        className="inline-block font-lato text-[11px] uppercase tracking-[1px] text-gold hover:underline mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View all &rarr;
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Featured panel — hidden on mobile */}
                {nav.megaNav.featured && (
                  <div
                    className="hidden md:flex w-[220px] min-h-[280px] bg-cover bg-center rounded-lg relative overflow-hidden shrink-0 flex-col justify-end"
                    style={{ backgroundImage: `url('${nav.megaNav.featured.image}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-[rgba(20,38,28,0.55)] to-[rgba(42,61,49,0.75)]" />
                    <div className="relative z-10 p-5 flex flex-col justify-end h-full">
                      <span className="font-lato text-[10px] uppercase tracking-[2px] text-gold block mb-2">
                        {nav.megaNav.featured.label}
                      </span>
                      <p className="font-playfair text-[18px] leading-snug text-white mb-4 whitespace-pre-line">
                        {nav.megaNav.featured.title}
                      </p>
                      <Link
                        to={nav.megaNav.featured.path}
                        className="inline-block bg-gold text-dark-green font-lato text-[11px] font-bold uppercase tracking-[1.5px] px-4 py-2 rounded-[3px] hover:bg-[#c49843] transition-colors duration-150"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {nav.megaNav.featured.cta}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Regular dropdown */}
          {nav.subNav && !nav.megaNav && (
            <ul
              className={[
                'md:absolute md:top-[47px] md:left-1/2 md:-translate-x-1/2 w-full md:w-[220px] bg-white md:shadow-[0_5px_20px_rgba(0,0,0,0.12)] border-t-[3px] border-gold z-[200] py-0 md:py-[15px]',
                'md:opacity-0 md:invisible md:group-hover:opacity-100 md:group-hover:visible transition-[opacity,visibility] duration-200',
                openId === nav.id ? 'block' : 'hidden md:block',
              ].join(' ')}
            >
              {nav.subNav.map((sub) => (
                <li key={sub.path} className="m-0 p-0">
                  <Link
                    to={sub.path}
                    className="block px-6 py-2 font-lato text-[13px] text-forest hover:bg-cream hover:text-gold transition-colors duration-150 normal-case"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
};
