import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface AuthRedirectProps {
  children: React.ReactNode;
}

// Component that redirects authenticated users away from auth pages
const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // If user is authenticated, don't render the auth form
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthRedirect;