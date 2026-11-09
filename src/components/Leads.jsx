import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingModal from './common/BookingModal';
import DataTable from './common/DataTable';
import PaginationDropdown from './common/PaginationDropdown';
import { bookingsAPI, paymentAPI } from '../services/api';
import { CustomButton } from './common/CustomButton';

const Leads = () => {
  const navigate = useNavigate();
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
  const [modeLoading, setModeLoading] = useState(false);

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
    } catch (error) {
      console.error('Failed to load bookings:', error);
      setError(error.message || 'Failed to load bookings. Please try again.');
      setBookings([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Load Cashfree gateway mode (UAT 'dev' vs Production 'pro' matching settings.server enum('dev','pro'))
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

  const handleToggleCashfreeMode = async (newMode) => {
    if (newMode === cashfreeMode || modeLoading) return;
    try {
      setModeLoading(true);
      await paymentAPI.setCashfreeServerMode(newMode);
      setCashfreeMode(newMode);
    } catch (err) {
      console.error('Failed to switch Cashfree mode:', err);
      setError(err.response?.data?.message || 'Failed to switch payment environment mode.');
    } finally {
      setModeLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [currentPage, searchTerm, statusFilter, limit]);

  useEffect(() => {
    loadCashfreeMode();
  }, []);

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
    const statusInfo = statusMap[status] || { class: 'bg-secondary', label: status || 'N/A' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const getPaymentBadge = (status) => {
    const statusMap = {
      'not_received': { class: 'bg-danger', label: 'Not Received' },
      'received': { class: 'bg-success', label: 'Received' },
      'not_transfer': { class: 'bg-danger', label: 'Not Transferred' },
      'transfer': { class: 'bg-success', label: 'Transferred' },
      'transferred': { class: 'bg-success', label: 'Transferred' }
    };
    const statusInfo = statusMap[status] || { class: 'bg-secondary', label: status || 'N/A' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const isBookingPayable = (record) => {
    if (!record) return false;
    return record.customerPayment !== 'received' && record.workStatus !== 'cancel';
  };

  return (
    <div className="h-100 d-flex flex-column p-3 p-lg-4 w-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3 flex-shrink-0">
        <div className="d-flex align-items-center gap-3">
          <h4 className="mb-0">Leads</h4>
          <span
            className={`badge ${
              cashfreeMode === 'pro'
                ? 'bg-danger-subtle text-danger border border-danger'
                : 'bg-warning-subtle text-dark border border-warning'
            } px-3 py-2 rounded-pill`}
          >
            <i className={`bi ${cashfreeMode === 'pro' ? 'bi-lightning-charge-fill' : 'bi-tools'} me-1`}></i>
            Gateway: {cashfreeMode === 'pro' ? 'Production (Live)' : 'UAT (Sandbox)'}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small fw-semibold me-1">Payment Mode:</span>
          <div className="btn-group btn-group-sm" role="group" aria-label="Payment Gateway Environment">
            <button
              type="button"
              className={`btn ${cashfreeMode !== 'pro' ? 'btn-warning fw-semibold' : 'btn-outline-secondary'}`}
              disabled={modeLoading}
              onClick={() => handleToggleCashfreeMode('dev')}
            >
              <i className="bi bi-bug me-1"></i>UAT (Sandbox)
            </button>
            <button
              type="button"
              className={`btn ${cashfreeMode === 'pro' ? 'btn-danger fw-semibold' : 'btn-outline-secondary'}`}
              disabled={modeLoading}
              onClick={() => handleToggleCashfreeMode('pro')}
            >
              <i className="bi bi-shield-check me-1"></i>Production
            </button>
          </div>
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

      <div className="card flex-grow-1 d-flex flex-column w-100">
        <div className="card-body flex-grow-1 d-flex flex-column w-100">
          <div className="row mb-3 g-2 flex-shrink-0">
            <div className="col-12 col-md-5 col-lg-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search order ID, client, partner, pincode..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="col-12 col-md-4 col-lg-3">
              <select
                className="form-select"
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
            <div className="col-12 col-md-3 col-lg-3">
              <PaginationDropdown 
                limit={limit} 
                onLimitChange={handleLimitChange}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button 
                type="button" 
                className="btn btn-sm btn-outline-danger ms-2"
                onClick={loadBookings}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Retry
              </button>
            </div>
          )}

          <div className="table-responsive flex-grow-1">
            <DataTable
              columns={[
                {
                  title: 'Booking Id',
                  key: 'bookingOrderId',
                  render: (text, record) => (
                    <div className="fw-semibold text-primary">{text || `#${record.id}`}</div>
                  )
                },
                {
                  title: 'Service',
                  key: 'serviceName',
                  render: (text) => (
                    <div className="text-muted">{text || 'N/A'}</div>
                  )
                },
                {
                  title: 'Client Name',
                  key: 'clientName',
                  render: (text) => (
                    <div className="text-muted">{text || 'N/A'}</div>
                  )
                },
                {
                  title: 'Client Number',
                  key: 'clientPhone',
                  render: (text) => (
                    <div className="text-muted">{text || 'N/A'}</div>
                  )
                },
                {
                  title: 'Date',
                  key: 'workDate',
                  render: (text) => (
                    <div className="text-muted">{formatDate(text)}</div>
                  )
                },
                {
                  title: 'Time',
                  key: 'workTime',
                  render: (text) => (
                    <div className="text-muted">{formatTime(text)}</div>
                  )
                },
                {
                  title: 'Partner',
                  key: 'acceptedPartnerName',
                  render: (text, record) => (
                    <div>
                      {text ? (
                        <span className="fw-semibold text-dark">{text}</span>
                      ) : (
                        <span className="badge bg-warning-subtle text-dark border">Unassigned</span>
                      )}
                      {record.pincode && (
                        <div className="text-muted small">Pin: {record.pincode}</div>
                      )}
                    </div>
                  )
                },
                {
                  title: 'Total',
                  key: 'total',
                  render: (text) => (
                    <div className="fw-bold text-dark">{formatCurrency(text)}</div>
                  )
                },
                {
                  title: 'Work Status',
                  key: 'workStatus',
                  render: (text) => getStatusBadge(text)
                },
                {
                  title: 'Payment',
                  key: 'customerPayment',
                  render: (text) => getPaymentBadge(text)
                },
                {
                  title: 'Action',
                  key: 'actions',
                  render: (_, record) => (
                    <div className="d-flex align-items-center gap-1 flex-wrap">
                      <CustomButton 
                        variant="primary" 
                        size="sm"
                        icon="bi-eye"
                        onClick={() => handleOpenBookingModal(record, 'details')}
                        tooltip="View Lead Details"
                      />
                      <CustomButton
                        variant="outline-warning"
                        size="sm"
                        icon="bi-pencil-square"
                        onClick={() => handleOpenBookingModal(record, 'status')}
                        tooltip="Change Lead Status"
                      />
                      <CustomButton
                        variant="outline-info"
                        size="sm"
                        icon="bi-person-lines-fill"
                        onClick={() => handleOpenBookingModal(record, 'reassign')}
                        tooltip="Re-assign Partner"
                      />
                      {isBookingPayable(record) ? (
                        <CustomButton
                          variant="success"
                          size="sm"
                          icon="bi-credit-card"
                          onClick={() => handlePayBooking(record)}
                          tooltip={`Pay ${formatCurrency(record.total)}`}
                        >
                          Pay
                        </CustomButton>
                      ) : record.customerPayment === 'received' ? (
                        <span
                          className="badge bg-success-subtle text-success border border-success px-2 py-1"
                          title="Payment Completed"
                        >
                          <i className="bi bi-check-circle-fill me-1"></i>Paid
                        </span>
                      ) : null}
                    </div>
                  )
                },
              ]}
              data={bookings}
              loading={loading}
              className="flex-grow-1"
            />
          </div>

          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-3 flex-shrink-0">
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
                    <span aria-hidden="true">&laquo;</span> Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
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
