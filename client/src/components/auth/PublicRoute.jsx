import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Optionally, render a spinner here

  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default PublicRoute; 