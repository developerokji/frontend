import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../services/api';

const WORK_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'review', label: 'Review' },
  { value: 'active', label: 'Active (Partner Assigned)' },
  { value: 'on_going', label: 'On Going (Work Started)' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'close', label: 'Closed (Completed)' },
  { value: 'cancel', label: 'Cancelled' },
];

const CUSTOMER_PAYMENT_OPTIONS = [
  { value: 'not_received', label: 'Not Received' },
  { value: 'received', label: 'Received' },
];

const PARTNER_PAYMENT_OPTIONS = [
  { value: 'not_transfer', label: 'Not Transferred' },
  { value: 'transfer', label: 'Transferred' },
];

const BookingModal = ({
  show,
  handleClose,
  bookingData,
  initialTab = 'details',
  onBookingUpdated,
}) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(initialTab || 'details');
  const [detailData, setDetailData] = useState(bookingData || null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status form state
  const [workStatus, setWorkStatus] = useState('pending');
  const [customerPayment, setCustomerPayment] = useState('not_received');
  const [partnerPayment, setPartnerPayment] = useState('not_transfer');
  const [cancellationReason, setCancellationReason] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);

  // Reassign state
  const [eligibleInfo, setEligibleInfo] = useState(null);
  const [eligibleLoading, setEligibleLoading] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [reassignSaving, setReassignSaving] = useState(false);

  // Feedback alerts
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const syncFormWithBooking = (b) => {
    if (!b) return;
    setWorkStatus(b.workStatus || 'pending');
    setCustomerPayment(b.customerPayment || 'not_received');
    setPartnerPayment(
      b.partnerPayment === 'transferred' ? 'transfer' : b.partnerPayment || 'not_transfer'
    );
    setCancellationReason(b.cancellationReason || '');
  };

  const fetchBookingDetail = async (id) => {
    if (!id) return;
    setDetailLoading(true);
    try {
      const data = await bookingsAPI.getById(id);
      if (data) {
        setDetailData(data);
        syncFormWithBooking(data);
      }
    } catch (err) {
      console.error('Failed to fetch booking details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchEligiblePartners = async (id) => {
    if (!id) return;
    setEligibleLoading(true);
    try {
      const data = await bookingsAPI.getEligiblePartners(id);
      setEligibleInfo(data);
      const list = data?.partners || data?.eligiblePartners || [];
      const firstOtherPartner = list.find(
        (p) => !(p.isCurrentPartner || p.isCurrentlyAssigned)
      );
      setSelectedPartnerId(firstOtherPartner ? String(firstOtherPartner.partnerId) : '');
    } catch (err) {
      console.error('Failed to fetch eligible partners:', err);
      setFeedback({
        type: 'danger',
        message:
          err.response?.data?.message ||
          err.message ||
          'Failed to load eligible partners for this pincode.',
      });
    } finally {
      setEligibleLoading(false);
    }
  };

  useEffect(() => {
    if (show && bookingData) {
      setActiveTab(initialTab || 'details');
      setDetailData(bookingData);
      syncFormWithBooking(bookingData);
      setFeedback({ type: '', message: '' });
      setReassignReason('');
      fetchBookingDetail(bookingData.id);
      fetchEligiblePartners(bookingData.id);
    }
  }, [show, bookingData?.id, initialTab]);

  if (!show) return null;

  const currentBooking = detailData || bookingData || {};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return String(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return String(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = String(timeString).split(':');
    const hour = parseInt(hours, 10);
    if (Number.isNaN(hour)) return timeString;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { class: 'bg-success', label: 'Active' },
      on_going: { class: 'bg-primary', label: 'On Going' },
      pending: { class: 'bg-warning text-dark', label: 'Pending' },
      review: { class: 'bg-warning text-dark', label: 'Review' },
      cancel: { class: 'bg-danger', label: 'Cancelled' },
      payment_pending: { class: 'bg-info text-dark', label: 'Payment Pending' },
      completed: { class: 'bg-primary', label: 'Completed' },
      close: { class: 'bg-secondary', label: 'Closed' },
    };
    const statusInfo = statusMap[status] || { class: 'bg-secondary', label: status || 'N/A' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const getLeadStatusBadge = (status) => {
    const map = {
      assigned: { class: 'bg-success', label: 'Assigned' },
      reassigned: { class: 'bg-warning text-dark', label: 'Re-assigned' },
      completed: { class: 'bg-primary', label: 'Completed' },
      cancelled: { class: 'bg-danger', label: 'Cancelled' },
    };
    const info = map[status] || { class: 'bg-secondary', label: status || 'N/A' };
    return <span className={`badge ${info.class}`}>{info.label}</span>;
  };

  const getPaymentBadge = (status) => {
    const statusMap = {
      not_received: { class: 'bg-danger', label: 'Not Received' },
      received: { class: 'bg-success', label: 'Received' },
      not_transfer: { class: 'bg-danger', label: 'Not Transferred' },
      transfer: { class: 'bg-success', label: 'Transferred' },
      transferred: { class: 'bg-success', label: 'Transferred' },
    };
    const statusInfo = statusMap[status] || { class: 'bg-secondary', label: status || 'N/A' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const canPay =
    currentBooking &&
    currentBooking.customerPayment !== 'received' &&
    currentBooking.workStatus !== 'cancel';

  const handleProceedToPayment = () => {
    if (!currentBooking?.id) return;
    handleClose();
    navigate(`/payment/${currentBooking.id}`);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!currentBooking?.id) return;

    setStatusSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        workStatus,
        customerPayment,
        partnerPayment,
      };
      if (workStatus === 'cancel') {
        payload.cancellationReason = cancellationReason.trim() || 'Cancelled by admin';
      }

      const response = await bookingsAPI.updateStatus(currentBooking.id, payload);
      const updated = response?.data || response;
      setDetailData(updated);
      syncFormWithBooking(updated);
      await fetchEligiblePartners(currentBooking.id);
      if (onBookingUpdated) {
        onBookingUpdated(updated);
      }
      setFeedback({
        type: 'success',
        message: 'Lead status and all related records updated successfully!',
      });
    } catch (err) {
      console.error('Status update error:', err);
      setFeedback({
        type: 'danger',
        message:
          err.response?.data?.message ||
          err.message ||
          'Failed to update lead status. Please try again.',
      });
    } finally {
      setStatusSaving(false);
    }
  };

  const handleReassignSubmit = async (autoAssign = false) => {
    if (!currentBooking?.id) return;
    if (!autoAssign && !selectedPartnerId) {
      setFeedback({
        type: 'warning',
        message: 'Please select an eligible partner or click Auto-Assign Next Eligible Partner.',
      });
      return;
    }

    setReassignSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        reason: reassignReason.trim() || 'Re-assigned by admin',
      };
      if (!autoAssign && selectedPartnerId) {
        payload.partnerId = Number(selectedPartnerId);
      }

      const response = await bookingsAPI.reassignPartner(currentBooking.id, payload);
      const updated = response?.data || response;
      setDetailData(updated);
      syncFormWithBooking(updated);
      setReassignReason('');
      await fetchEligiblePartners(currentBooking.id);
      if (onBookingUpdated) {
        onBookingUpdated(updated);
      }
      setFeedback({
        type: 'success',
        message: `Lead successfully re-assigned to ${updated?.acceptedPartnerName || 'partner'}!`,
      });
    } catch (err) {
      console.error('Reassign error:', err);
      setFeedback({
        type: 'danger',
        message:
          err.response?.data?.message ||
          err.message ||
          'Failed to re-assign lead. Please check partner eligibility.',
      });
    } finally {
      setReassignSaving(false);
    }
  };

  const eligiblePartners = eligibleInfo?.partners || eligibleInfo?.eligiblePartners || [];
  const otherEligiblePartners = eligiblePartners.filter(
    (p) => !(p.isCurrentPartner || p.isCurrentlyAssigned)
  );

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header border-bottom bg-light">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <h5 className="modal-title fw-semibold text-primary mb-0">
                <i className="bi bi-file-text me-2"></i>
                Lead #{currentBooking.bookingOrderId || currentBooking.id}
              </h5>
              {getStatusBadge(currentBooking.workStatus)}
              {currentBooking.pincode && (
                <span className="badge bg-dark-subtle text-dark border">
                  <i className="bi bi-geo-alt-fill me-1"></i>
                  Pincode: {currentBooking.pincode}
                </span>
              )}
            </div>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-4 pt-3 bg-white border-bottom">
            <ul className="nav nav-tabs border-bottom-0">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link fw-semibold ${activeTab === 'details' ? 'active text-primary' : 'text-muted'}`}
                  onClick={() => {
                    setActiveTab('details');
                    setFeedback({ type: '', message: '' });
                  }}
                >
                  <i className="bi bi-info-circle me-1"></i>
                  Lead Details
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link fw-semibold ${activeTab === 'status' ? 'active text-primary' : 'text-muted'}`}
                  onClick={() => {
                    setActiveTab('status');
                    setFeedback({ type: '', message: '' });
                  }}
                >
                  <i className="bi bi-pencil-square me-1"></i>
                  Change Status
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link fw-semibold ${activeTab === 'reassign' ? 'active text-primary' : 'text-muted'}`}
                  onClick={() => {
                    setActiveTab('reassign');
                    setFeedback({ type: '', message: '' });
                    fetchEligiblePartners(currentBooking.id);
                  }}
                >
                  <i className="bi bi-person-lines-fill me-1"></i>
                  Re-assign Partner
                  <span className="badge bg-primary-subtle text-primary ms-2">
                    {otherEligiblePartners.length} Eligible
                  </span>
                </button>
              </li>
            </ul>
          </div>

          <div className="modal-body py-4">
            {feedback.message && (
              <div
                className={`alert alert-${feedback.type || 'info'} alert-dismissible fade show mb-3`}
                role="alert"
              >
                <i
                  className={`bi ${
                    feedback.type === 'success'
                      ? 'bi-check-circle-fill'
                      : feedback.type === 'danger'
                        ? 'bi-exclamation-triangle-fill'
                        : 'bi-info-circle-fill'
                  } me-2`}
                ></i>
                {feedback.message}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setFeedback({ type: '', message: '' })}
                ></button>
              </div>
            )}

            {detailLoading && (
              <div className="text-center py-2 text-muted small">
                <span className="spinner-border spinner-border-sm me-2"></span>
                Refreshing lead details...
              </div>
            )}

            {/* ==================== TAB 1: LEAD DETAILS ==================== */}
            {activeTab === 'details' && (
              <div className="row g-4">
                {/* Booking & Partner Summary */}
                <div className="col-md-6">
                  <h6 className="fw-bold mb-2 text-primary">
                    <i className="bi bi-person me-2"></i>Client Information
                  </h6>
                  <div className="card bg-light h-100">
                    <div className="card-body">
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="text-muted small mb-1">Client Name</label>
                          <div className="fw-semibold">{currentBooking.clientName || 'N/A'}</div>
                        </div>
                        <div className="col-6">
                          <label className="text-muted small mb-1">Client Phone</label>
                          <div className="fw-semibold">{currentBooking.clientPhone || 'N/A'}</div>
                        </div>
                        <div className="col-12">
                          <label className="text-muted small mb-1">Client Email</label>
                          <div className="fw-semibold">{currentBooking.clientEmail || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0 text-primary">
                      <i className="bi bi-person-badge me-2"></i>Assigned Partner
                    </h6>
                    {currentBooking.workStatus !== 'close' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setActiveTab('reassign')}
                      >
                        <i className="bi bi-arrow-repeat me-1"></i>
                        Re-assign
                      </button>
                    )}
                  </div>
                  <div className="card bg-light h-100">
                    <div className="card-body">
                      {currentBooking.acceptedPartnerId ? (
                        <div className="row g-2">
                          <div className="col-6">
                            <label className="text-muted small mb-1">Partner Name</label>
                            <div className="fw-semibold">
                              {currentBooking.acceptedPartnerName ||
                                `Partner #${currentBooking.acceptedPartnerId}`}
                            </div>
                          </div>
                          <div className="col-6">
                            <label className="text-muted small mb-1">Partner Phone</label>
                            <div className="fw-semibold">
                              {currentBooking.acceptedPartnerPhone || 'N/A'}
                            </div>
                          </div>
                          <div className="col-12">
                            <label className="text-muted small mb-1">Assigned At</label>
                            <div className="fw-semibold">
                              {formatDateTime(currentBooking.acceptedAt)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex flex-column justify-content-center align-items-start h-100">
                          <span className="badge bg-warning text-dark mb-2">
                            No Partner Assigned
                          </span>
                          <span className="text-muted small">
                            Use the Re-assign Partner tab to assign an eligible partner for pincode{' '}
                            <strong>{currentBooking.pincode || 'N/A'}</strong>.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="col-12">
                  <h6 className="fw-bold mb-2 text-primary">
                    <i className="bi bi-calendar-check me-2"></i>Work & Address Information
                  </h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-3">
                          <label className="text-muted small mb-1">Work Date</label>
                          <div className="fw-semibold">{formatDate(currentBooking.workDate)}</div>
                        </div>
                        <div className="col-md-3">
                          <label className="text-muted small mb-1">Work Time</label>
                          <div className="fw-semibold">{formatTime(currentBooking.workTime)}</div>
                        </div>
                        <div className="col-md-2">
                          <label className="text-muted small mb-1">Pincode</label>
                          <div className="fw-semibold">{currentBooking.pincode || 'N/A'}</div>
                        </div>
                        <div className="col-md-4">
                          <label className="text-muted small mb-1">Address</label>
                          <div className="fw-semibold">
                            {currentBooking.fullAddress || currentBooking.locationName || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booked Services */}
                {Array.isArray(currentBooking.items) && currentBooking.items.length > 0 && (
                  <div className="col-12">
                    <h6 className="fw-bold mb-2 text-primary">
                      <i className="bi bi-tools me-2"></i>Booked Services
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Service</th>
                            <th className="text-center">Qty</th>
                            <th className="text-end">Price</th>
                            <th className="text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentBooking.items.map((item) => (
                            <tr key={item.id}>
                              <td>{item.serviceName || `Service #${item.serviceId}`}</td>
                              <td className="text-center">{item.qty}</td>
                              <td className="text-end">{formatCurrency(item.salePrice || item.price)}</td>
                              <td className="text-end fw-semibold">
                                {formatCurrency(item.amount || (item.salePrice || item.price) * item.qty)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Payment & Status Summary */}
                <div className="col-md-7">
                  <h6 className="fw-bold mb-2 text-primary">
                    <i className="bi bi-currency-rupee me-2"></i>Payment Breakdown
                  </h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-6 col-sm-3">
                          <label className="text-muted small mb-1">Sub Total</label>
                          <div className="fw-bold">{formatCurrency(currentBooking.subTotal)}</div>
                        </div>
                        <div className="col-6 col-sm-3">
                          <label className="text-muted small mb-1">Visiting Fee</label>
                          <div className="fw-semibold">
                            {formatCurrency(currentBooking.visitingFee)}
                          </div>
                        </div>
                        <div className="col-6 col-sm-3">
                          <label className="text-muted small mb-1">Platform Fee</label>
                          <div className="fw-semibold">
                            {formatCurrency(currentBooking.platformFee)}
                          </div>
                        </div>
                        <div className="col-6 col-sm-3">
                          <label className="text-muted small mb-1">Total</label>
                          <div className="fw-bold text-success">
                            {formatCurrency(currentBooking.total)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-5">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0 text-primary">
                      <i className="bi bi-list-check me-2"></i>Status Summary
                    </h6>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setActiveTab('status')}
                    >
                      <i className="bi bi-pencil-square me-1"></i>
                      Change Status
                    </button>
                  </div>
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row g-2">
                        <div className="col-4">
                          <label className="text-muted small mb-1">Work Status</label>
                          <div>{getStatusBadge(currentBooking.workStatus)}</div>
                        </div>
                        <div className="col-4">
                          <label className="text-muted small mb-1">Customer Pay</label>
                          <div>{getPaymentBadge(currentBooking.customerPayment)}</div>
                        </div>
                        <div className="col-4">
                          <label className="text-muted small mb-1">Partner Pay</label>
                          <div>{getPaymentBadge(currentBooking.partnerPayment)}</div>
                        </div>
                        {currentBooking.cancellationReason && (
                          <div className="col-12 mt-2">
                            <label className="text-muted small mb-1">Cancellation Reason</label>
                            <div className="text-danger small fw-semibold">
                              {currentBooking.cancellationReason}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lead Assignment History */}
                {Array.isArray(currentBooking.leadHistory) &&
                  currentBooking.leadHistory.length > 0 && (
                    <div className="col-12">
                      <h6 className="fw-bold mb-2 text-primary">
                        <i className="bi bi-clock-history me-2"></i>Lead Dispatch & Re-assignment
                        History
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Round</th>
                              <th>Partner</th>
                              <th>Phone</th>
                              <th>Lead Status</th>
                              <th>Assigned At</th>
                              <th>Ended At</th>
                              <th>Reason / Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentBooking.leadHistory.map((row) => (
                              <tr key={row.id}>
                                <td className="fw-semibold">#{row.dispatchRound}</td>
                                <td>{row.partnerName || `Partner #${row.partnerId}`}</td>
                                <td>{row.partnerPhone || 'N/A'}</td>
                                <td>{getLeadStatusBadge(row.status)}</td>
                                <td className="small">{formatDateTime(row.assignedAt)}</td>
                                <td className="small">{formatDateTime(row.endedAt)}</td>
                                <td className="small text-muted">
                                  {row.reassignmentReason || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* ==================== TAB 2: CHANGE STATUS ==================== */}
            {activeTab === 'status' && (
              <form onSubmit={handleStatusSubmit}>
                <div className="card border-0 bg-light mb-3">
                  <div className="card-body">
                    <h6 className="fw-bold text-primary mb-3">
                      <i className="bi bi-sliders me-2"></i>Update Lead & Payment Status
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Work Status</label>
                        <select
                          className="form-select"
                          value={workStatus}
                          onChange={(e) => setWorkStatus(e.target.value)}
                          disabled={statusSaving}
                        >
                          {WORK_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Customer Payment</label>
                        <select
                          className="form-select"
                          value={customerPayment}
                          onChange={(e) => setCustomerPayment(e.target.value)}
                          disabled={statusSaving}
                        >
                          {CUSTOMER_PAYMENT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Partner Payment</label>
                        <select
                          className="form-select"
                          value={partnerPayment}
                          onChange={(e) => setPartnerPayment(e.target.value)}
                          disabled={statusSaving}
                        >
                          {PARTNER_PAYMENT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {workStatus === 'cancel' && (
                        <div className="col-12">
                          <label className="form-label fw-semibold text-danger">
                            Cancellation Reason
                          </label>
                          <textarea
                            className="form-control"
                            rows="2"
                            placeholder="Enter reason for cancelling this lead..."
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            disabled={statusSaving}
                          />
                        </div>
                      )}
                    </div>

                    <div className="alert alert-info mt-3 mb-0 small">
                      <i className="bi bi-diagram-3 me-2"></i>
                      <strong>Automatic Table Sync:</strong> Saving changes updates{' '}
                      <code>bookings</code>, <code>booking_partner_leads</code> (status &amp; end
                      timestamps), <code>partner_availability</code> (active job counters),{' '}
                      <code>booking_logs</code>, and <code>lead_distribution_logs</code>.
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary fw-semibold"
                    disabled={statusSaving}
                  >
                    {statusSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Updating Status...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-2"></i>
                        Save Status Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ==================== TAB 3: RE-ASSIGN PARTNER ==================== */}
            {activeTab === 'reassign' && (
              <div>
                <div className="card bg-light border-0 mb-3">
                  <div className="card-body py-3">
                    <div className="row align-items-center g-3">
                      <div className="col-md-4">
                        <div className="text-muted small">Service Pincode</div>
                        <div className="fw-bold fs-6">
                          <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                          {eligibleInfo?.pincode || currentBooking.pincode || 'N/A'}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-muted small">Currently Assigned Partner</div>
                        <div className="fw-bold">
                          {currentBooking.acceptedPartnerId ? (
                            <>
                              {currentBooking.acceptedPartnerName ||
                                `Partner #${currentBooking.acceptedPartnerId}`}{' '}
                              <span className="text-muted fw-normal small">
                                ({currentBooking.acceptedPartnerPhone || 'N/A'})
                              </span>
                            </>
                          ) : (
                            <span className="text-warning-emphasis">Unassigned</span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4 text-md-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => fetchEligiblePartners(currentBooking.id)}
                          disabled={eligibleLoading || reassignSaving}
                        >
                          <i className="bi bi-arrow-clockwise me-1"></i>
                          Refresh Eligible Partners
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {currentBooking.workStatus === 'close' ? (
                  <div className="alert alert-warning">
                    <i className="bi bi-lock-fill me-2"></i>
                    This booking is already marked as <strong>Closed</strong>. Change the work
                    status first if you need to re-assign it.
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Re-assignment Reason / Admin Note
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Partner unavailable for scheduled time slot"
                        value={reassignReason}
                        onChange={(e) => setReassignReason(e.target.value)}
                        disabled={reassignSaving}
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold text-primary mb-0">
                        <i className="bi bi-people-fill me-2"></i>
                        Eligible Partners in Pincode{' '}
                        {eligibleInfo?.pincode || currentBooking.pincode || ''}
                      </h6>
                      {otherEligiblePartners.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary fw-semibold"
                          onClick={() => handleReassignSubmit(true)}
                          disabled={reassignSaving}
                        >
                          <i className="bi bi-magic me-1"></i>
                          Auto-Assign Next Best Partner
                        </button>
                      )}
                    </div>

                    {eligibleLoading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status"></div>
                        <div className="mt-2 text-muted small">
                          Checking active partners with valid subscriptions &amp; remaining leads...
                        </div>
                      </div>
                    ) : eligiblePartners.length === 0 ? (
                      <div className="alert alert-warning">
                        <i className="bi bi-exclamation-circle me-2"></i>
                        No eligible partners found for pincode{' '}
                        <strong>{eligibleInfo?.pincode || currentBooking.pincode || 'N/A'}</strong>.
                        An eligible partner must have an <strong>active account</strong>, map to this{' '}
                        <strong>service pincode</strong>, and hold an{' '}
                        <strong>active subscription with remaining leads &gt; 0</strong>.
                      </div>
                    ) : (
                      <div className="table-responsive mb-3">
                        <table className="table table-hover table-bordered align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th style={{ width: '50px' }} className="text-center">
                                Select
                              </th>
                              <th>Partner</th>
                              <th>Category</th>
                              <th>Availability</th>
                              <th>Active Jobs</th>
                              <th>Subscription Package</th>
                              <th>Remaining Leads</th>
                              <th>Valid Till</th>
                            </tr>
                          </thead>
                          <tbody>
                            {eligiblePartners.map((partner) => {
                              const isCurrent = Boolean(
                                partner.isCurrentPartner || partner.isCurrentlyAssigned
                              );
                              const isSelected =
                                String(selectedPartnerId) === String(partner.partnerId);
                              return (
                                <tr
                                  key={partner.partnerId}
                                  className={
                                    isCurrent
                                      ? 'table-secondary'
                                      : isSelected
                                        ? 'table-primary'
                                        : ''
                                  }
                                  style={{ cursor: isCurrent ? 'not-allowed' : 'pointer' }}
                                  onClick={() => {
                                    if (!isCurrent) {
                                      setSelectedPartnerId(String(partner.partnerId));
                                    }
                                  }}
                                >
                                  <td className="text-center">
                                    <input
                                      type="radio"
                                      name="eligiblePartner"
                                      className="form-check-input"
                                      disabled={isCurrent || reassignSaving}
                                      checked={isSelected}
                                      onChange={() =>
                                        setSelectedPartnerId(String(partner.partnerId))
                                      }
                                    />
                                  </td>
                                  <td>
                                    <div className="fw-semibold">
                                      {partner.partnerName || partner.name}
                                      {isCurrent && (
                                        <span className="badge bg-secondary ms-2">
                                          Current Partner
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-muted small">
                                      {partner.partnerPhone || partner.phone}
                                    </div>
                                  </td>
                                  <td>{partner.categoryName || 'N/A'}</td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        partner.isOnline && partner.isAvailable
                                          ? 'bg-success'
                                          : partner.isOnline
                                            ? 'bg-info text-dark'
                                            : 'bg-secondary'
                                      }`}
                                    >
                                      {partner.isOnline && partner.isAvailable
                                        ? 'Online & Available'
                                        : partner.isOnline
                                          ? 'Online'
                                          : 'Offline'}
                                    </span>
                                  </td>
                                  <td className="fw-semibold text-center">{partner.activeJobs}</td>
                                  <td>{partner.packageName || `Sub #${partner.subscriptionId}`}</td>
                                  <td>
                                    <span className="badge bg-success-subtle text-success border border-success">
                                      {partner.remainingLeads} / {partner.allocatedLeads} Leads
                                    </span>
                                  </td>
                                  <td className="small">{formatDate(partner.planEndDate)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-primary fw-semibold"
                        disabled={
                          reassignSaving ||
                          !selectedPartnerId ||
                          otherEligiblePartners.length === 0
                        }
                        onClick={() => handleReassignSubmit(false)}
                      >
                        {reassignSaving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Re-assigning Lead...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-person-check-fill me-2"></i>
                            Re-assign to Selected Partner
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer border-top d-flex justify-content-between">
            <div>
              {currentBooking?.customerPayment === 'received' && (
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
                  Make Payment ({formatCurrency(currentBooking.total)})
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
