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
        
        if (token) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
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

export default AuthGuard;
