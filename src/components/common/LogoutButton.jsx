import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove auth token from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userPreferences');
    
    // Navigate to login page
    navigate('/login');
  };

  return (
    <button 
      className="btn btn-outline-danger btn-sm"
      onClick={handleLogout}
      title="Logout"
    >
      <i className="bi bi-box-arrow-right"></i>
    </button>
  );
};

export default LogoutButton;
