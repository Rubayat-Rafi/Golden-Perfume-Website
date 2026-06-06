import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import SectionTitle from '../shared/SectionTitle/SectionTitle';

const faqs = [
  {
    q: 'What types of products do you carry?',
    a: 'We carry a wide range of natural fragrance products including fragrance & body oils, essential oils, incense, soaps, skin care & hair products, herbs & smudges, aroma lamps, and more — all crafted from high-quality natural ingredients.',
  },
  {
    q: 'Do you offer wholesale pricing?',
    a: 'Yes! We offer competitive wholesale pricing for business owners. Minimum orders start at 1 oz and scale up to full wholesale quantities. Apply for a wholesale account through our Wholesale Portal and our team will review your application within 2 business days.',
  },
  {
    q: 'Are your products all-natural?',
    a: 'We are committed to using the finest natural ingredients in our hand-blended products. Our fragrance oils, essential oils, and botanical perfumes are crafted in small batches to ensure quality and authenticity.',
  },
  {
    q: 'What is your shipping policy?',
    a: 'We offer free shipping on all orders over $50. Orders are typically processed within 1–2 business days and shipped via standard carriers. Expedited shipping options are available at checkout.',
  },
  {
    q: 'Can I return or exchange a product?',
    a: 'We accept returns on unused, unopened products within 30 days of purchase. If you received a damaged or incorrect item, please contact us at info@goldenfragrances.com and we\'ll make it right promptly.',
  },
  {
    q: 'How do I use fragrance oils?',
    a: 'Our fragrance oils can be used in a variety of ways — as personal body oils (diluted with a carrier oil), in aroma lamps or diffusers, for candle or soap making, and as home fragrances. Each product listing includes specific usage guidance.',
  },
];

const FAQItem = ({ item, isOpen, onToggle }) => (
  <div className="border-b border-linen last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer group"
    >
      <span className={`font-playfair text-[16px] md:text-[18px] leading-snug transition-colors duration-200 ${isOpen ? 'text-brand-green' : 'text-dark-green group-hover:text-brand-green'}`}>
        {item.q}
      </span>
      <span className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-200 ${isOpen ? 'bg-brand-green border-brand-green text-white' : 'border-[#ddd] text-dark-green/40 group-hover:border-brand-green group-hover:text-brand-green'}`}>
        {isOpen ? <Minus size={13} /> : <Plus size={13} />}
      </span>
    </button>

    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
      <p className="font-lato text-[14px] md:text-[15px] text-dark-green/65 leading-relaxed pr-10">
        {item.a}
      </p>
    </div>
  </div>
);

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (idx) => setOpenIdx(openIdx === idx ? null : idx);

  return (
    <section className="py-12 md:py-20 bg-cream">
      <div className="max-w-305 mx-auto px-4 md:px-10">
        <SectionTitle
          subTitle="Got Questions?"
          title="Frequently Asked Questions"
          body="Everything you need to know about our products, wholesale accounts, and shipping."
        />

        <div className="max-w-3xl mx-auto mt-10 bg-white/50 border border-linen rounded-2xl shadow-[0_4px_24px_rgba(20,40,25,0.06)] px-6 md:px-10 divide-y-0">
          {faqs.map((item, idx) => (
            <FAQItem
              key={idx}
              item={item}
              isOpen={openIdx === idx}
              onToggle={() => toggle(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;