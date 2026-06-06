import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// Can the given user open an admin section?
// Admins → everything. Staff → only their granted permissions.
export const canAccess = (user, section) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'staff') return (user.permissions || []).includes(section);
  return false;
};

// First section a user is allowed to land on (for redirects)
const ORDER = ['dashboard', 'banners', 'orders', 'wholesale', 'products', 'customers', 'promos', 'messages'];
export const firstAllowed = (user) => {
  if (user?.role === 'admin') return '/admin';
  const s = ORDER.find((sec) => canAccess(user, sec));
  return s ? (s === 'dashboard' ? '/admin' : `/admin/${s}`) : null;
};

// Per-route guard used inside the admin layout
export const PermGuard = ({ section, adminOnly = false, children }) => {
  const { user } = useAuth();
  const ok = adminOnly ? user?.role === 'admin' : canAccess(user, section);
  if (ok) return children;

  const fallback = firstAllowed(user);
  // If the staff member has some other allowed section, send them there
  if (fallback && fallback !== window.location.pathname) {
    return <Navigate to={fallback} replace />;
  }
  // Otherwise show a friendly no-access message
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <ShieldAlert size={24} className="text-red-400" />
      </div>
      <h3 className="font-playfair text-[20px] text-dark-green mb-1">No access</h3>
      <p className="font-lato text-[13px] text-[#999]">You don't have permission to view this section.</p>
    </div>
  );
};
