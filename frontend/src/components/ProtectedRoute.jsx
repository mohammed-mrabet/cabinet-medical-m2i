import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, rolesAutorises }) {
  const { isAuthenticated, session } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
  }

  if (rolesAutorises && !rolesAutorises.includes(session.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
