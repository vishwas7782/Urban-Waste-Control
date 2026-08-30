import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Guards routes by authentication and (optionally) a required role.
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredRole && role !== requiredRole) {
    // Logged in but wrong role: send to their own dashboard.
    const home = role === 'municipal' ? '/municipal' : '/dashboard';
    return <Navigate to={home} replace />;
  }

  return children;
}
