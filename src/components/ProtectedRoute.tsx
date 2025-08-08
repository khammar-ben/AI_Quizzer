import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, token, loading } = useAuth();

  // If authentication is still loading, show a loading indicator or nothing
  if (loading) {
    return <div>Loading authentication...</div>; // Or null, or a spinner
  }

  // If the user is authenticated (has user data and a token), render the child routes
  if (user && token) {
    return <Outlet />;
  }

  // If not authenticated, redirect to the sign-in page
  return <Navigate to="/signin" replace />;
};

export default ProtectedRoute; 