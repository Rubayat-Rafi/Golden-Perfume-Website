import { Truck, Leaf, ShieldCheck, Briefcase } from 'lucide-react';

const FEATURES = [
  { icon: Truck,       title: 'Free Shipping',     sub: 'On all orders over $50' },
  { icon: Leaf,        title: '100% Natural',      sub: 'Hand-blended botanicals' },
  { icon: ShieldCheck, title: 'Secure Checkout',   sub: 'Safe & encrypted payment' },
  { icon: Briefcase,   title: 'Wholesale Ready',   sub: 'Bulk pricing for business' },
];

const FeatureStrip = () => (
  <section className="bg-white border-y border-linen">
    <div className="max-w-305 mx-auto px-4 md:px-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-linen">
        {FEATURES.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-3.5 px-4 sm:px-6 py-6 md:py-7">
            <span className="shrink-0 w-11 h-11 rounded-full bg-brand-green/10 flex items-center justify-center">
              <Icon size={20} className="text-brand-green" />
            </span>
            <div className="min-w-0">
              <p className="font-playfair text-[14px] md:text-[15px] text-dark-green leading-tight">{title}</p>
              <p className="font-lato text-[11px] md:text-[12px] text-forest/60 mt-0.5 leading-tight">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeatureStrip;
