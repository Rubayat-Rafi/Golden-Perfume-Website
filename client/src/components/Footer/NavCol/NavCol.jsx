import { Link } from 'react-router-dom';

export const NavCol = ({ nav }) => {
  return (
    <div className="w-[45%] sm:w-1/4 max-w-[215px] mb-6 md:mb-0">
      <span className="block font-playfair text-2xl md:text-[24px] leading-none text-linen capitalize mb-6">
        {nav.title}
      </span>
      <ul>
        {nav.navLinks?.map((link, idx) => (
          <li key={link.name + idx} className="mb-2 last:mb-0">
            <Link
              to={link.path}
              className="relative pl-[15px] font-lato text-sage text-base leading-[170%] hover:text-gold transition-colors duration-200
                before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:content-['›'] before:text-[#bbb] before:text-[11px] before:leading-none"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
