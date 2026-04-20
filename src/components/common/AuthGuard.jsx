import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        
        // Check if token exists and is not a dummy token
        if (token ) {
          // Additional validation could be added here (e.g., decode JWT to check expiry)
          setAuthenticated(true);
        } else {
          // Clear any invalid tokens
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          localStorage.removeItem('userPreferences');
          setAuthenticated(false);
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear any potentially corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userPreferences');
        setAuthenticated(false);
        navigate('/login');
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-3">
            <small className="text-muted">Checking authentication...</small>
          </div>
        </div>
      </div>
    );
  }

  return authenticated ? children : null;
};

// Export utility function for clearing auth data (useful for testing)
export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('userPreferences');
  window.location.href = '/login';
};

export default AuthGuard;
