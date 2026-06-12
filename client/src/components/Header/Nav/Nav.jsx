import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

// Desktop Shop dropdown — single-column: Shop All + category groups with subs
const ShopDropdown = ({ cols }) => {
  if (!cols.length) return null;
  return (
    <div className="hidden md:block absolute top-full left-0 w-60 z-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-[opacity,visibility] duration-200">
      <div className="pt-5">
        <div className="bg-white border-t-[3px] border-brand-green rounded-b-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
          <Link
            to="/shop"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between px-4 py-3 font-lato font-bold text-[12px] uppercase tracking-[1.5px] text-gold hover:text-dark-green transition-colors"
          >
            Shop All <ChevronRight size={13} />
          </Link>
          <div className="border-t border-[#f0f0f0] py-2 max-h-[65vh] overflow-y-auto">
            {cols.map((col) => (
              <div key={col.path} className="mb-1">
                <Link
                  to={col.path}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center px-4 py-2 font-lato font-semibold text-[13px] text-dark-green hover:text-brand-green transition-colors"
                >
                  {col.title}
                </Link>
                {col.items?.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={(e) => e.stopPropagation()}
                    className="block pl-7 pr-4 py-1 font-lato text-[12px] text-[#777] hover:text-brand-green transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Nav = ({ navItem, isFixed, isMobile, onClose }) => {
  const location = useLocation();
  const [openId, setOpenId] = useState(null);
  const [openColId, setOpenColId] = useState(null);

  const toggle = (id) => setOpenId(openId === id ? null : id);
  const toggleCol = (id) => setOpenColId(openColId === id ? null : id);

  const linkColor =
    isFixed || isMobile
      ? "text-forest hover:text-brand-green"
      : "text-white/90 hover:text-brand-green";
  const activeColor = "text-brand-green";

  // console.log(navItem);

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
                "text-[13px] uppercase tracking-[2px] font-lato transition-colors duration-200 flex items-center gap-1 z-10 relative",
                location.pathname === nav.path ? activeColor : linkColor,
              ].join(" ")}
            >
              {nav.name}
              {(nav.megaNav || nav.subNav) && (
                <span
                  className={`text-[10px] transition-transform duration-200 inline-block ${openId === nav.id ? "rotate-180" : ""}`}
                >
                  &#8964;
                </span>
              )}
            </Link>

            {nav.megaNav && <ShopDropdown cols={nav.megaNav.columns || []} />}

            {nav.subNav && !nav.megaNav && (
              <div className="hidden md:block absolute top-full left-1/2 -translate-x-1/2 w-55 z-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-[opacity,visibility] duration-200">
                <div className="pt-5">
                  <ul className="bg-white shadow-[0_12px_32px_rgba(0,0,0,0.14)] border-t-[3px] border-brand-green rounded-b-xl py-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
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
                </div>
              </div>
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
          {nav.megaNav || nav.subNav ? (
            <button
              onClick={() => toggle(nav.id)}
              className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
            >
              <span
                className={`font-lato text-[13px] uppercase tracking-[2px] ${location.pathname === nav.path ? "text-brand-green" : "text-forest"}`}
              >
                {nav.name}
              </span>
              <ChevronDown
                size={16}
                className={`text-forest/50 transition-transform duration-200 ${openId === nav.id ? "rotate-180" : ""}`}
              />
            </button>
          ) : (
            <Link
              to={nav.path}
              onClick={onClose}
              className={`flex items-center px-5 py-4 font-lato text-[13px] uppercase tracking-[2px] ${location.pathname === nav.path ? "text-brand-green" : "text-forest hover:text-brand-green"} transition-colors`}
            >
              {nav.name}
            </Link>
          )}

          {/* Mega nav — accordion of top-level categories → sub-categories */}
          {nav.megaNav && openId === nav.id && (
            <div className="bg-[#fafaf9] border-t border-[#f0f0f0]">
              {(nav.megaNav.columns || []).map((col) => (
                <div key={col.title}>
                  {/* Category header row */}
                  {col.items?.length > 0 ? (
                    <button
                      onClick={() => toggleCol(col.title)}
                      className="w-full flex items-center justify-between px-5 py-3 cursor-pointer"
                    >
                      <span className="font-lato text-[13px] text-dark-green font-semibold">
                        {col.title}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-dark-green/40 transition-transform duration-200 ${openColId === col.title ? "rotate-180" : ""}`}
                      />
                    </button>
                  ) : (
                    <Link
                      to={col.path}
                      onClick={onClose}
                      className="flex items-center justify-between px-5 py-3 font-lato text-[13px] text-dark-green font-semibold hover:text-brand-green transition-colors"
                    >
                      {col.title}
                      <ChevronRight size={14} className="text-dark-green/30" />
                    </Link>
                  )}

                  {/* Sub-categories */}
                  {col.items?.length > 0 && openColId === col.title && (
                    <ul className="pb-1.5">
                      {col.items.map((item) => (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            onClick={onClose}
                            className="flex items-center gap-2 pl-8 pr-5 py-2 font-lato text-[13px] text-[#555] hover:text-brand-green transition-colors"
                          >
                            <span className="w-1 h-1 rounded-full bg-brand-green/40 shrink-0" />
                            {item.name}
                          </Link>
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
