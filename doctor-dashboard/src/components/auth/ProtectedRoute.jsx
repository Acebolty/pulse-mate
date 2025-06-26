import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../../services/authService'; // Import your authentication check

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // Doctor not authenticated, redirect to login page
    // You can also pass the current location to redirect back after login
    // e.g., <Navigate to="/login" state={{ from: location }} replace />
    return <Navigate to="/login" replace />;
  }

  // Doctor is authenticated, render the child components (the actual protected page)
  // Outlet is used if this ProtectedRoute is used as a layout route for nested routes.
  // If you pass children directly, like <ProtectedRoute><MyPage /></ProtectedRoute>, then use {children}.
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
