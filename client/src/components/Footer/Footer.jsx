import { useState } from "react";
import { MapPin, Smartphone, Mail } from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { FaSquareXTwitter, FaLinkedin } from "react-icons/fa6";
import { AiFillInstagram } from "react-icons/ai";
import { Link } from "react-router-dom";
import { NavCol } from "./NavCol/NavCol";
import footerNavData from "../../data/footer/footerNav.json";
import paymentMethodData from "../../data/footer/payment.json";
import socialData from "../../data/social/index.json";
import { toast } from "sonner";
import { api } from "../../lib/api";

const socialIcons = {
  Facebook: FaFacebook,
  Twitter: FaSquareXTwitter,
  Instagram: AiFillInstagram,
  LinkedIn: FaLinkedin,
};

const NewsletterForm = () => {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/\S+@\S+\.\S+/.test(trimmed)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/newsletter', { email: trimmed });
      toast.success(res.message || 'Thank you for subscribing!');
      setEmail('');
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-3 mt-5 max-w-md">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="flex-1 h-11 px-4 bg-white/8 border border-white/15 rounded-sm font-lato text-[13px] text-linen placeholder:text-sage/50 outline-none focus:border-gold/50 transition-colors duration-200"
      />
      <button
        type="submit"
        disabled={loading}
        className="h-11 px-6 bg-gold text-dark-green font-lato font-bold text-[11px] uppercase tracking-[1.5px] rounded-sm hover:bg-gold/90 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
      >
        {loading ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  );
};

const Footer = () => {
  return (
    <footer className="bg-dark-green pb-4 z-1">
      <div className="max-w-7xl mx-auto px-4 md:px-8 xl:px-15">
        {/* Footer top */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start py-10 md:py-15 gap-6 border-b border-white/10">
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
                      className="w-8.75 h-8.75 flex justify-center items-center bg-white/10 text-sage hover:text-gold transition-colors duration-200"
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
                src="/logo.png"
                alt="Golden Perfume"
                className="h-15.25 w-auto"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-10 md:py-15 border-b border-white/10">
          {footerNavData.map((nav, idx) => (
            <NavCol nav={nav} key={idx} />
          ))}

          {/* Contact column */}
          <div className="col-span-2 sm:col-span-1 min-w-0">
            <span className="block font-playfair text-2xl leading-none text-linen capitalize mb-6">
              Contact
            </span>
            <ul>
              <li className="flex text-sage leading-[170%] mb-4.75">
                <MapPin size={21} className="shrink-0 mr-3.75 mt-1" />
                <span className="font-lato text-base">
                  916 Canal Street, New Orleans LA 70112, USA
                </span>
              </li>
              <li className="flex text-sage leading-[170%] mb-4.75">
                <Smartphone size={21} className="shrink-0 mr-3.75 mt-1" />
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
                <Mail size={21} className="shrink-0 mr-3.75 mt-1" />
                <a
                  href="mailto:info@goldenfragrances.com"
                  className="font-lato text-sage text-base hover:text-gold transition-colors duration-200 break-all"
                >
                  info@goldenfragrances.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="py-10 md:py-12 border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="font-playfair text-[22px] text-linen leading-none block mb-2">
                Stay in the Know
              </span>
              <p className="font-lato text-[13px] text-sage leading-relaxed max-w-sm">
                Subscribe for new arrivals, exclusive offers, and fragrance tips — delivered straight to your inbox.
              </p>
            </div>
            <div className="md:min-w-105">
              <NewsletterForm />
            </div>
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
