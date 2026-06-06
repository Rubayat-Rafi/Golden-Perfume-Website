import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, XCircle, CheckCircle, ShoppingBag, DollarSign, Truck,
  Tag, Building2, Phone, Mail, FileText, Layers, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import OrderCard, { money, fmtDate } from '../../components/OrderCard/OrderCard';

// Pricing tiers (PLAN.md §8) — `match` maps to the application's monthlyOrderRange
const TIERS = [
  { label: 'Standard',  vol: 'Any approved account',  off: 'Wholesale base price', match: ['Under $500/mo', ''] },
  { label: 'Bronze',    vol: '$500 – $999 / mo',       off: '+5% off',              match: ['$500 – $1,000/mo'] },
  { label: 'Silver',    vol: '$1,000 – $4,999 / mo',   off: '+10% off',             match: ['$1,000 – $5,000/mo'] },
  { label: 'Gold',      vol: '$5,000+ / mo',           off: '+15% off · account rep', match: ['$5,000 – $10,000/mo', 'Over $10,000/mo'] },
];

const Spinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-cream">
    <div className="w-9 h-9 border-4 border-brand-green/25 border-t-brand-green rounded-full animate-spin" />
  </div>
);

// ── Centered status shell (pending / rejected / no-application) ──
const StatusShell = ({ icon: Icon, accent, title, children }) => (
  <div className="bg-cream min-h-screen flex flex-col px-4 py-6">
    <div className="max-w-lg w-full mx-auto flex items-center justify-between">
      <Link to="/" className="inline-flex items-center gap-2 font-lato text-[13px] text-dark-green/60 hover:text-brand-green transition-colors">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      <Link to="/"><img src="/logo.png" alt="Golden Perfume" className="h-9 w-auto" /></Link>
    </div>
    <div className="flex-1 flex items-center justify-center">
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] px-8 py-12 text-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${accent}`}>
        <Icon size={36} />
      </div>
      <h1 className="font-playfair text-[28px] text-dark-green mb-4">{title}</h1>
      {children}
    </div>
    </div>
  </div>
);

const WholesaleDashboard = () => {
  const { user, role } = useAuth();
  const [app, setApp]         = useState(undefined);  // undefined = loading, null = none
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const d = await api.get('/wholesale/my-application');
        setApp(d.data);
      } catch {
        setApp(null);
      }
      if (role === 'wholesale' || role === 'admin') {
        try {
          const o = await api.get('/orders/mine?limit=50');
          setOrders(o.data || []);
        } catch { /* ignore */ }
      }
      setLoading(false);
    };
    load();
  }, [role]);

  if (loading) return <Spinner />;

  const isApproved = role === 'wholesale' || role === 'admin';

  // ── No application & not wholesale → invite to apply ──
  if (!app && !isApproved) {
    return (
      <StatusShell icon={Building2} accent="bg-brand-green/10 text-brand-green" title="Become a Wholesale Partner">
        <p className="font-lato text-[14px] text-[#999] leading-relaxed mb-8">
          Apply for a wholesale account to unlock exclusive bulk pricing on our entire catalogue of fragrances and botanicals.
        </p>
        <Link to="/wholesale-apply"
          className="inline-flex items-center justify-center h-12 px-10 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:bg-forest transition-colors">
          Apply Now
        </Link>
      </StatusShell>
    );
  }

  // ── Pending review ──
  if (app && app.status === 'pending' && !isApproved) {
    return (
      <StatusShell icon={Clock} accent="bg-amber-100 text-amber-600" title="Application Under Review">
        <p className="font-lato text-[14px] text-[#999] leading-relaxed mb-2">
          Thanks, <strong className="text-[#666]">{app.contactName}</strong>! Your application for{' '}
          <strong className="text-[#666]">{app.businessName}</strong> was submitted on{' '}
          <strong className="text-[#666]">{fmtDate(app.submittedAt)}</strong>.
        </p>
        <p className="font-lato text-[14px] text-[#999] leading-relaxed mb-8">
          Our team will review it and email you at <strong className="text-[#666]">{app.email}</strong> within <strong>2 business days</strong>.
        </p>
        <Link to="/shop"
          className="inline-flex items-center justify-center h-12 px-10 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:bg-forest transition-colors">
          Continue Shopping
        </Link>
      </StatusShell>
    );
  }

  // ── Rejected ──
  if (app && app.status === 'rejected' && !isApproved) {
    return (
      <StatusShell icon={XCircle} accent="bg-red-100 text-red-500" title="Application Not Approved">
        <p className="font-lato text-[14px] text-[#999] leading-relaxed mb-3">
          Unfortunately your wholesale application for <strong className="text-[#666]">{app.businessName}</strong> was not approved.
        </p>
        {app.adminNote && (
          <div className="bg-[#faf7f2] border border-linen rounded-lg px-4 py-3 mb-8 text-left">
            <p className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] mb-1">Reason</p>
            <p className="font-lato text-[13px] text-[#666]">{app.adminNote}</p>
          </div>
        )}
        <Link to="/wholesale-apply"
          className="inline-flex items-center justify-center h-12 px-10 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:bg-forest transition-colors">
          Re-apply
        </Link>
      </StatusShell>
    );
  }

  // ── APPROVED — full dashboard ──
  const totalSpent   = orders.reduce((s, o) => s + (o.grandTotal || 0), 0);
  const pendingShip  = orders.filter((o) => ['pending', 'processing'].includes(o.fulfillmentStatus)).length;
  const activeTierIdx = TIERS.findIndex((t) => t.match.includes(app?.monthlyOrderRange));
  const currentTier   = activeTierIdx >= 0 ? activeTierIdx : 0;

  return (
    <div className="bg-cream min-h-screen">
      {/* Header band */}
      <div className="bg-dark-green pt-6 pb-10 md:pb-14">
        <div className="max-w-305 mx-auto px-4 md:px-10">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="inline-flex items-center gap-2 font-lato text-[13px] text-white/70 hover:text-gold transition-colors">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <div className="flex items-center gap-5">
              <Link to="/profile" className="font-lato text-[13px] text-white/70 hover:text-gold transition-colors">Account Settings</Link>
              <Link to="/"><img src="/logo.png" alt="Golden Perfume" className="h-9 w-auto" /></Link>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gold flex items-center justify-center shrink-0">
              <Building2 size={26} className="text-dark-green" />
            </div>
            <div className="min-w-0">
              <span className="font-lato text-gold text-[11px] uppercase tracking-[3px] block mb-1">Wholesale Portal</span>
              <h1 className="font-playfair font-normal text-[24px] md:text-[30px] text-white leading-tight truncate">
                {app?.businessName || user?.name}
              </h1>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/15 border border-green-400/40 rounded-full font-lato font-bold text-[11px] uppercase tracking-[1px] text-green-300">
              <CheckCircle size={13} /> Approved
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-305 mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col gap-8">

        {/* Wholesale pricing active callout */}
        <div className="bg-brand-green/10 border border-brand-green/25 rounded-xl px-5 py-4 flex items-center gap-4 flex-wrap">
          <Tag size={20} className="text-brand-green shrink-0" />
          <p className="font-lato text-[14px] text-dark-green flex-1 min-w-0">
            <strong>Wholesale pricing is active.</strong> You'll see your wholesale price on every product.
          </p>
          <Link to="/shop"
            className="h-10 leading-10 px-6 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors">
            Shop Wholesale
          </Link>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: ShoppingBag, label: 'Total Orders',     value: orders.length,        accent: 'bg-blue-100 text-blue-700' },
            { icon: DollarSign,  label: 'Total Spent',       value: money(totalSpent),    accent: 'bg-green-100 text-green-700' },
            { icon: Truck,       label: 'Pending Shipments', value: pendingShip,          accent: 'bg-amber-100 text-amber-700' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[#ececec] rounded-xl p-5">
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.accent}`}><s.icon size={18} /></span>
              <p className="font-playfair text-[26px] text-dark-green leading-none mb-1">{s.value}</p>
              <p className="font-lato text-[12px] text-[#888] uppercase tracking-[1px]">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders */}
          <div className="lg:col-span-2">
            <h2 className="font-playfair text-[20px] text-dark-green mb-4">Order History</h2>
            {orders.length === 0 ? (
              <div className="bg-white border border-[#ececec] rounded-xl p-10 text-center">
                <ShoppingBag size={28} className="text-[#ccc] mx-auto mb-3" />
                <p className="font-lato text-[14px] text-[#999] mb-5">No wholesale orders yet.</p>
                <Link to="/shop" className="inline-block h-11 leading-[44px] px-8 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors">Place Your First Order</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.map((o) => <OrderCard key={o._id} order={o} />)}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Pricing tiers */}
            <div className="bg-white border border-[#ececec] rounded-xl p-5">
              <h2 className="font-playfair text-[18px] text-dark-green mb-4">Volume Pricing</h2>
              <div className="flex flex-col gap-2.5">
                {TIERS.map((t, i) => (
                  <div key={t.label}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 border ${
                      i === currentTier ? 'bg-brand-green/10 border-brand-green/40' : 'border-[#f0f0f0]'
                    }`}>
                    <div>
                      <p className={`font-lato text-[13px] ${i === currentTier ? 'font-bold text-brand-green' : 'text-dark-green'}`}>
                        {t.label}{i === currentTier && ' · You'}
                      </p>
                      <p className="font-lato text-[11px] text-[#999]">{t.vol}</p>
                    </div>
                    <span className={`font-lato text-[12px] font-bold ${i === currentTier ? 'text-brand-green' : 'text-[#888]'}`}>{t.off}</span>
                  </div>
                ))}
              </div>
              <p className="font-lato text-[11px] text-[#aaa] mt-3 leading-relaxed">
                Tiers are based on your average monthly order volume and applied automatically at checkout.
              </p>
            </div>

            {/* Account rep */}
            <div className="bg-dark-green rounded-xl p-5 text-white">
              <h2 className="font-playfair text-[18px] mb-1">Your Account Rep</h2>
              <p className="font-lato text-[12px] text-white/50 mb-4">We're here to help with bulk orders.</p>
              <a href="tel:+15045292069" className="flex items-center gap-2.5 font-lato text-[13px] text-white/85 hover:text-gold transition-colors mb-2">
                <Phone size={14} /> +1 (504) 529-2069
              </a>
              <a href="mailto:wholesale@goldenfragrances.com" className="flex items-center gap-2.5 font-lato text-[13px] text-white/85 hover:text-gold transition-colors break-all">
                <Mail size={14} /> wholesale@goldenfragrances.com
              </a>
            </div>

            {/* Coming soon tools */}
            <div className="bg-white border border-[#ececec] rounded-xl p-5">
              <h2 className="font-playfair text-[18px] text-dark-green mb-4">Tools</h2>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Layers,   label: 'Bulk Order Form' },
                  { icon: FileText, label: 'Download Invoices' },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-3 text-[#aaa]">
                    <t.icon size={16} />
                    <span className="font-lato text-[13px]">{t.label}</span>
                    <span className="ml-auto font-lato text-[10px] uppercase tracking-[1px] bg-[#f0f0f0] text-[#999] px-2 py-0.5 rounded">Soon</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Business details */}
        {app && (
          <div>
            <h2 className="font-playfair text-[20px] text-dark-green mb-4">Business Details</h2>
            <div className="bg-white border border-[#ececec] rounded-xl divide-y divide-[#f0f0f0]">
              {[
                { label: 'Business Name', value: app.businessName },
                { label: 'Business Type', value: app.businessType },
                { label: 'EIN / Tax ID', value: app.ein || '—' },
                { label: 'Contact', value: app.contactName },
                { label: 'Email', value: app.email },
                { label: 'Phone', value: app.phone },
                { label: 'Address', value: app.address ? `${app.address.street}, ${app.address.city}, ${app.address.state} ${app.address.zip}` : '—' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <span className="font-lato text-[12px] uppercase tracking-[1px] text-[#999] shrink-0">{row.label}</span>
                  <span className="font-lato text-[14px] text-dark-green text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WholesaleDashboard;
