import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../components/common/CustomButton';
import CustomInput from '../components/common/CustomInput';
import { api } from '../services/apiClient';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate login API call with axios
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      // Set auth token using axios interceptor
      api.setAuthToken(response.data.token);
      
      // Save user preferences
      localStorage.setItem('userPreferences', JSON.stringify({
        email: response.data.user?.email || email,
        name: response.data.user?.name || 'User'
      }));
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      // Fallback for demo (when backend is not available)
      if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        // Mock successful login for demo
        const mockToken = 'mock-jwt-token-' + Date.now();
        api.setAuthToken(mockToken);
        localStorage.setItem('userPreferences', JSON.stringify({
          email,
          name: 'Demo User'
        }));
        navigate('/dashboard');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light" style={{ width: '100vw' }}>
      <div className="w-100" style={{ maxWidth: '400px', padding: '0 20px' }}>
        <div className="card shadow-lg border-0">
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <h2 className="fw-bold text-primary mb-2">OKJI</h2>
              <p className="text-muted">Sign in to your account</p>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <CustomInput
                label="Email Address"
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
                autoFocus
                icon="bi-envelope"
                helperText="We'll never share your email with anyone else"
              />

              <CustomInput
                label="Password"
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                icon="bi-lock"
                helperText="Your password must be 8-20 characters long"
              />

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="remember"
                />
                <label className="form-check-label" htmlFor="remember">
                  Remember me
                </label>
              </div>

              <CustomButton
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                icon="bi-box-arrow-in-right"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </CustomButton>
            </form>

        
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
