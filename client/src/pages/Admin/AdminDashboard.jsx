import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingBag, Briefcase, Package, Users, Mail, TrendingUp,
} from 'lucide-react';
import { api } from '../../lib/api';
import { money, formatDate, StatusBadge, ChannelBadge, PageHeader, Card, Spinner } from './adminUI';

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

const AdminDashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((d) => setData(d.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <p className="font-lato text-[#999]">Failed to load dashboard.</p>;

  const { kpis, channels, recentOrders } = data;
  const totalChannelRevenue = channels.b2c.revenue + channels.b2b.revenue;
  const b2cPct = totalChannelRevenue ? Math.round((channels.b2c.revenue / totalChannelRevenue) * 100) : 0;
  const b2bPct = 100 - b2cPct;

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
