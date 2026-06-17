import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingBag, Briefcase, Package, Users, Mail, TrendingUp,
} from 'lucide-react';
import { useAdminStats, useAdminRevenue } from '../../hooks/queries';
import { money, formatDate, StatusBadge, ChannelBadge, PageHeader, Card, DashboardSkeleton } from './adminUI';

const KpiCard = ({ icon: Icon, label, value, accent, to }) => {
  const inner = (
    <Card className="p-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow h-full">
      <div className="flex items-center justify-between mb-3">
        <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon size={19} />
        </span>
      </div>
      <p className="font-playfair text-[26px] text-dark-green leading-none mb-1">{value}</p>
      <p className="font-lato text-[12px] text-[#888] uppercase tracking-[1px]">{label}</p>
    </Card>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
};

// ── Dependency-free SVG trend chart (area + line + hover tooltip) ────────────
const niceCeil = (v) => {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / pow;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nice * pow;
};
const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 ? 1 : 0)}k` : `${n}`);

const TrendChart = ({ data, metric }) => {
  const [hover, setHover] = useState(null);
  const isRevenue = metric === 'revenue';
  const color = isRevenue ? '#217945' : '#C2A038';

  const W = 720, H = 260;
  const pad = { top: 18, right: 16, bottom: 30, left: 52 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const n = data.length;
  const vals = data.map((d) => (isRevenue ? d.revenue : d.orders));
  const maxV = niceCeil(Math.max(1, ...vals));

  const x = (i) => pad.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v) => pad.top + innerH * (1 - v / maxV);

  const pts = vals.map((v, i) => [x(i), y(v)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L ${x(n - 1).toFixed(1)} ${pad.top + innerH} L ${x(0).toFixed(1)} ${pad.top + innerH} Z`;

  const yTicks = 4;
  const labelEvery = Math.max(1, Math.ceil(n / 7));
  const fmtVal = (v) => (isRevenue ? `$${compact(v)}` : compact(v));

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y gridlines + labels */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = (maxV / yTicks) * i;
          const yy = y(v);
          return (
            <g key={i}>
              <line x1={pad.left} y1={yy} x2={W - pad.right} y2={yy} stroke="#f0f0f0" strokeWidth="1" />
              <text x={pad.left - 8} y={yy + 3} textAnchor="end" fontSize="10" fill="#aaa" fontFamily="Lato, sans-serif">
                {fmtVal(v)}
              </text>
            </g>
          );
        })}

        {/* Area + line */}
        <path d={area} fill="url(#trendFill)" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* X labels */}
        {data.map((d, i) =>
          i % labelEvery === 0 || i === n - 1 ? (
            <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fontSize="10" fill="#aaa" fontFamily="Lato, sans-serif">
              {d.label}
            </text>
          ) : null
        )}

        {/* Hover guide + point */}
        {hover != null && (
          <g>
            <line x1={x(hover)} y1={pad.top} x2={x(hover)} y2={pad.top + innerH} stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <circle cx={x(hover)} cy={y(vals[hover])} r="4.5" fill={color} stroke="#fff" strokeWidth="2" />
          </g>
        )}

        {/* Hover hit areas */}
        {data.map((_, i) => (
          <rect
            key={i}
            x={x(i) - (innerW / Math.max(1, n - 1)) / 2}
            y={pad.top}
            width={innerW / Math.max(1, n - 1)}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hover != null && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none bg-dark-green text-white rounded-lg px-3 py-2 shadow-lg whitespace-nowrap"
          style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(vals[hover]) / H) * 100}%`, marginTop: '-8px' }}
        >
          <p className="font-lato text-[11px] text-white/60 leading-none mb-1">{data[hover].label}</p>
          <p className="font-lato font-bold text-[13px] leading-none">
            {isRevenue ? money(data[hover].revenue) : `${data[hover].orders} orders`}
          </p>
        </div>
      )}
    </div>
  );
};

const RANGES = [
  { key: '7d',  label: '7D'  },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: '12m', label: '12M' },
];

const AdminDashboard = () => {
  const { data, isLoading: loading } = useAdminStats();

  const [range, setRange]     = useState('30d');
  const [channel, setChannel] = useState('all');
  const [metric, setMetric]   = useState('revenue');
  const [paidOnly, setPaidOnly] = useState(false);
  const [from, setFrom]       = useState('');
  const [to, setTo]           = useState('');

  const customActive = from && to && from <= to;
  const today = new Date().toISOString().slice(0, 10);

  const revParams = {
    ...(customActive ? { from, to } : { range }),
    ...(channel !== 'all' ? { channel } : {}),
    ...(paidOnly ? { paidOnly: '1' } : {}),
  };

  const pickRange = (r) => { setRange(r); setFrom(''); setTo(''); };
  const { data: rev, isFetching: revFetching } = useAdminRevenue(revParams);
  const series  = rev?.series  ?? [];
  const summary = rev?.summary ?? { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

  if (loading) return <DashboardSkeleton />;
  if (!data) return <p className="font-lato text-[#999]">Failed to load dashboard.</p>;

  const { kpis, channels, recentOrders } = data;
  const totalChannelRevenue = channels.b2c.revenue + channels.b2b.revenue;
  const b2cPct = totalChannelRevenue ? Math.round((channels.b2c.revenue / totalChannelRevenue) * 100) : 0;
  const b2bPct = 100 - b2cPct;

  const tabBtn = (active) =>
    `px-3 h-8 rounded-lg font-lato text-[12px] font-bold transition-colors cursor-pointer ${
      active ? 'bg-dark-green text-white' : 'bg-white border border-[#ddd] text-[#666] hover:border-dark-green'
    }`;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your store performance" />

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={DollarSign} label="Paid Revenue"   value={money(kpis.paidRevenue)} accent="bg-green-100 text-green-700" />
        <KpiCard icon={ShoppingBag} label="Total Orders"  value={kpis.totalOrders} accent="bg-blue-100 text-blue-700" to="/admin/orders" />
        <KpiCard icon={Briefcase} label="Pending Apps"    value={kpis.pendingApplications} accent="bg-amber-100 text-amber-700" to="/admin/wholesale" />
        <KpiCard icon={Package} label="Products"          value={kpis.totalProducts} accent="bg-purple-100 text-purple-700" to="/admin/products" />
        <KpiCard icon={Users} label="Customers"           value={kpis.totalCustomers} accent="bg-teal-100 text-teal-700" />
        <KpiCard icon={Mail} label="Unread Messages"      value={kpis.unreadMessages} accent="bg-rose-100 text-rose-700" to="/admin/messages" />
        <KpiCard icon={TrendingUp} label="Orders Today"   value={kpis.ordersToday} accent="bg-indigo-100 text-indigo-700" />
      </div>

      {/* Revenue / Orders trend */}
      <Card className="p-5 mb-6">
        {/* Header + filters */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-playfair text-[18px] text-dark-green">
              {metric === 'revenue' ? 'Revenue' : 'Orders'} Trend
            </h2>
            <p className="font-lato text-[12px] text-[#999] mt-0.5">
              {channel === 'all' ? 'All channels' : channel === 'b2c' ? 'Retail' : 'Wholesale'}
              {paidOnly ? ' · paid only' : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric toggle */}
            <div className="flex rounded-lg overflow-hidden border border-[#ddd]">
              {['revenue', 'orders'].map((m) => (
                <button key={m} onClick={() => setMetric(m)}
                  className={`px-3 h-8 font-lato text-[12px] font-bold capitalize transition-colors cursor-pointer ${
                    metric === m ? 'bg-dark-green text-white' : 'bg-white text-[#666] hover:bg-[#f5f5f5]'
                  }`}>
                  {m}
                </button>
              ))}
            </div>

            {/* Channel */}
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="h-8 px-2 border border-[#ddd] rounded-lg font-lato text-[12px] bg-white outline-none focus:border-brand-green cursor-pointer"
            >
              <option value="all">All channels</option>
              <option value="b2c">Retail (B2C)</option>
              <option value="b2b">Wholesale (B2B)</option>
            </select>

            {/* Paid only */}
            <button
              onClick={() => setPaidOnly((v) => !v)}
              className={`px-3 h-8 rounded-lg font-lato text-[12px] font-bold transition-colors cursor-pointer border ${
                paidOnly ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-[#666] border-[#ddd] hover:border-brand-green'
              }`}
            >
              Paid only
            </button>

            {/* Range presets */}
            <div className="flex gap-1">
              {RANGES.map((r) => (
                <button key={r.key} onClick={() => pickRange(r.key)} className={tabBtn(!customActive && range === r.key)}>
                  {r.label}
                </button>
              ))}
            </div>

            {/* Custom date range */}
            <div className={`flex items-center gap-1.5 pl-2 ml-1 border-l border-[#eee] ${customActive ? 'text-dark-green' : ''}`}>
              <input
                type="date"
                value={from}
                max={to || today}
                onChange={(e) => setFrom(e.target.value)}
                className="h-8 px-2 border border-[#ddd] rounded-lg font-lato text-[12px] bg-white outline-none focus:border-brand-green cursor-pointer"
              />
              <span className="font-lato text-[12px] text-[#aaa]">–</span>
              <input
                type="date"
                value={to}
                min={from || undefined}
                max={today}
                onChange={(e) => setTo(e.target.value)}
                className="h-8 px-2 border border-[#ddd] rounded-lg font-lato text-[12px] bg-white outline-none focus:border-brand-green cursor-pointer"
              />
              {customActive && (
                <button
                  onClick={() => { setFrom(''); setTo(''); }}
                  className="h-8 px-2 font-lato text-[12px] text-[#999] hover:text-red-500 transition-colors cursor-pointer"
                  title="Clear custom range"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <p className="font-lato text-[11px] text-[#999] uppercase tracking-[1px] mb-1">Revenue</p>
            <p className="font-playfair text-[22px] text-dark-green leading-none">{money(summary.totalRevenue)}</p>
          </div>
          <div>
            <p className="font-lato text-[11px] text-[#999] uppercase tracking-[1px] mb-1">Orders</p>
            <p className="font-playfair text-[22px] text-dark-green leading-none">{summary.totalOrders}</p>
          </div>
          <div>
            <p className="font-lato text-[11px] text-[#999] uppercase tracking-[1px] mb-1">Avg Order</p>
            <p className="font-playfair text-[22px] text-dark-green leading-none">{money(summary.avgOrderValue)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className={`transition-opacity duration-200 ${revFetching ? 'opacity-50' : 'opacity-100'}`}>
          {series.length > 0 ? (
            <TrendChart data={series} metric={metric} />
          ) : (
            <div className="h-50 flex items-center justify-center font-lato text-[13px] text-[#bbb]">
              No data for this period
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent orders */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
            <h2 className="font-playfair text-[18px] text-dark-green">Recent Orders</h2>
            <Link to="/admin/orders" className="font-lato text-[12px] text-brand-green hover:text-dark-green uppercase tracking-[1px]">
              View all →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="font-lato text-[14px] text-[#999] px-5 py-10 text-center">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f0f0f0] text-left">
                    <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3">Order</th>
                    <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Customer</th>
                    <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Total</th>
                    <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Status</th>
                    <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o._id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa]">
                      <td className="px-5 py-3.5">
                        <span className="font-lato font-bold text-[13px] text-dark-green">{o.orderNumber}</span>
                        <span className="ml-2"><ChannelBadge type={o.customerType} /></span>
                      </td>
                      <td className="px-3 py-3.5 font-lato text-[13px] text-[#666]">{o.user?.name || '—'}</td>
                      <td className="px-3 py-3.5 font-lato font-bold text-[13px] text-dark-green">{money(o.grandTotal)}</td>
                      <td className="px-3 py-3.5"><StatusBadge status={o.fulfillmentStatus} /></td>
                      <td className="px-5 py-3.5 font-lato text-[12px] text-[#999] text-right">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Channel split */}
        <Card className="p-5">
          <h2 className="font-playfair text-[18px] text-dark-green mb-5">Revenue by Channel</h2>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-lato text-[13px] text-[#666] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gold" /> Retail (B2C)
              </span>
              <span className="font-lato font-bold text-[13px] text-dark-green">{money(channels.b2c.revenue)}</span>
            </div>
            <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full" style={{ width: `${b2cPct}%` }} />
            </div>
            <p className="font-lato text-[11px] text-[#aaa] mt-1">{channels.b2c.count} orders · {b2cPct}%</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-lato text-[13px] text-[#666] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-green" /> Wholesale (B2B)
              </span>
              <span className="font-lato font-bold text-[13px] text-dark-green">{money(channels.b2b.revenue)}</span>
            </div>
            <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div className="h-full bg-brand-green rounded-full" style={{ width: `${b2bPct}%` }} />
            </div>
            <p className="font-lato text-[11px] text-[#aaa] mt-1">{channels.b2b.count} orders · {b2bPct}%</p>
          </div>

          <div className="mt-6 pt-5 border-t border-[#f0f0f0]">
            <p className="font-lato text-[12px] text-[#888] uppercase tracking-[1px] mb-1">Total Revenue</p>
            <p className="font-playfair text-[24px] text-dark-green">{money(totalChannelRevenue)}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
