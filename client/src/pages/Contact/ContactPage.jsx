import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';

const inputCls = 'w-full h-12 px-4 bg-white border border-[#e0e0e0] rounded-lg font-lato text-[14px] text-dark-green placeholder:text-dark-green/30 outline-none focus:border-brand-green/60 focus:ring-2 focus:ring-brand-green/10 transition-all duration-200';
const labelCls = 'block font-lato text-[11px] uppercase tracking-[1.5px] text-dark-green/60 mb-2';

const INFO = [
  {
    icon: MapPin,
    title: 'Visit Us',
    lines: ['916 Canal Street', 'New Orleans, LA 70112', 'USA'],
  },
  {
    icon: Phone,
    title: 'Call Us',
    lines: ['+1 (504) 529-2069'],
    href: 'tel:+15045292069',
  },
  {
    icon: Mail,
    title: 'Email Us',
    lines: ['info@goldenfragrances.com'],
    href: 'mailto:info@goldenfragrances.com',
  },
  {
    icon: Clock,
    title: 'Business Hours',
    lines: ['Mon – Fri: 9 am – 6 pm', 'Sat: 10 am – 4 pm', 'Sun: Closed'],
  },
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name    = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.message.trim()) errs.message = 'Message is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await api.post('/contact', form);
      setSent(true);
    } catch (err) {
      setErrors({ message: err.message || 'Failed to send. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen">

      {/* ── Hero ── */}
      <div className="bg-dark-green py-14 md:py-20 text-center">
        <span className="font-lato text-brand-green text-[11px] uppercase tracking-[4px] block mb-3">
          Get In Touch
        </span>
        <h1 className="font-playfair font-normal text-[28px] md:text-[42px] text-white mb-4">
          Contact Us
        </h1>
        <p className="font-lato text-[14px] md:text-[15px] text-white/55 max-w-lg mx-auto leading-relaxed px-4">
          Have a question about our products, wholesale accounts, or an order?
          We'd love to hear from you.
        </p>
      </div>

      {/* ── Info cards ── */}
      <div className="max-w-305 mx-auto px-4 md:px-10 -mt-8 mb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {INFO.map(({ icon: Icon, title, lines, href }) => (
            <div key={title} className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.07)] p-5 md:p-6 flex flex-col items-center text-center">
              <div className="w-11 h-11 rounded-full bg-brand-green/10 flex items-center justify-center mb-4">
                <Icon size={20} className="text-brand-green" />
              </div>
              <h3 className="font-playfair text-[15px] text-dark-green mb-2">{title}</h3>
              {lines.map((line, i) =>
                href && i === 0 ? (
                  <a key={i} href={href} className="font-lato text-[13px] text-dark-green/60 hover:text-brand-green transition-colors leading-relaxed break-all">
                    {line}
                  </a>
                ) : (
                  <span key={i} className="font-lato text-[13px] text-dark-green/55 leading-relaxed">{line}</span>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Form + Map ── */}
      <div className="max-w-305 mx-auto px-4 md:px-10 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] px-7 py-9 md:px-10 md:py-11">

            {sent ? (
              <div className="flex flex-col items-center justify-center h-full min-h-80 text-center">
                <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center mb-5">
                  <CheckCircle size={30} className="text-brand-green" />
                </div>
                <h3 className="font-playfair text-[24px] text-dark-green mb-3">Message Sent!</h3>
                <p className="font-lato text-[14px] text-dark-green/55 leading-relaxed max-w-xs">
                  Thank you for reaching out. We'll get back to you within 1–2 business days.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-8 font-lato text-[12px] uppercase tracking-[1.5px] text-brand-green hover:text-dark-green transition-colors border-b border-brand-green/40 pb-0.5 cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-playfair font-normal text-[24px] md:text-[28px] text-dark-green mb-1.5">
                  Send a Message
                </h2>
                <p className="font-lato text-[13px] text-dark-green/50 mb-8">
                  Fill in the form and we'll respond as soon as possible.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelCls}>Your Name *</label>
                      <input type="text" value={form.name} onChange={set('name')} placeholder="Full name" className={inputCls} />
                      {errors.name && <p className="font-lato text-[12px] text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Email Address *</label>
                      <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" className={inputCls} />
                      {errors.email && <p className="font-lato text-[12px] text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className={labelCls}>Subject</label>
                    <input type="text" value={form.subject} onChange={set('subject')} placeholder="What's this about?" className={inputCls} />
                  </div>

                  <div className="mb-7">
                    <label className={labelCls}>Message *</label>
                    <textarea
                      value={form.message}
                      onChange={set('message')}
                      placeholder="Tell us how we can help…"
                      rows={5}
                      className="w-full px-4 py-3 bg-white border border-[#e0e0e0] rounded-lg font-lato text-[14px] text-dark-green placeholder:text-dark-green/30 outline-none focus:border-brand-green/60 focus:ring-2 focus:ring-brand-green/10 transition-all duration-200 resize-none"
                    />
                    {errors.message && <p className="font-lato text-[12px] text-red-500 mt-1">{errors.message}</p>}
                  </div>

                  {errors.message && (
                    <p className="font-lato text-[12px] text-red-500 mb-4">{errors.message}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2.5 w-full h-12 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:bg-forest transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send size={15} />
                    {submitting ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)] min-h-80 lg:min-h-0 flex flex-col">
            <iframe
              title="Golden Perfume Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.789!2d-90.0715!3d29.9511!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8620a67b7b8a0001%3A0x0!2s916+Canal+St%2C+New+Orleans%2C+LA+70112!5e0!3m2!1sen!2sus!4v1"
              width="100%"
              height="100%"
              className="flex-1 min-h-80 border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;