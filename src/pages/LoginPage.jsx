import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

    // Simulate API call
    setTimeout(() => {
      // Check credentials
      if (email === 'developer.okji@gmail.com' && password === 'Developer@2024') {
        // Save auth token to localStorage
        localStorage.setItem('authToken', JSON.stringify('mock-auth-token-12345'));
        
        // Save user preferences
        localStorage.setItem('userPreferences', JSON.stringify({
          email: email,
          name: 'Developer',
          theme: 'light',
          language: 'en',
          itemsPerPage: 10
        }));

        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
      setLoading(false);
    }, 1000);
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
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-medium">
                  <i className="bi bi-envelope me-2"></i>
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-medium">
                  <i className="bi bi-lock me-2"></i>
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="remember"
                  />
                  <label className="form-check-label" htmlFor="remember">
                    Remember me
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </>
                )}
              </button>
            </form>

        
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
