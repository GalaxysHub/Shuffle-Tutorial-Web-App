import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, requiresSubscription = false }) => {
  const { isAuthenticated, isLoading, subscriptionStatus } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiresSubscription && subscriptionStatus !== 'active' && subscriptionStatus !== 'trialing') {
    return <Navigate to="/subscribe" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;