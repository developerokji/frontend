import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from './CustomButton';
import { api } from '../../services/apiClient';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call logout API if available
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Logout API call failed, proceeding with local logout');
    } finally {
      // Remove auth token using axios interceptor
      api.removeAuthToken();
      
      // Remove user preferences
      localStorage.removeItem('userPreferences');
      
      // Navigate to login page
      navigate('/login');
    }
  };

  return (
    <CustomButton 
      variant="outline-danger" 
      size="sm"
      icon="bi-box-arrow-right"
      onClick={handleLogout}
      tooltip="Logout"
    >
    </CustomButton>
  );
};

export default LogoutButton;
