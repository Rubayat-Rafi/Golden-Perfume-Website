import { MapPin, Smartphone, Mail } from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { FaSquareXTwitter, FaLinkedin } from "react-icons/fa6";
import { AiFillInstagram } from "react-icons/ai";
import { Link } from "react-router-dom";
import { NavCol } from "./NavCol/NavCol";
import footerNavData from "../../data/footer/footerNav.json";
import paymentMethodData from "../../data/footer/payment.json";
import socialData from "../../data/social/index.json";

const socialIcons = {
  Facebook: FaFacebook,
  Twitter: FaSquareXTwitter,
  Instagram: AiFillInstagram,
  LinkedIn: FaLinkedin,
};

const Footer = () => {
  return (
    <footer className="bg-dark-green pb-4 z-[1]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 xl:px-15">
        {/* Footer top */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start py-10 md:py-[60px] gap-6 border-b border-white/10">
          {/* Social */}
          <div className="order-2 sm:order-1 text-center sm:text-left">
            <span className="font-lato text-sage text-base leading-[170%] block mb-2">
              Find us here:
            </span>
            <ul className="flex gap-2 justify-center sm:justify-start">
              {socialData.map((social, idx) => {
                const Icon = socialIcons[social.name];
                return (
                  <li key={idx}>
                    <a
                      href={social.path}
                      className="w-[35px] h-[35px] flex justify-center items-center bg-white/10 text-sage hover:text-gold transition-colors duration-200"
                      aria-label={social.name}
                    >
                      {Icon && <Icon size={16} />}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Logo */}
          <div className="order-1 sm:order-2 mt-0 sm:mt-2.5 sm:ml-20 md:ml-0">
            <Link to="/">
              <img
                src="/assets/img/footer-logo.svg"
                alt="Golden Perfume"
                className="h-[61px] w-auto"
              />
            </Link>
          </div>

          {/* Payment methods */}
          <div className="order-3 text-center sm:text-left sm:pr-4">
            <span className="font-lato text-sage text-base leading-[170%] block mb-3">
              Payment methods:
            </span>
            <ul className="flex flex-wrap gap-[11.5px] justify-center sm:justify-start">
              {paymentMethodData.map((payment, idx) => (
                <li key={idx}>
                  <img
                    src={payment.icon}
                    alt={payment.alt}
                    className="h-7 w-auto"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer nav */}
        <div className="flex flex-wrap justify-between py-10 md:py-[60px] border-b border-white/10">
          {footerNavData.map((nav, idx) => (
            <NavCol nav={nav} key={idx} />
          ))}

          {/* Contact column */}
          <div className="w-[45%] sm:w-1/4 max-w-[215px] mb-6 md:mb-0 md:mr-[50px]">
            <span className="block font-playfair text-2xl leading-none text-linen capitalize mb-6">
              Contact
            </span>
            <ul>
              <li className="flex text-sage leading-[170%] mb-[19px]">
                <MapPin size={21} className="shrink-0 mr-[15px] mt-1" />
                <span className="font-lato text-base">
                  916 Canal Street, New Orleans LA 70112, USA
                </span>
              </li>
              <li className="flex text-sage leading-[170%] mb-[19px]">
                <Smartphone size={21} className="shrink-0 mr-[15px] mt-1" />
                <div>
                  <a
                    href="tel:+15045292069"
                    className="block font-lato text-white text-xl md:text-base leading-normal mb-2 hover:opacity-80 transition-opacity duration-200"
                  >
                    +1 (504) 529-2069
                  </a>
                </div>
              </li>
              <li className="flex text-sage leading-[170%]">
                <Mail size={21} className="shrink-0 mr-[15px] mt-1" />
                <a
                  href="mailto:info@goldenfragrances.com"
                  className="font-lato text-sage text-base hover:text-gold transition-colors duration-200"
                >
                  info@goldenfragrances.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-5 pb-1 font-lato text-sm text-mid-green leading-[170%] text-center">
          &copy; 2026 Golden Perfume. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
