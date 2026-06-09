import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Briefcase, Package, Users, FolderTree,
  Ticket, Mail, LogOut, Menu, X, ExternalLink, Image as ImageIcon, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { canAccess } from './access';

// `perm` = section key checked against staff permissions; `adminOnly` = admins only
const NAV = [
  { to: '/admin',           label: 'Dashboard',    icon: LayoutDashboard, end: true, perm: 'dashboard' },
  { to: '/admin/banners',   label: 'Banners',      icon: ImageIcon,  perm: 'banners' },
  { to: '/admin/orders',    label: 'Orders',       icon: ShoppingBag, perm: 'orders' },
  { to: '/admin/wholesale', label: 'Wholesale',    icon: Briefcase,  perm: 'wholesale' },
  { to: '/admin/products',  label: 'Products',     icon: Package,    perm: 'products' },
  { to: '/admin/categories', label: 'Categories',  icon: FolderTree, perm: 'categories' },
  { to: '/admin/customers', label: 'Customers',    icon: Users,      perm: 'customers' },
  { to: '/admin/promos',    label: 'Promo Codes',  icon: Ticket,     perm: 'promos' },
  { to: '/admin/messages',  label: 'Messages',     icon: Mail,       perm: 'messages' },
  { to: '/admin/staff',     label: 'Staff & Admins', icon: ShieldCheck, adminOnly: true },
];

const AdminLayout = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const visibleNav = NAV.filter((item) =>
    item.adminOnly ? role === 'admin' : canAccess(user, item.perm)
  );

  const handleLogout = async () => {
    navigate('/');
    await logout();
  };

  const SidebarBody = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Golden Perfume" className="h-10 w-auto" />
        </Link>
        <p className="font-lato text-[10px] uppercase tracking-[3px] text-gold mt-2">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
        {visibleNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg font-lato text-[14px] transition-colors duration-150 ${
                isActive
                  ? 'bg-gold text-dark-green font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-lato text-[13px] text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ExternalLink size={16} />
          View Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-lato text-[13px] text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f5f6f5] flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-dark-green flex-col fixed inset-y-0 left-0 z-30">
        <SidebarBody />
      </aside>

      {/* ── Mobile sidebar ── */}
      {open && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 bg-dark-green flex flex-col z-50">
            <SidebarBody />
          </aside>
        </>
      )}

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-[#ececec] px-4 md:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden text-dark-green cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-lato font-bold text-[13px] text-dark-green leading-tight">{user?.name}</p>
              <p className="font-lato text-[11px] text-[#999] capitalize">{user?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center font-lato font-bold text-[14px] text-dark-green">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
