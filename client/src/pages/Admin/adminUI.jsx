// Shared admin UI helpers

export const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';

// Status pill colours
const STATUS_STYLES = {
  // fulfillment
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  // payment
  paid:       'bg-green-100 text-green-700',
  refunded:   'bg-red-100 text-red-700',
  // applications
  approved:   'bg-green-100 text-green-700',
  rejected:   'bg-red-100 text-red-700',
};

export const StatusBadge = ({ status }) => (
  <span className={`inline-block px-2.5 py-1 rounded-full font-lato font-bold text-[11px] uppercase tracking-[0.5px] ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
    {status}
  </span>
);

export const ChannelBadge = ({ type }) => (
  <span className={`inline-block px-2 py-0.5 rounded font-lato font-bold text-[10px] uppercase tracking-[0.5px] ${type === 'b2b' ? 'bg-brand-green/15 text-brand-green' : 'bg-gold/20 text-[#9a7a25]'}`}>
    {type}
  </span>
);

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
    <div>
      <h1 className="font-playfair text-[26px] md:text-[30px] text-dark-green leading-tight">{title}</h1>
      {subtitle && <p className="font-lato text-[13px] text-[#888] mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-[#ececec] ${className}`}>{children}</div>
);

export const Spinner = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-9 h-9 border-4 border-brand-green/25 border-t-brand-green rounded-full animate-spin" />
  </div>
);

export const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    {Icon && (
      <div className="w-14 h-14 rounded-full bg-[#f0f0f0] flex items-center justify-center mb-4">
        <Icon size={24} className="text-[#bbb]" />
      </div>
    )}
    <h3 className="font-playfair text-[19px] text-dark-green mb-1">{title}</h3>
    {subtitle && <p className="font-lato text-[13px] text-[#999]">{subtitle}</p>}
  </div>
);
