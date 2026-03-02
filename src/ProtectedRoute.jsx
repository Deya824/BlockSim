import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("authToken");

  if (!isAuthenticated) {
    // Redirects unauthenticated users to the login portal
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
