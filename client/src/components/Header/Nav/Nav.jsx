import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Append the active gender to a /shop link
const withGender = (path, gender) =>
  !gender ? path : (path.includes('?') ? `${path}&gender=${gender}` : `${path}?gender=${gender}`);

// Desktop Shop mega-menu: gender rail (left) + category tree (right)
const MegaPanel = ({ megaNav }) => {
  const genders = megaNav.genders || [];
  const [gender, setGender] = useState('');   // default = All

  return (
    <div className="hidden md:block md:absolute md:top-full md:left-1/2 md:-translate-x-1/2 md:mt-5 md:w-[min(1100px,95vw)] bg-white border-t-[3px] border-brand-green rounded-b-xl shadow-[0_18px_44px_rgba(0,0,0,0.16)] z-200 md:opacity-0 md:invisible md:translate-y-1 md:group-hover:opacity-100 md:group-hover:visible md:group-hover:translate-y-0 transition-all duration-200">
      <div className="flex">
        {/* Gender rail */}
        {genders.length > 0 && (
          <div className="w-44 shrink-0 bg-cream/70 border-r border-linen rounded-bl-xl py-6 px-3">
            <p className="font-lato text-[10px] uppercase tracking-[2px] text-dark-green/40 px-3 mb-2">Shop For</p>
            {genders.map((g) => (
              <Link key={g.value || 'all'}
                to={withGender('/shop', g.value)}
                onMouseEnter={() => setGender(g.value)}
                onClick={(e) => e.stopPropagation()}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-lato text-[14px] transition-colors ${gender === g.value ? 'bg-dark-green text-linen font-bold' : 'text-forest hover:bg-white'}`}>
                {g.label}
                <ChevronRight size={14} className={gender === g.value ? 'opacity-90' : 'opacity-25'} />
              </Link>
            ))}
          </div>
        )}

        {/* Categories + featured */}
        <div className="flex flex-1 gap-6 px-8 py-7 min-w-0">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 flex-1 max-h-[70vh] overflow-y-auto pr-1">
            {megaNav.columns.map((col) => (
              <div key={col.title} className="min-w-0">
                <Link to={withGender(col.path, gender)}
                  className="flex items-center gap-1.5 font-playfair text-[13px] font-semibold text-forest hover:text-brand-green uppercase tracking-[0.5px] mb-2.5 pb-2 border-b border-linen leading-snug"
                  onClick={(e) => e.stopPropagation()}>
                  {col.emoji && <span className="text-base">{col.emoji}</span>}
                  {col.title}
                </Link>
                {col.items?.length > 0 && (
                  <ul className="flex flex-col gap-0.5">
                    {col.items.map((item) => (
                      <li key={item.path}>
                        <Link to={withGender(item.path, gender)}
                          className="flex items-center justify-between py-0.75 font-lato text-[13px] text-[#555] hover:text-brand-green transition-colors duration-150"
                          onClick={(e) => e.stopPropagation()}>
                          {item.name}
                          {item.badge && (
                            <span className="bg-gold text-dark-green text-[9px] font-bold uppercase tracking-[0.5px] px-1.5 py-0.5 rounded-[3px] ml-1 shrink-0">{item.badge}</span>
                          )}
                        </Link>
                        {item.children?.length > 0 && (
                          <ul className="ml-3 mt-0.5 mb-1 border-l border-linen pl-3 flex flex-col gap-0.5">
                            {item.children.map((sub) => (
                              <li key={sub.path}>
                                <Link to={withGender(sub.path, gender)}
                                  className="block py-0.5 font-lato text-[12px] text-[#888] hover:text-brand-green transition-colors duration-150"
                                  onClick={(e) => e.stopPropagation()}>
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {megaNav.featured && (
            <div className="hidden lg:flex w-55 min-h-70 bg-cover bg-center rounded-lg relative overflow-hidden shrink-0 flex-col justify-end self-start"
              style={{ backgroundImage: `url('${megaNav.featured.image}')` }}>
              <div className="absolute inset-0 bg-linear-to-b from-[rgba(20,38,28,0.55)] to-[rgba(42,61,49,0.75)]" />
              <div className="relative z-10 p-5 flex flex-col justify-end h-full">
                <span className="font-lato text-[10px] uppercase tracking-[2px] text-gold block mb-2">{megaNav.featured.label}</span>
                <p className="font-playfair text-[18px] leading-snug text-white mb-4 whitespace-pre-line">{megaNav.featured.title}</p>
                <Link to={megaNav.featured.path}
                  className="inline-block bg-gold text-dark-green font-lato text-[11px] font-bold uppercase tracking-[1.5px] px-4 py-2 rounded-[3px] hover:bg-[#c49843] transition-colors duration-150"
                  onClick={(e) => e.stopPropagation()}>
                  {megaNav.featured.cta}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Nav = ({ navItem, isFixed, isMobile, onClose }) => {
  const location = useLocation();
  const [openId, setOpenId]     = useState(null);
  const [openColId, setOpenColId] = useState(null);

  const toggle    = (id) => setOpenId(openId === id ? null : id);
  const toggleCol = (id) => setOpenColId(openColId === id ? null : id);

  const linkColor   = isFixed || isMobile ? 'text-forest hover:text-brand-green' : 'text-white/90 hover:text-brand-green';
  const activeColor = 'text-brand-green';

  // ── Desktop ───────────────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <ul className="flex flex-row justify-center w-full">
        {navItem.map((nav) => (
          <li
            key={nav.id}
            className="relative group mb-0 md:mx-7.5 xl:mx-7.5"
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

            {(nav.megaNav || nav.subNav) && (
              <span className="hidden md:block absolute left-0 top-0 w-full h-15 z-1" />
            )}

            {nav.megaNav && <MegaPanel megaNav={nav.megaNav} />}

            {nav.subNav && !nav.megaNav && (
              <ul className="hidden md:block md:absolute md:top-full md:mt-5 md:left-1/2 md:-translate-x-1/2 md:w-55 bg-white md:shadow-[0_12px_32px_rgba(0,0,0,0.14)] border-t-[3px] border-brand-green rounded-b-xl z-200 py-0 md:py-3 md:opacity-0 md:invisible md:translate-y-1 md:group-hover:opacity-100 md:group-hover:visible md:group-hover:translate-y-0 transition-all duration-200">
                {nav.subNav.map((sub) => (
                  <li key={sub.path} className="m-0 p-0">
                    <Link
                      to={sub.path}
                      className="block px-6 py-2 font-lato text-[13px] text-forest hover:bg-cream hover:text-brand-green transition-colors duration-150 normal-case"
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
  }

  // ── Mobile ────────────────────────────────────────────────────────────────
  return (
    <ul className="flex flex-col">
      {navItem.map((nav) => (
        <li key={nav.id} className="border-b border-[#f0f0f0]">
          {/* Top-level row */}
          {nav.megaNav || nav.subNav ? (
            <button
              onClick={() => toggle(nav.id)}
              className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
            >
              <span className={`font-lato text-[13px] uppercase tracking-[2px] ${location.pathname === nav.path ? 'text-brand-green' : 'text-forest'}`}>
                {nav.name}
              </span>
              <ChevronDown
                size={16}
                className={`text-forest/50 transition-transform duration-200 ${openId === nav.id ? 'rotate-180' : ''}`}
              />
            </button>
          ) : (
            <Link
              to={nav.path}
              onClick={onClose}
              className={`flex items-center px-5 py-4 font-lato text-[13px] uppercase tracking-[2px] ${location.pathname === nav.path ? 'text-brand-green' : 'text-forest hover:text-brand-green'} transition-colors`}
            >
              {nav.name}
            </Link>
          )}

          {/* Mega nav — accordion of columns */}
          {nav.megaNav && openId === nav.id && (
            <div className="bg-[#fafaf9] border-t border-[#f0f0f0]">
              {/* Gender quick-links */}
              {nav.megaNav.genders?.length > 0 && (
                <div className="flex gap-2 px-5 py-3 border-b border-[#f0f0f0]">
                  {nav.megaNav.genders.map((g) => (
                    <Link key={g.value || 'all'} to={withGender('/shop', g.value)} onClick={onClose}
                      className="px-3 h-8 inline-flex items-center rounded-full border border-linen font-lato text-[12px] text-forest hover:border-brand-green hover:text-brand-green transition-colors">
                      {g.label}
                    </Link>
                  ))}
                </div>
              )}
              {nav.megaNav.columns.map((col) => (
                <div key={col.title}>
                  {/* Column header — toggles its own items */}
                  <button
                    onClick={() => toggleCol(col.title)}
                    className="w-full flex items-center justify-between px-5 py-3 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{col.emoji}</span>
                      <span className="font-lato text-[11px] uppercase tracking-[1.5px] text-dark-green/60 font-bold">
                        {col.title}
                      </span>
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-dark-green/30 transition-transform duration-200 ${openColId === col.title ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Column items */}
                  {openColId === col.title && (
                    <ul className="pb-2">
                      {col.items.map((item) => (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            onClick={onClose}
                            className="flex items-center justify-between pl-10 pr-5 py-2.5 font-lato text-[13px] text-[#555] hover:text-brand-green transition-colors"
                          >
                            {item.name}
                            {item.badge && (
                              <span className="bg-gold text-dark-green text-[9px] font-bold uppercase tracking-[0.5px] px-1.5 py-0.5 rounded-[3px] shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                          {/* Sub-sub categories */}
                          {item.children?.length > 0 && (
                            <ul>
                              {item.children.map((sub) => (
                                <li key={sub.path}>
                                  <Link to={sub.path} onClick={onClose}
                                    className="block pl-16 pr-5 py-2 font-lato text-[12px] text-[#888] hover:text-brand-green transition-colors">
                                    {sub.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Regular sub-nav */}
          {nav.subNav && !nav.megaNav && openId === nav.id && (
            <ul className="bg-[#fafaf9] border-t border-[#f0f0f0] pb-2">
              {nav.subNav.map((sub) => (
                <li key={sub.path}>
                  <Link
                    to={sub.path}
                    onClick={onClose}
                    className="block pl-8 pr-5 py-2.5 font-lato text-[13px] text-[#555] hover:text-brand-green transition-colors"
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
