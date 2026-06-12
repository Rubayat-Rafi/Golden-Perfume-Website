import { Star, Quote } from 'lucide-react';
import SectionTitle from '../shared/SectionTitle/SectionTitle';

const REVIEWS = [
  { name: 'Marcus D.',  role: 'Boutique Owner',  rating: 5, text: 'The fragrance oils smell exactly like the originals at a fraction of the cost. My customers keep coming back for more.' },
  { name: 'Amara O.',   role: 'Retail Customer', rating: 5, text: 'This is my new signature scent. Long-lasting, beautifully blended, and I get compliments everywhere I go.' },
  { name: 'Grace O.',   role: 'Salon Owner',     rating: 5, text: 'The African black soap is the real deal — cleared my skin in two weeks. Wholesale ordering has been seamless.' },
];

const Testimonials = () => (
  <section className="py-7 md:py-12 bg-cream">
    <div className="max-w-305 mx-auto px-4 md:px-10">
      <SectionTitle
        subTitle="Loved by Many"
        title="What Our Customers Say"
        body="Retailers, salons, and everyday customers trust Golden Perfume for quality they can feel."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
        {REVIEWS.map((r) => (
          <div key={r.name} className="relative bg-white rounded-2xl border border-linen p-7 shadow-[0_2px_16px_rgba(20,40,25,0.05)]">
            <Quote size={34} className="text-brand-green/15 absolute top-5 right-5" />
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} size={15} className="text-gold fill-gold" />
              ))}
            </div>
            <p className="font-lato text-[14px] text-dark-green/80 leading-relaxed mb-6">“{r.text}”</p>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-dark-green text-linen flex items-center justify-center font-playfair font-bold text-[15px]">
                {r.name.charAt(0)}
              </span>
              <div>
                <p className="font-lato font-bold text-[13px] text-dark-green leading-tight">{r.name}</p>
                <p className="font-lato text-[11px] text-forest/60">{r.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
