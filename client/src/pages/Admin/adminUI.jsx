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

// ── Skeleton loaders ───────────────────────────────────────────────────────────

// Base shimmer block — compose with width/height/shape classes
export const Skeleton = ({ className = '' }) => (
  <div className={`bg-[#e9ebec] rounded animate-pulse ${className}`} />
);

// Matches the Card-wrapped tables used across every admin list page
export const TableSkeleton = ({ rows = 8, cols = 5 }) => (
  <Card className="overflow-hidden">
    {/* Header row */}
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-[#f0f0f0]">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={`h-2.5 ${i === 0 ? 'w-28' : 'flex-1 max-w-20'}`} />
      ))}
    </div>
    {/* Body rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex items-center gap-4 px-5 py-4 border-b border-[#f5f5f5] last:border-0">
        {Array.from({ length: cols }).map((_, c) =>
          c === 0 ? (
            <div key={c} className="flex items-center gap-3 w-28">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-2/3" />
              </div>
            </div>
          ) : (
            <Skeleton key={c} className="h-3 flex-1 max-w-20" />
          )
        )}
      </div>
    ))}
  </Card>
);

// Stacked content cards (e.g. reviews list)
export const CardListSkeleton = ({ rows = 4 }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: rows }).map((_, i) => (
      <Card key={i} className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </Card>
    ))}
  </div>
);

// Dashboard — KPI grid + content blocks
export const DashboardSkeleton = () => (
  <div>
    <div className="mb-6">
      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-3 w-64" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 7 }).map((_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="w-10 h-10 rounded-lg mb-3" />
          <Skeleton className="h-6 w-20 mb-2" />
          <Skeleton className="h-2.5 w-24" />
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-5">
        <Skeleton className="h-4 w-40 mb-5" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-[#f5f5f5] last:border-0">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 flex-1 max-w-32" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </Card>
      <Card className="p-5">
        <Skeleton className="h-4 w-40 mb-5" />
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-2 w-full mb-5 rounded-full" />
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-2 w-full mb-6 rounded-full" />
        <Skeleton className="h-6 w-28 mt-6" />
      </Card>
    </div>
  </div>
);

// Edit/create forms (product, category)
export const FormSkeleton = () => (
  <div className="max-w-3xl">
    <Skeleton className="h-7 w-56 mb-6" />
    <Card className="p-6 mb-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="mb-5 last:mb-0">
          <Skeleton className="h-2.5 w-24 mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </Card>
    <Card className="p-6">
      <Skeleton className="h-4 w-40 mb-5" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </Card>
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
