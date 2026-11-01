import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI, paymentAPI } from '../services/api';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cashfreeMode, setCashfreeMode] = useState('dev');
  const [modeLoading, setModeLoading] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const data = await bookingsAPI.getById(bookingId);
        if (data) {
          setBooking(data);
        } else {
          setError('Booking not found');
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err.response?.data?.message || 'Failed to load booking details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCashfreeMode = async () => {
      try {
        const data = await paymentAPI.getCashfreeSettings();
        if (data?.settings?.server) {
          const isProd = ['prod', 'pro', 'production', 'live'].includes(
            String(data.settings.server).toLowerCase()
          );
          setCashfreeMode(isProd ? 'prod' : 'dev');
        }
      } catch (err) {
        console.warn('Could not load Cashfree mode:', err);
      }
    };

    const checkExistingTransaction = async () => {
      try {
        const tx = await paymentAPI.getStatusByBooking(bookingId);
        if (tx?.orderId) {
          setPendingOrderId(tx.orderId);
          if (tx.status === 'initiate' || tx.status === 'pending') {
            const verifyRes = await paymentAPI.verify(tx.orderId);
            if (verifyRes?.verified || verifyRes?.status === 'success') {
              navigate(`/payment-success?orderId=${encodeURIComponent(tx.orderId)}&bookingId=${encodeURIComponent(bookingId)}`);
            }
          }
        }
      } catch (err) {
        console.warn('Could not check existing payment status:', err);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
      fetchCashfreeMode();
      checkExistingTransaction();
    }
  }, [bookingId, navigate]);

  const handleToggleCashfreeMode = async (newMode) => {
    if (newMode === cashfreeMode || modeLoading) return;
    try {
      setModeLoading(true);
      setError(null);
      await paymentAPI.setCashfreeServerMode(newMode);
      setCashfreeMode(newMode);
    } catch (err) {
      console.error('Failed to switch Cashfree mode:', err);
      setError(err.response?.data?.message || 'Failed to switch payment environment mode.');
    } finally {
      setModeLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      setError(null);

      // 1. Create a payment order/session on Cashfree via our backend
      const res = await paymentAPI.create(Number(bookingId));
      
      if (!res || !res.paymentSessionId) {
        throw new Error('Failed to create payment session. No session ID returned.');
      }

      setPendingOrderId(res.orderId);

      // 2. Initialize Cashfree Web SDK
      if (!window.Cashfree) {
        throw new Error('Cashfree SDK failed to load. Please refresh the page and try again.');
      }

      const sdkMode =
        res.environment ||
        (cashfreeMode === 'prod'
          ? 'production'
          : window.location.hostname !== 'localhost'
            ? 'production'
            : 'sandbox');

      const cashfree = window.Cashfree({
        mode: sdkMode,
      });

      // 3. Initiate Cashfree Checkout in modal mode so completion resolves in-page (works on localhost & hosted)
      const checkoutOptions = {
        paymentSessionId: res.paymentSessionId,
        redirectTarget: '_modal',
      };

      console.log('Initiating Cashfree checkout with options:', { ...checkoutOptions, mode: sdkMode });
      const result = await cashfree.checkout(checkoutOptions);

      if (result?.error) {
        setError(result.error.message || 'Payment was not completed or was cancelled.');
        return;
      }

      // 4. Redirect to verification page immediately after modal checkout completes
      navigate(`/payment-success?orderId=${encodeURIComponent(res.orderId)}&bookingId=${encodeURIComponent(bookingId)}`);

    } catch (err) {
      console.error('Payment checkout initiation failed:', err);
      setError(err.response?.data?.message || err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted fw-semibold">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-lg mx-auto" style={{ maxWidth: '500px', borderRadius: '16px' }}>
          <div className="card-body text-center p-5">
            <div className="bg-danger-subtle text-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
              <i className="bi bi-exclamation-triangle-fill fs-1"></i>
            </div>
            <h3 className="card-title fw-bold text-dark mb-3">Error Occurred</h3>
            <p className="card-text text-muted mb-4">{error}</p>
            <div className="d-flex justify-content-center gap-2">
              <button className="btn btn-primary px-4 py-2" onClick={() => navigate('/lead')} style={{ borderRadius: '8px' }}>
                Back to Leads
              </button>
              <button className="btn btn-outline-secondary px-4 py-2" onClick={() => navigate('/dashboard')} style={{ borderRadius: '8px' }}>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 py-lg-5" style={{ maxWidth: '1000px' }}>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <button className="btn btn-link text-decoration-none text-muted p-0" onClick={() => navigate('/lead')}>
              <i className="bi bi-arrow-left me-1"></i>Back to Leads
            </button>
            <span className="text-muted">|</span>
            <button className="btn btn-link text-decoration-none text-muted p-0" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
          </div>
          <h2 className="fw-bold mb-0 text-gradient" style={{ background: 'linear-gradient(45deg, #12c2e9, #c471ed, #f64f59)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Complete Your Payment
          </h2>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="btn-group btn-group-sm" role="group" aria-label="Payment Gateway Environment">
            <button
              type="button"
              className={`btn ${cashfreeMode !== 'prod' ? 'btn-warning fw-semibold' : 'btn-outline-secondary'}`}
              disabled={modeLoading || paymentLoading}
              onClick={() => handleToggleCashfreeMode('dev')}
            >
              <i className="bi bi-bug me-1"></i>UAT (Sandbox)
            </button>
            <button
              type="button"
              className={`btn ${cashfreeMode === 'prod' ? 'btn-danger fw-semibold' : 'btn-outline-secondary'}`}
              disabled={modeLoading || paymentLoading}
              onClick={() => handleToggleCashfreeMode('prod')}
            >
              <i className="bi bi-shield-check me-1"></i>Production
            </button>
          </div>

          <span className="badge bg-warning-subtle text-warning border border-warning px-3 py-2 rounded-pill fw-semibold">
            {booking.customerPayment === 'received' ? 'Payment Received' : 'Payment Pending'}
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show border-0 shadow-sm mb-4" role="alert" style={{ borderRadius: '12px' }}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setError(null)}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Left Side: Booking details */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' }}>
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold text-dark mb-0">Booking Information</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-6">
                  <label className="text-muted small fw-semibold uppercase">Booking ID</label>
                  <p className="fw-bold text-dark mb-0">#{booking.id}</p>
                </div>
                <div className="col-6">
                  <label className="text-muted small fw-semibold uppercase">Order ID</label>
                  <p className="fw-bold text-dark mb-0">{booking.bookingOrderId || 'N/A'}</p>
                </div>
                <div className="col-6">
                  <label className="text-muted small fw-semibold uppercase">Scheduled Date</label>
                  <p className="fw-semibold text-dark mb-0">
                    <i className="bi bi-calendar3 me-2 text-primary"></i>
                    {booking.workDate ? new Date(booking.workDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="col-6">
                  <label className="text-muted small fw-semibold uppercase">Time Slot</label>
                  <p className="fw-semibold text-dark mb-0">
                    <i className="bi bi-clock me-2 text-primary"></i>
                    {booking.workTime || 'N/A'}
                  </p>
                </div>
                <div className="col-12">
                  <hr className="my-2 opacity-10" />
                </div>
                <div className="col-12">
                  <h6 className="fw-bold text-muted uppercase small mb-3">Client Details</h6>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-center text-dark">
                      <i className="bi bi-person-fill me-3 text-secondary"></i>
                      <span>{booking.clientName || 'N/A'}</span>
                    </div>
                    <div className="d-flex align-items-center text-dark">
                      <i className="bi bi-envelope-fill me-3 text-secondary"></i>
                      <span>{booking.clientEmail || 'N/A'}</span>
                    </div>
                    <div className="d-flex align-items-center text-dark">
                      <i className="bi bi-telephone-fill me-3 text-secondary"></i>
                      <span>{booking.clientPhone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Price details & Checkout */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' }}>
            <div className="card-header bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold text-dark mb-0">Payment Summary</h5>
              <span className={`badge ${cashfreeMode === 'prod' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                {cashfreeMode === 'prod' ? 'PRODUCTION' : 'UAT / SANDBOX'}
              </span>
            </div>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal</span>
                <span className="fw-semibold text-dark">₹{Number(booking.subTotal || 0).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Visiting Fee</span>
                <span className="fw-semibold text-dark">₹{Number(booking.visitingFee || 0).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Platform Fee</span>
                <span className="fw-semibold text-dark">₹{Number(booking.platformFee || 0).toFixed(2)}</span>
              </div>

              <hr className="opacity-10" />

              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fw-bold text-dark">Total Amount</span>
                <span className="fs-4 fw-bold text-primary">₹{Number(booking.total || 0).toFixed(2)}</span>
              </div>

              {/* Cashfree branding and trust badges */}
              <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 mb-4">
                <div className="d-flex align-items-center">
                  <i className="bi bi-shield-check-fill text-success fs-3 me-2"></i>
                  <div>
                    <p className="mb-0 fw-semibold text-dark small">Secured by Cashfree</p>
                    <p className="mb-0 text-muted extra-small" style={{ fontSize: '11px' }}>
                      {cashfreeMode === 'prod' ? 'Live Production Gateway' : 'UAT Sandbox Testing Mode'}
                    </p>
                  </div>
                </div>
                <div className="d-flex gap-1 text-muted fs-4">
                  <i className="bi bi-credit-card"></i>
                  <i className="bi bi-phone"></i>
                  <i className="bi bi-wallet"></i>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center shadow-lg hover-scale transition-all"
                style={{ borderRadius: '12px', background: 'linear-gradient(45deg, #12c2e9, #c471ed)' }}
                disabled={paymentLoading || booking.customerPayment === 'received'}
                onClick={handlePayment}
              >
                {paymentLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Initializing Payment...
                  </>
                ) : booking.customerPayment === 'received' ? (
                  <>
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Already Paid
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill me-2"></i>
                    Pay Now ₹{Number(booking.total || 0).toFixed(2)} ({cashfreeMode === 'prod' ? 'Prod' : 'UAT'})
                  </>
                )}
              </button>

              {pendingOrderId && booking.customerPayment !== 'received' && (
                <button
                  type="button"
                  className="btn btn-outline-success w-100 mt-2 py-2 fw-semibold"
                  style={{ borderRadius: '10px' }}
                  onClick={() =>
                    navigate(
                      `/payment-success?orderId=${encodeURIComponent(pendingOrderId)}&bookingId=${encodeURIComponent(bookingId)}`
                    )
                  }
                >
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Verify Payment Status ({pendingOrderId})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
