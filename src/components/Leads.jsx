import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingModal from './common/BookingModal';
import PaginationDropdown from './common/PaginationDropdown';
import { bookingsAPI, paymentAPI } from '../services/api';
import { isAdminUser } from '../utils/auth';

const Leads = () => {
  const navigate = useNavigate();
  const isAdmin = isAdminUser();
  const [showModal, setShowModal] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState('details');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [cashfreeMode, setCashfreeMode] = useState('dev');
  const [limit, setLimit] = useState(25);

  // Load bookings
  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (statusFilter) {
        filters.workStatus = statusFilter;
      }
      const response = await bookingsAPI.getAll(currentPage, limit, searchTerm, filters);
      if (response.data && response.data.items) {
        setBookings(response.data.items);
        setTotalItems(response.data.meta?.totalItems || response.data.items.length);
        setTotalPages(response.data.meta?.totalPages || 1);
      } else if (response.items) {
        setBookings(response.items);
        setTotalItems(response.meta?.totalItems || response.items.length);
        setTotalPages(response.meta?.totalPages || 1);
      } else if (response.data) {
        setBookings(Array.isArray(response.data) ? response.data : []);
        setTotalItems(Array.isArray(response.data) ? response.data.length : 0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError(err.message || 'Failed to load bookings. Please try again.');
      setBookings([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Load Cashfree gateway mode (UAT 'dev' vs Production 'pro')
  const loadCashfreeMode = async () => {
    try {
      const data = await paymentAPI.getCashfreeSettings();
      if (data?.settings?.server) {
        const isProd = ['pro', 'prod', 'production', 'live'].includes(
          String(data.settings.server).toLowerCase()
        );
        setCashfreeMode(isProd ? 'pro' : 'dev');
      }
    } catch (err) {
      console.warn('Could not load Cashfree mode:', err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [currentPage, searchTerm, statusFilter, limit]);

  useEffect(() => {
    if (isAdmin) {
      loadCashfreeMode();
    }
  }, [isAdmin]);

  const handleOpenBookingModal = (booking, tab = 'details') => {
    setSelectedBooking(booking);
    setModalInitialTab(tab);
    setShowModal(true);
  };

  const handlePayBooking = (booking) => {
    navigate(`/payment/${booking.id}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const handleBookingUpdated = (updatedBooking) => {
    if (updatedBooking) {
      setSelectedBooking(updatedBooking);
    }
    loadBookings();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { class: 'bg-success-subtle text-success border border-success-subtle', label: 'Active' },
      on_going: { class: 'bg-primary-subtle text-primary border border-primary-subtle', label: 'On Going' },
      pending: { class: 'bg-warning-subtle text-dark border border-warning-subtle', label: 'Pending' },
      review: { class: 'bg-warning-subtle text-dark border border-warning-subtle', label: 'Review' },
      cancel: { class: 'bg-danger-subtle text-danger border border-danger-subtle', label: 'Cancelled' },
      payment_pending: { class: 'bg-info-subtle text-dark border border-info-subtle', label: 'Payment Pending' },
      completed: { class: 'bg-primary-subtle text-primary border border-primary-subtle', label: 'Completed' },
      close: { class: 'bg-secondary-subtle text-secondary border border-secondary-subtle', label: 'Closed' },
    };
    const statusInfo = statusMap[status] || { class: 'bg-secondary-subtle text-secondary', label: status || 'N/A' };
    return <span className={`badge ${statusInfo.class} fw-medium`}>{statusInfo.label}</span>;
  };

  const getPaymentBadge = (status) => {
    const statusMap = {
      not_received: { class: 'bg-danger-subtle text-danger border border-danger-subtle', label: 'Unpaid' },
      received: { class: 'bg-success-subtle text-success border border-success-subtle', label: 'Received' },
      not_transfer: { class: 'bg-danger-subtle text-danger border border-danger-subtle', label: 'Not Transferred' },
      transfer: { class: 'bg-success-subtle text-success border border-success-subtle', label: 'Transferred' },
      transferred: { class: 'bg-success-subtle text-success border border-success-subtle', label: 'Transferred' },
    };
    const statusInfo = statusMap[status] || { class: 'bg-secondary-subtle text-secondary', label: status || 'N/A' };
    return <span className={`badge ${statusInfo.class} fw-medium`}>{statusInfo.label}</span>;
  };

  const isBookingPayable = (record) => {
    if (!record) return false;
    return record.customerPayment !== 'received' && record.workStatus !== 'cancel';
  };

  const renderActionButtons = (record) => (
    <div className="d-inline-flex align-items-center gap-1 flex-nowrap">
      <button
        type="button"
        className="btn btn-sm btn-primary px-2 py-1"
        onClick={() => handleOpenBookingModal(record, 'details')}
        title="View Lead Details"
      >
        <i className="bi bi-eye"></i>
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-warning px-2 py-1"
        onClick={() => handleOpenBookingModal(record, 'status')}
        title="Change Lead Status"
      >
        <i className="bi bi-pencil-square"></i>
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-info px-2 py-1"
        onClick={() => handleOpenBookingModal(record, 'reassign')}
        title="Re-assign Partner"
      >
        <i className="bi bi-person-lines-fill"></i>
      </button>
      {isBookingPayable(record) ? (
        <button
          type="button"
          className="btn btn-sm btn-success px-2 py-1 text-nowrap"
          onClick={() => handlePayBooking(record)}
          title={`Pay ${formatCurrency(record.total)}`}
        >
          <i className="bi bi-credit-card me-1"></i>Pay
        </button>
      ) : record.customerPayment === 'received' ? (
        <span
          className="badge bg-success-subtle text-success border border-success px-2 py-1 text-nowrap"
          title="Payment Completed"
        >
          <i className="bi bi-check-circle-fill me-1"></i>Paid
        </span>
      ) : null}
    </div>
  );

  return (
    <div className="container-fluid p-2 p-md-3 p-xl-4 w-100 min-w-0">
      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <h4 className="mb-0 fw-bold">Leads</h4>
          <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1">
            {totalItems} Total
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {isAdmin && (
            <button
              type="button"
              className={`btn btn-sm ${
                cashfreeMode === 'pro' ? 'btn-outline-danger' : 'btn-outline-warning text-dark'
              }`}
              onClick={() => navigate('/settings')}
              title="Click to configure Payment Gateway in Settings"
            >
              <i
                className={`bi ${
                  cashfreeMode === 'pro' ? 'bi-lightning-charge-fill' : 'bi-tools'
                } me-1`}
              ></i>
              Gateway: {cashfreeMode === 'pro' ? 'Production' : 'UAT (Sandbox)'}
              <i className="bi bi-gear ms-2"></i>
            </button>
          )}

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={loadBookings}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="card shadow-sm border-0 w-100 min-w-0">
        <div className="card-body p-2 p-sm-3 w-100 min-w-0">
          {/* Filters Toolbar */}
          <div className="row g-2 mb-3 align-items-center">
            <div className="col-12 col-md-5 col-lg-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search order ID, client, phone, partner, pincode..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="col-6 col-md-4 col-lg-4">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="">All Work Statuses</option>
                <option value="pending">Pending</option>
                <option value="review">Review</option>
                <option value="active">Active</option>
                <option value="on_going">On Going</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="close">Closed</option>
                <option value="cancel">Cancelled</option>
              </select>
            </div>

            <div className="col-6 col-md-3 col-lg-3">
              <PaginationDropdown
                limit={limit}
                onLimitChange={handleLimitChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="alert alert-danger py-2 px-3 mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={loadBookings}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
              <span className="text-muted">Loading leads...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
              <div className="text-muted">No leads found</div>
            </div>
          ) : (
            <>
              {/* Desktop & Laptop Table View (fits 100% zoom without horizontal overflow) */}
              <div className="d-none d-md-block table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="ps-3">Lead / Service</th>
                      <th scope="col">Client</th>
                      <th scope="col">Schedule</th>
                      <th scope="col">Partner</th>
                      <th scope="col">Total</th>
                      <th scope="col">Status & Payment</th>
                      <th scope="col" className="text-end pe-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((record) => (
                      <tr key={record.id}>
                        {/* 1. Lead ID + Service */}
                        <td className="ps-3">
                          <div
                            className="fw-bold text-primary small cursor-pointer"
                            onClick={() => handleOpenBookingModal(record, 'details')}
                          >
                            {record.bookingOrderId || `#${record.id}`}
                          </div>
                          <div
                            className="text-dark fw-medium text-truncate"
                            style={{ maxWidth: '170px' }}
                            title={record.serviceName || 'N/A'}
                          >
                            {record.serviceName || 'N/A'}
                          </div>
                        </td>

                        {/* 2. Client Name + Phone */}
                        <td>
                          <div
                            className="fw-semibold text-dark text-truncate"
                            style={{ maxWidth: '150px' }}
                            title={record.clientName || 'N/A'}
                          >
                            {record.clientName || 'N/A'}
                          </div>
                          <div className="text-muted small text-nowrap">
                            <i className="bi bi-telephone me-1"></i>
                            {record.clientPhone || 'N/A'}
                          </div>
                        </td>

                        {/* 3. Date + Time */}
                        <td className="text-nowrap">
                          <div className="fw-medium text-dark small">{formatDate(record.workDate)}</div>
                          <div className="text-muted small">
                            <i className="bi bi-clock me-1"></i>
                            {formatTime(record.workTime)}
                          </div>
                        </td>

                        {/* 4. Partner + Pincode */}
                        <td>
                          {record.acceptedPartnerName ? (
                            <div
                              className="fw-semibold text-dark text-truncate"
                              style={{ maxWidth: '140px' }}
                              title={record.acceptedPartnerName}
                            >
                              {record.acceptedPartnerName}
                            </div>
                          ) : (
                            <span className="badge bg-warning-subtle text-dark border">
                              Unassigned
                            </span>
                          )}
                          {record.pincode && (
                            <div className="text-muted small text-nowrap">
                              <i className="bi bi-geo-alt me-1"></i>
                              {record.pincode}
                            </div>
                          )}
                        </td>

                        {/* 5. Total */}
                        <td className="text-nowrap">
                          <span className="fw-bold text-dark">{formatCurrency(record.total)}</span>
                        </td>

                        {/* 6. Status & Payment Badges */}
                        <td>
                          <div className="d-flex flex-wrap align-items-center gap-1">
                            {getStatusBadge(record.workStatus)}
                            {getPaymentBadge(record.customerPayment)}
                          </div>
                        </td>

                        {/* 7. Actions (Always Horizontal) */}
                        <td className="text-end pe-3 text-nowrap">
                          {renderActionButtons(record)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Small Screen Card View (< 768px) */}
              <div className="d-md-none d-flex flex-column gap-2">
                {bookings.map((record) => (
                  <div key={record.id} className="border rounded-3 p-3 bg-white shadow-sm">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <div>
                        <div className="fw-bold text-primary small">
                          {record.bookingOrderId || `#${record.id}`}
                        </div>
                        <div className="fw-semibold text-dark">{record.serviceName || 'N/A'}</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-dark">{formatCurrency(record.total)}</div>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-1 mb-2">
                      {getStatusBadge(record.workStatus)}
                      {getPaymentBadge(record.customerPayment)}
                    </div>

                    <div className="row g-2 small text-muted mb-3">
                      <div className="col-6">
                        <div className="text-dark fw-medium">{record.clientName || 'N/A'}</div>
                        <div>
                          <i className="bi bi-telephone me-1"></i>
                          {record.clientPhone || 'N/A'}
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="text-dark fw-medium">{formatDate(record.workDate)}</div>
                        <div>
                          <i className="bi bi-clock me-1"></i>
                          {formatTime(record.workTime)}
                        </div>
                      </div>
                      <div className="col-12 pt-1 border-top">
                        <span className="text-muted me-1">Partner:</span>
                        <span className="fw-semibold text-dark">
                          {record.acceptedPartnerName || 'Unassigned'}
                        </span>
                        {record.pincode && (
                          <span className="ms-2 badge bg-light text-dark border">
                            Pin: {record.pincode}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="d-flex justify-content-end pt-2 border-top">
                      {renderActionButtons(record)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination Footer */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3 pt-2 border-top">
            <span className="text-muted small">
              Showing {bookings.length} of {totalItems} entries
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <span aria-hidden="true">&laquo;</span> Prev
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index + 1}
                    className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next <span aria-hidden="true">&raquo;</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <BookingModal
        show={showModal}
        handleClose={handleCloseModal}
        bookingData={selectedBooking}
        initialTab={modalInitialTab}
        onBookingUpdated={handleBookingUpdated}
      />
    </div>
  );
};

export default Leads;
