import React from 'react';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ show, handleClose, bookingData }) => {
  const navigate = useNavigate();

  if (!show) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { class: 'bg-success', label: 'Active' },
      'on_going': { class: 'bg-primary', label: 'On Going' },
      'pending': { class: 'bg-warning text-dark', label: 'Pending' },
      'review': { class: 'bg-warning text-dark', label: 'Review' },
      'cancel': { class: 'bg-danger', label: 'Cancelled' },
      'payment_pending': { class: 'bg-info text-dark', label: 'Payment Pending' },
      'completed': { class: 'bg-primary', label: 'Completed' },
      'close': { class: 'bg-secondary', label: 'Closed' },
    };
    const statusInfo = statusMap[status] || { class: 'bg-secondary', label: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const getPaymentBadge = (status) => {
    const statusMap = {
      'not_received': { class: 'bg-danger', label: 'Not Received' },
      'received': { class: 'bg-success', label: 'Received' },
      'not_transfer': { class: 'bg-danger', label: 'Not Transferred' },
      'transferred': { class: 'bg-success', label: 'Transferred' }
    };
    const statusInfo = statusMap[status] || { class: 'bg-secondary', label: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const canPay =
    bookingData &&
    bookingData.customerPayment !== 'received' &&
    bookingData.workStatus !== 'cancel';

  const handleProceedToPayment = () => {
    if (!bookingData?.id) return;
    handleClose();
    navigate(`/payment/${bookingData.id}`);
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header border-bottom bg-light">
            <h5 className="modal-title fw-semibold text-primary">
              <i className="bi bi-file-text me-2"></i>
              Booking Details
            </h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body py-4">
            {bookingData && (
              <div className="row g-4">
                {/* Booking Information */}
                <div className="col-12">
                  <h6 className="fw-bold mb-3 text-primary">
                    <i className="bi bi-info-circle me-2"></i>Booking Information
                  </h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="text-muted small mb-1">Booking Order ID</label>
                          <div className="fw-semibold">{bookingData.bookingOrderId || 'N/A'}</div>
                        </div>
                        <div className="col-md-6">
                          <label className="text-muted small mb-1">Created At</label>
                          <div className="fw-semibold">{formatDate(bookingData.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div className="col-12">
                  <h6 className="fw-bold mb-3 text-primary">
                    <i className="bi bi-person me-2"></i>Client Information
                  </h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="text-muted small mb-1">Client Name</label>
                          <div className="fw-semibold">{bookingData.clientName || 'N/A'}</div>
                        </div>
                        <div className="col-md-4">
                          <label className="text-muted small mb-1">Client Phone</label>
                          <div className="fw-semibold">{bookingData.clientPhone || 'N/A'}</div>
                        </div>
                        <div className="col-md-4">
                          <label className="text-muted small mb-1">Client Email</label>
                          <div className="fw-semibold">{bookingData.clientEmail || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="col-12">
                  <h6 className="fw-bold mb-3 text-primary">
                    <i className="bi bi-calendar-check me-2"></i>Work Information
                  </h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="text-muted small mb-1">Work Date</label>
                          <div className="fw-semibold">{formatDate(bookingData.workDate)}</div>
                        </div>
                        <div className="col-md-4">
                          <label className="text-muted small mb-1">Work Time</label>
                          <div className="fw-semibold">{formatTime(bookingData.workTime)}</div>
                        </div>
                        <div className="col-md-4">
                          <label className="text-muted small mb-1">Location</label>
                          <div className="fw-semibold">{bookingData.locationName || bookingData.fullAddress || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="col-12">
                  <h6 className="fw-bold mb-3 text-primary">
                    <i className="bi bi-currency-rupee me-2"></i>Payment Information
                  </h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-3">
                          <label className="text-muted small mb-1">Sub Total</label>
                          <div className="fw-bold">{formatCurrency(bookingData.subTotal)}</div>
                        </div>
                        <div className="col-md-3">
                          <label className="text-muted small mb-1">Visiting Fee</label>
                          <div className="fw-semibold">{formatCurrency(bookingData.visitingFee)}</div>
                        </div>
                        <div className="col-md-3">
                          <label className="text-muted small mb-1">Platform Fee</label>
                          <div className="fw-semibold">{formatCurrency(bookingData.platformFee)}</div>
                        </div>
                        <div className="col-md-3">
                          <label className="text-muted small mb-1">Total</label>
                          <div className="fw-bold text-success">{formatCurrency(bookingData.total)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div className="col-12">
                  <h6 className="fw-bold mb-3 text-primary">
                    <i className="bi bi-list-check me-2"></i>Status Information
                  </h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="text-muted small mb-1">Work Status</label>
                          <div>{getStatusBadge(bookingData.workStatus)}</div>
                        </div>
                        <div className="col-md-4">
                          <label className="text-muted small mb-1">Customer Payment</label>
                          <div>{getPaymentBadge(bookingData.customerPayment)}</div>
                        </div>
                        <div className="col-md-4">
                          <label className="text-muted small mb-1">Partner Payment</label>
                          <div>{getPaymentBadge(bookingData.partnerPayment)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer border-top d-flex justify-content-between">
            <div>
              {bookingData?.customerPayment === 'received' && (
                <span className="badge bg-success-subtle text-success border border-success px-3 py-2">
                  <i className="bi bi-check-circle-fill me-1"></i>Payment Received
                </span>
              )}
            </div>
            <div className="d-flex gap-2">
              {canPay && (
                <button
                  type="button"
                  className="btn btn-success fw-semibold"
                  onClick={handleProceedToPayment}
                >
                  <i className="bi bi-credit-card me-2"></i>
                  Make Payment ({formatCurrency(bookingData.total)})
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                <i className="bi bi-x-circle me-2"></i>Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
