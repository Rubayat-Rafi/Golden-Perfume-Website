import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, ShoppingBag, Truck, User, Lock, Settings as SettingsIcon,
  Heart, LogOut, Briefcase, ArrowLeft, AlertTriangle, Eye, EyeOff,
  Package, CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { useWishlist } from '../../hooks/useWishlist';
import { api } from '../../lib/api';
import { useMyOrders, useMyWholesaleApplication } from '../../hooks/queries';
import OrderCard, { money, fmtDate, StatusBadge } from '../../components/OrderCard/OrderCard';

const TABS = [
  { id: 'overview', label: 'Overview',        icon: LayoutGrid },
  { id: 'orders',   label: 'My Orders',       icon: ShoppingBag },
  { id: 'track',    label: 'Track Order',     icon: Truck },
  { id: 'account',  label: 'Account',         icon: User },
  { id: 'password', label: 'Change Password', icon: Lock },
  { id: 'settings', label: 'Settings',        icon: SettingsIcon },
];

// ── Order tracking stepper ──────────────────────────────────────────────────
const STAGES = [
  { key: 'pending',    label: 'Ordered',    icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped',    label: 'Shipped',    icon: Truck },
  { key: 'delivered',  label: 'Delivered',  icon: CheckCircle2 },
];

const TrackStepper = ({ order }) => {
  const cancelled = order.fulfillmentStatus === 'cancelled';
  const currentIdx = STAGES.findIndex((s) => s.key === order.fulfillmentStatus);

  return (
    <div className="bg-white border border-[#ececec] rounded-xl p-5">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <p className="font-lato font-bold text-[14px] text-dark-green">{order.orderNumber}</p>
          <p className="font-lato text-[12px] text-[#999]">{fmtDate(order.createdAt)} · {money(order.grandTotal)}</p>
        </div>
        <StatusBadge status={order.fulfillmentStatus} />
      </div>

      {cancelled ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <XCircle size={18} className="text-red-500 shrink-0" />
          <span className="font-lato text-[13px] text-red-600">This order was cancelled.</span>
        </div>
      ) : (
        <div className="flex items-center">
          {STAGES.map((s, i) => {
            const done = i <= currentIdx;
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex-1 flex flex-col items-center relative">
                {/* connector */}
                {i > 0 && (
                  <span className={`absolute top-4 right-1/2 w-full h-0.5 ${i <= currentIdx ? 'bg-brand-green' : 'bg-[#e8e8e8]'}`} />
                )}
                <span className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${done ? 'bg-brand-green text-white' : 'bg-[#eee] text-[#aaa]'}`}>
                  <Icon size={15} />
                </span>
                <span className={`mt-2 font-lato text-[11px] text-center ${done ? 'text-dark-green font-bold' : 'text-[#aaa]'}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {order.trackingNumber && (
        <p className="mt-5 font-lato text-[12px] text-dark-green/70">
          Tracking number: <strong className="text-dark-green">{order.trackingNumber}</strong>
        </p>
      )}
    </div>
  );
};

// ── Change password form ────────────────────────────────────────────────────
const ChangePassword = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [msg, setMsg]   = useState(null);     // {type, text}
  const [busy, setBusy] = useState(false);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (form.newPassword.length < 8) return setMsg({ type: 'err', text: 'New password must be at least 8 characters' });
    if (form.newPassword !== form.confirm) return setMsg({ type: 'err', text: 'New passwords do not match' });
    setBusy(true);
    try {
      await api.patch('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setMsg({ type: 'ok', text: 'Password updated successfully' });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setMsg({ type: 'err', text: err.message || 'Failed to update password' });
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full h-11 px-4 border border-[#e0e0e0] rounded-lg font-lato text-[14px] text-dark-green outline-none focus:border-brand-green/60 focus:ring-2 focus:ring-brand-green/10 transition-all';

  return (
    <div className="max-w-md">
      <h2 className="font-playfair text-[22px] text-dark-green mb-5">Change Password</h2>
      <form onSubmit={submit} className="bg-white border border-[#ececec] rounded-xl p-6 flex flex-col gap-4">
        {msg && (
          <div className={`rounded-lg px-4 py-3 font-lato text-[13px] ${msg.type === 'ok' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
            {msg.text}
          </div>
        )}
        <div>
          <label className="block font-lato text-[11px] uppercase tracking-[1.5px] text-[#888] mb-2">Current Password</label>
          <input type={show ? 'text' : 'password'} value={form.currentPassword} onChange={set('currentPassword')} className={inputCls} required />
        </div>
        <div>
          <label className="block font-lato text-[11px] uppercase tracking-[1.5px] text-[#888] mb-2">New Password</label>
          <input type={show ? 'text' : 'password'} value={form.newPassword} onChange={set('newPassword')} placeholder="At least 8 characters" className={inputCls} required />
        </div>
        <div>
          <label className="block font-lato text-[11px] uppercase tracking-[1.5px] text-[#888] mb-2">Confirm New Password</label>
          <input type={show ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} className={inputCls} required />
        </div>
        <label className="flex items-center gap-2 font-lato text-[13px] text-[#666] cursor-pointer">
          <button type="button" onClick={() => setShow(!show)} className="text-[#888] hover:text-dark-green cursor-pointer">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          Show passwords
        </label>
        <button type="submit" disabled={busy}
          className="h-11 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors cursor-pointer disabled:opacity-60">
          {busy ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

// ── Settings (account deletion request) ─────────────────────────────────────
const DAY = 24 * 60 * 60 * 1000;

const Settings = ({ user, refreshUser }) => {
  const [busy, setBusy] = useState(false);
  const [now] = useState(() => Date.now());
  const status = user?.deletionStatus || 'none';

  const act = async (path) => {
    setBusy(true);
    try {
      await api.post(path, {});
      await refreshUser();
    } catch (e) {
      alert(e.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const request = () => {
    if (!confirm('Request account deletion? An admin will review it. If not actioned within 3 days, your account is automatically deleted.')) return;
    act('/auth/request-deletion');
  };

  const autoDate = user?.deletionRequestedAt
    ? new Date(new Date(user.deletionRequestedAt).getTime() + 3 * DAY)
    : null;
  const daysLeft = autoDate ? Math.max(0, Math.ceil((autoDate.getTime() - now) / DAY)) : 0;

  return (
    <div className="max-w-lg">
      <h2 className="font-playfair text-[22px] text-dark-green mb-5">Settings</h2>

      <div className="bg-white border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <AlertTriangle size={18} className="text-red-500" />
          <h3 className="font-playfair text-[18px] text-dark-green">Delete Account</h3>
        </div>

        {status === 'pending' ? (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
              <p className="font-lato text-[13px] text-amber-800">
                <strong>Deletion requested</strong> on {fmtDate(user.deletionRequestedAt)}.
                Awaiting admin review — it will be <strong>auto-approved in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong> if not actioned.
              </p>
            </div>
            <button onClick={() => act('/auth/cancel-deletion')} disabled={busy}
              className="h-11 px-6 border border-[#ddd] text-dark-green font-lato font-bold text-[12px] uppercase tracking-[1.5px] rounded-lg hover:border-dark-green transition-colors cursor-pointer disabled:opacity-60">
              Cancel Request
            </button>
          </>
        ) : (
          <>
            {status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <p className="font-lato text-[13px] text-red-600">Your previous deletion request was rejected by an admin. You may submit a new request.</p>
              </div>
            )}
            <p className="font-lato text-[13px] text-[#666] leading-relaxed mb-4">
              Requesting deletion sends your account to an admin for review. If it isn't approved or rejected
              within <strong>3 days</strong>, your account is deleted automatically. This action permanently removes your account and order history.
            </p>
            <button onClick={request} disabled={busy}
              className="h-11 px-6 bg-red-500 text-white font-lato font-bold text-[12px] uppercase tracking-[1.5px] rounded-lg hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-60">
              Request Account Deletion
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, role, logout, refreshUser } = useAuth();
  const { items: wishItems } = useWishlist();
  const navigate = useNavigate();

  const [tab, setTab] = useState('overview');

  const { data: orders = [], isLoading: loading } = useMyOrders();
  const { data: myApplication } = useMyWholesaleApplication(role === 'customer');
  const hasApplication = !!myApplication;

  const handleLogout = async () => {
    navigate('/');
    toast('Signed out successfully.');
    await logout();
  };
  const recentOrder = orders[0];
  const activeOrders = orders.filter((o) => o.fulfillmentStatus !== 'delivered' && o.fulfillmentStatus !== 'cancelled');

  return (
    <div className="bg-cream min-h-screen">
      {/* Header band */}
      <div className="bg-dark-green pt-6 pb-10 md:pb-14">
        <div className="max-w-305 mx-auto px-4 md:px-10">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="inline-flex items-center gap-2 font-lato text-[13px] text-white/70 hover:text-gold transition-colors">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <Link to="/" className="inline-flex items-center">
              <img src="/logo.png" alt="Golden Perfume" className="h-10 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gold flex items-center justify-center font-playfair font-bold text-[24px] text-dark-green shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="font-playfair font-normal text-[24px] md:text-[30px] text-white leading-tight truncate">{user?.name}</h1>
              <p className="font-lato text-[13px] text-white/55 truncate">{user?.email}</p>
            </div>
            {(role === 'wholesale' || role === 'admin') && (
              <span className="ml-auto hidden sm:inline-block px-3 py-1.5 bg-brand-green/20 border border-brand-green/40 rounded-full font-lato font-bold text-[11px] uppercase tracking-[1px] text-gold">
                {role} account
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-305 mx-auto px-4 md:px-10 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white border border-[#ececec] rounded-2xl p-3 lg:sticky lg:top-6 shadow-[0_2px_16px_rgba(20,40,25,0.04)]">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setTab(id)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-lato text-[14px] whitespace-nowrap transition-colors cursor-pointer ${
                      tab === id ? 'bg-dark-green text-linen font-bold shadow-sm' : 'text-dark-green/70 hover:bg-cream'
                    }`}>
                    <Icon size={17} /> {label}
                  </button>
                ))}

                <div className="hidden lg:block h-px bg-[#f0f0f0] my-2" />

                <Link to="/wishlist"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-lato text-[14px] whitespace-nowrap text-dark-green/70 hover:bg-cream transition-colors">
                  <Heart size={17} /> Wishlist
                  {wishItems.length > 0 && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-gold text-dark-green font-bold text-[10px] flex items-center justify-center">{wishItems.length}</span>
                  )}
                </Link>
                {(role === 'wholesale' || role === 'admin') && (
                  <Link to={role === 'admin' ? '/admin' : '/wholesale'}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-lato text-[14px] whitespace-nowrap text-dark-green/70 hover:bg-cream transition-colors">
                    <Briefcase size={17} /> {role === 'admin' ? 'Admin Panel' : 'Wholesale Portal'}
                  </Link>
                )}
                {role === 'customer' && hasApplication && (
                  <Link to="/wholesale" className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-lato text-[14px] whitespace-nowrap text-dark-green/70 hover:bg-cream transition-colors">
                    <Briefcase size={17} /> Wholesale Application
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-lato text-[14px] whitespace-nowrap text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                  <LogOut size={17} /> Log Out
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Overview */}
            {tab === 'overview' && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-[#ececec] rounded-xl p-5">
                    <p className="font-playfair text-[28px] text-dark-green leading-none mb-1">{orders.length}</p>
                    <p className="font-lato text-[12px] text-[#888] uppercase tracking-[1px]">Total Orders</p>
                  </div>
                  <div className="bg-white border border-[#ececec] rounded-xl p-5">
                    <p className="font-playfair text-[28px] text-dark-green leading-none mb-1">{wishItems.length}</p>
                    <p className="font-lato text-[12px] text-[#888] uppercase tracking-[1px]">Wishlist Items</p>
                  </div>
                  <div className="bg-white border border-[#ececec] rounded-xl p-5 col-span-2 md:col-span-1">
                    <p className="font-playfair text-[28px] text-dark-green leading-none mb-1 capitalize">{role}</p>
                    <p className="font-lato text-[12px] text-[#888] uppercase tracking-[1px]">Account Type</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-playfair text-[20px] text-dark-green">Recent Order</h2>
                    {orders.length > 0 && (
                      <button onClick={() => setTab('orders')} className="font-lato text-[12px] text-brand-green hover:text-dark-green uppercase tracking-[1px] cursor-pointer">View all →</button>
                    )}
                  </div>
                  {loading ? (
                    <div className="bg-white border border-[#ececec] rounded-xl h-20 animate-pulse" />
                  ) : recentOrder ? (
                    <OrderCard order={recentOrder} />
                  ) : (
                    <div className="bg-white border border-[#ececec] rounded-xl p-10 text-center">
                      <ShoppingBag size={28} className="text-[#ccc] mx-auto mb-3" />
                      <p className="font-lato text-[14px] text-[#999] mb-5">You haven't placed any orders yet.</p>
                      <Link to="/shop" className="inline-block h-11 leading-[44px] px-8 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors">Start Shopping</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders */}
            {tab === 'orders' && (
              <div>
                <h2 className="font-playfair text-[22px] text-dark-green mb-5">My Orders</h2>
                {loading ? (
                  <div className="flex flex-col gap-3">{[1,2,3].map((i) => <div key={i} className="bg-white border border-[#ececec] rounded-xl h-20 animate-pulse" />)}</div>
                ) : orders.length === 0 ? (
                  <div className="bg-white border border-[#ececec] rounded-xl p-12 text-center">
                    <ShoppingBag size={32} className="text-[#ccc] mx-auto mb-4" />
                    <h3 className="font-playfair text-[20px] text-dark-green mb-2">No orders yet</h3>
                    <p className="font-lato text-[14px] text-[#999] mb-6">Once you place an order it will show up here.</p>
                    <Link to="/shop" className="inline-block h-11 leading-[44px] px-8 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors">Browse Products</Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">{orders.map((o) => <OrderCard key={o._id} order={o} />)}</div>
                )}
              </div>
            )}

            {/* Track Order */}
            {tab === 'track' && (
              <div>
                <h2 className="font-playfair text-[22px] text-dark-green mb-1">Track Order</h2>
                <p className="font-lato text-[13px] text-[#999] mb-5">Follow your orders through each fulfillment stage.</p>
                {loading ? (
                  <div className="bg-white border border-[#ececec] rounded-xl h-32 animate-pulse" />
                ) : orders.length === 0 ? (
                  <div className="bg-white border border-[#ececec] rounded-xl p-12 text-center">
                    <Truck size={32} className="text-[#ccc] mx-auto mb-4" />
                    <p className="font-lato text-[14px] text-[#999]">No orders to track yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {(activeOrders.length ? activeOrders : orders).map((o) => <TrackStepper key={o._id} order={o} />)}
                  </div>
                )}
              </div>
            )}

            {/* Account */}
            {tab === 'account' && (
              <div>
                <h2 className="font-playfair text-[22px] text-dark-green mb-5">Account Information</h2>
                <div className="bg-white border border-[#ececec] rounded-xl divide-y divide-[#f0f0f0]">
                  {[
                    { label: 'Full Name', value: user?.name },
                    { label: 'Email Address', value: user?.email },
                    { label: 'Phone', value: user?.phone || 'Not provided' },
                    { label: 'Account Type', value: role, capitalize: true },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between px-5 py-4">
                      <span className="font-lato text-[12px] uppercase tracking-[1px] text-[#999]">{row.label}</span>
                      <span className={`font-lato text-[14px] text-dark-green ${row.capitalize ? 'capitalize' : ''}`}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <h2 className="font-playfair text-[22px] text-dark-green mt-8 mb-5">Saved Addresses</h2>
                {user?.addresses?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.addresses.map((a, i) => (
                      <div key={i} className="bg-white border border-[#ececec] rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-lato font-bold text-[13px] text-dark-green">{a.label}</span>
                          {a.isDefault && <span className="px-2 py-0.5 bg-brand-green/10 text-brand-green rounded font-lato text-[10px] font-bold uppercase">Default</span>}
                        </div>
                        <p className="font-lato text-[13px] text-[#666] leading-relaxed">{a.street}<br />{a.city}, {a.state} {a.zip}<br />{a.country}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-[#ececec] rounded-xl p-8 text-center">
                    <p className="font-lato text-[14px] text-[#999]">No saved addresses yet. Addresses you use at checkout will be saved here.</p>
                  </div>
                )}
              </div>
            )}

            {/* Change Password */}
            {tab === 'password' && <ChangePassword />}

            {/* Settings */}
            {tab === 'settings' && <Settings user={user} refreshUser={refreshUser} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
