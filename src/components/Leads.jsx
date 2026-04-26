import React, { useState, useEffect } from 'react';
import BookingModal from './common/BookingModal';
import DataTable from './common/DataTable';
import PaginationDropdown from './common/PaginationDropdown';
import { bookingsAPI } from '../services/api';
import { CustomButton } from './common/CustomButton';

const Leads = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [limit, setLimit] = useState(25);

  // Load bookings
  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingsAPI.getAll(currentPage, limit, searchTerm);
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

  useEffect(() => {
    loadBookings();
  }, [currentPage, searchTerm, limit]);

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { class: 'bg-success', label: 'Active' },
      'review': { class: 'bg-warning', label: 'Review' },
      'cancel': { class: 'bg-danger', label: 'Cancelled' },
      'payment_pending': { class: 'bg-info', label: 'Payment Pending' },
      'completed': { class: 'bg-primary', label: 'Completed' }
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

  return (
    <div className="h-100 d-flex flex-column p-3 p-lg-4 w-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3 flex-shrink-0">
        <h4 className="mb-0">Leads</h4>
      </div>

      <div className="card flex-grow-1 d-flex flex-column w-100">
        <div className="card-body flex-grow-1 d-flex flex-column w-100">
          <div className="row mb-3 flex-shrink-0">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
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
                  title: 'Id',
                  key: 'id',
                  render: (text, record) => (
                    <div className="fw-semibold">{text}</div>
                  )
                },
                {
                  title: 'Booking Id',
                  key: 'bookingOrderId',
                  render: (text, record) => (
                    <div className="fw-semibold text-primary">{text}</div>
                  )
                },
                {
                  title: 'Service',
                  key: 'service',
                  render: (text, record) => (
                    <div className="text-muted">N/A</div>
                  )
                },
                {
                  title: 'Client Name',
                  key: 'clientName',
                  render: (text, record) => (
                    <div className="text-muted">{text || 'N/A'}</div>
                  )
                },
                {
                  title: 'Client Number',
                  key: 'clientPhone',
                  render: (text, record) => (
                    <div className="text-muted">{text || 'N/A'}</div>
                  )
                },
                {
                  title: 'Date',
                  key: 'workDate',
                  render: (text, record) => (
                    <div className="text-muted">{formatDate(text)}</div>
                  )
                },
                {
                  title: 'Time',
                  key: 'workTime',
                  render: (text, record) => (
                    <div className="text-muted">{formatTime(text)}</div>
                  )
                },
                {
                  title: 'Partner',
                  key: 'partner',
                  render: (text, record) => (
                    <div className="text-muted">N/A</div>
                  )
                },
                {
                  title: 'Action',
                  key: 'actions',
                  render: (_, record) => (
                    <div className="d-flex align-items-center gap-2">
                      <CustomButton 
                        variant="primary" 
                        size="sm"
                        icon="bi-eye"
                        onClick={() => handleViewBooking(record)}
                        tooltip="View Details"
                      >
                      </CustomButton>
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
      />
    </div>
  );
};

export default Leads;
