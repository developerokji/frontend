import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentAPI } from '../services/api';

const PaymentStatusPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [statusResult, setStatusResult] = useState(null);
  const [error, setError] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('orderId');
  const bookingId = queryParams.get('bookingId');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setVerifying(true);
        if (!orderId) {
          throw new Error('Order ID is missing from verification URL');
        }

        // Call backend verification API
        const data = await paymentAPI.verify(orderId);
        setStatusResult(data);
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError(err.response?.data?.message || err.message || 'Payment status verification failed.');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [orderId]);

  if (verifying) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <div className="text-center">
          <div className="spinner-grow text-primary mb-3" role="status" style={{ width: '4rem', height: '4rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="fw-bold text-dark mb-2">Verifying Payment</h4>
          <p className="text-muted">Confirming transaction status with the gateway. Please do not refresh or close this page.</p>
        </div>
      </div>
    );
  }

  if (error || !statusResult) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-lg mx-auto" style={{ maxWidth: '500px', borderRadius: '16px' }}>
          <div className="card-body text-center p-5">
            <div className="bg-danger-subtle text-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
              <i className="bi bi-x-circle-fill fs-1"></i>
            </div>
            <h3 className="card-title fw-bold text-dark mb-3">Verification Error</h3>
            <p className="card-text text-muted mb-4">{error || 'An error occurred during verification.'}</p>
            <div className="d-grid gap-2">
              {bookingId && (
                <button className="btn btn-primary py-2" onClick={() => navigate(`/payment/${bookingId}`)} style={{ borderRadius: '8px' }}>
                  Retry Payment
                </button>
              )}
              <button className="btn btn-outline-secondary py-2" onClick={() => navigate('/dashboard')} style={{ borderRadius: '8px' }}>
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = statusResult.verified || statusResult.status === 'SUCCESS';

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-lg mx-auto overflow-hidden" style={{ maxWidth: '550px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(15px)' }}>
        {/* Colorful top band */}
        <div style={{ height: '8px', background: isSuccess ? 'linear-gradient(45deg, #11998e, #38ef7d)' : 'linear-gradient(45deg, #ff416c, #ff4b2b)' }}></div>
        
        <div className="card-body text-center p-5">
          {isSuccess ? (
            // Success view
            <>
              <div className="bg-success-subtle text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-4 animate-bounce" style={{ width: '90px', height: '90px' }}>
                <i className="bi bi-check-circle-fill fs-1" style={{ fontSize: '3rem' }}></i>
              </div>
              <h3 className="card-title fw-bold text-success mb-2">Payment Successful!</h3>
              <p className="text-muted mb-4">Your booking has been confirmed. We've sent a receipt to your email.</p>
              
              <div className="bg-light rounded-3 p-4 text-start mb-4 border border-light-subtle">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small fw-semibold uppercase">Booking ID</span>
                  <span className="fw-bold text-dark">#{bookingId || 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small fw-semibold uppercase">Order ID</span>
                  <span className="fw-semibold text-dark text-truncate" style={{ maxWidth: '200px' }}>{orderId || 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small fw-semibold uppercase">Payment Method</span>
                  <span className="fw-semibold text-dark">{statusResult.paymentMethod || 'N/A'}</span>
                </div>
                <hr className="my-2 opacity-10" />
                <div className="d-flex justify-content-between">
                  <span className="fw-bold text-dark">Amount Paid</span>
                  <span className="fw-bold text-success fs-5">₹{statusResult.amount?.toFixed(2)}</span>
                </div>
              </div>
            </>
          ) : (
            // Failure view
            <>
              <div className="bg-danger-subtle text-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '90px', height: '90px' }}>
                <i className="bi bi-x-circle-fill fs-1" style={{ fontSize: '3rem' }}></i>
              </div>
              <h3 className="card-title fw-bold text-danger mb-2">Payment Failed</h3>
              <p className="text-muted mb-4">{statusResult.reason || 'The transaction could not be processed.'}</p>
              
              <div className="bg-light rounded-3 p-4 text-start mb-4 border border-light-subtle">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small fw-semibold uppercase">Booking ID</span>
                  <span className="fw-bold text-dark">#{bookingId || 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small fw-semibold uppercase">Order ID</span>
                  <span className="fw-semibold text-dark text-truncate" style={{ maxWidth: '200px' }}>{orderId || 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small fw-semibold uppercase">Status</span>
                  <span className="fw-bold text-danger uppercase">{statusResult.status || 'FAILED'}</span>
                </div>
              </div>
            </>
          )}

          <div className="d-grid gap-2">
            {!isSuccess && bookingId && (
              <button className="btn btn-primary py-2 fw-semibold" onClick={() => navigate(`/payment/${bookingId}`)} style={{ borderRadius: '10px' }}>
                <i className="bi bi-arrow-clockwise me-2"></i>Retry Payment
              </button>
            )}
            <button className="btn btn-outline-dark py-2 fw-semibold" onClick={() => navigate('/dashboard')} style={{ borderRadius: '10px' }}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;
