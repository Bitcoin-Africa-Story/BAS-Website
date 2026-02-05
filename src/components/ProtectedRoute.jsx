import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import ProcessingOverlay from '../dashboard/components/ProcessingOverlay';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <ProcessingOverlay isSubmitting={true} message="Checking session..." />;
  if (!user) return <Navigate to="/admin" state={{ from: location }} replace />;

  return children;
};

export default ProtectedRoute;
