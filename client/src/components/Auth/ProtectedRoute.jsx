import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#faf9ff]">
    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

// roles: optional array of allowed roles e.g. ['wholesale', 'admin']
// If omitted, any authenticated user is allowed.
const ProtectedRoute = ({ children, roles }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
