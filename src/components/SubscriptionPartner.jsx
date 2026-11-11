import React, { useState, useEffect } from 'react';
import PaginationDropdown from './common/PaginationDropdown';
import { partnerSubscriptionsAPI } from '../services/api';

const SubscriptionPartner = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(25);
  const [status, setStatus] = useState('active');

  const loadSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await partnerSubscriptionsAPI.getAll(currentPage, limit, searchTerm, status);
      if (response && response.items) {
        setSubscriptions(response.items);
        setTotalItems(response.meta?.totalItems || response.items.length);
        setTotalPages(response.meta?.totalPages || 1);
      } else if (response && response.data && response.data.items) {
        setSubscriptions(response.data.items);
        setTotalItems(response.data.meta?.totalItems || response.data.items.length);
        setTotalPages(response.data.meta?.totalPages || 1);
      } else {
        setSubscriptions([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
      setError(err.message || 'Failed to load subscriptions. Please try again.');
      setSubscriptions([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [currentPage, searchTerm, limit, status]);

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
    if (isNaN(date.getTime())) return 'N/A';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="container-fluid p-2 p-md-3 p-xl-4 w-100 min-w-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h4 className="mb-0 fw-bold">Subscription Partners</h4>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={loadSubscriptions}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
          Refresh
        </button>
      </div>

      {/* Main Card */}
      <div className="card shadow-sm border-0 w-100 min-w-0">
        <div className="card-body p-2 p-sm-3 w-100 min-w-0">
          {/* Toolbar */}
          <div className="row g-2 mb-3 align-items-center">
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <PaginationDropdown
                limit={limit}
                onLimitChange={handleLimitChange}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mb-3 d-flex align-items-center justify-content-between">
              <div>
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger ms-2"
                onClick={loadSubscriptions}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary me-2" role="status"></div>
              <span className="text-muted">Loading subscription partners...</span>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-2"></i>
              No subscription partners found
            </div>
          ) : (
            <>
              {/* Desktop / Laptop Table (fits 100% width with 0 horizontal overflow) */}
              <div className="d-none d-md-block w-100">
                <table
                  className="table table-hover align-middle mb-0 w-100"
                  style={{ fontSize: '0.875rem', tableLayout: 'fixed' }}
                >
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '6%' }}>#</th>
                      <th style={{ width: '25%' }}>Partner</th>
                      <th style={{ width: '20%' }}>Package & Category</th>
                      <th style={{ width: '10%' }}>Price</th>
                      <th style={{ width: '15%' }}>Leads Usage</th>
                      <th style={{ width: '15%' }}>Validity</th>
                      <th style={{ width: '9%' }} className="text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((record, index) => {
                      const srNo = (currentPage - 1) * limit + index + 1;
                      const allocated = Number(record.allocatedLeads ?? 0);
                      const consumed = Number(record.consumedLeads ?? 0);
                      const remaining = Math.max(0, allocated - consumed);
                      const isStyleActive = record.status === 'active' || record.status === 'on';

                      return (
                        <tr key={record.id ?? index}>
                          <td className="fw-semibold text-muted">{srNo}</td>

                          {/* Partner Name + Phone + Email */}
                          <td className="text-truncate">
                            <div className="fw-semibold text-dark text-truncate" title={record.partnerName}>
                              {record.partnerName || 'N/A'}
                            </div>
                            <div className="small text-muted">
                              <i className="bi bi-telephone me-1 text-primary"></i>
                              {record.partnerPhone || 'N/A'}
                            </div>
                            {record.partnerEmail && (
                              <div
                                className="small text-muted text-truncate"
                                style={{ fontSize: '0.75rem' }}
                                title={record.partnerEmail}
                              >
                                {record.partnerEmail}
                              </div>
                            )}
                          </td>

                          {/* Package & Category */}
                          <td>
                            <div className="fw-semibold text-dark text-truncate" title={record.packageName}>
                              {record.packageName || 'N/A'}
                            </div>
                            <span
                              className="badge bg-secondary-subtle text-secondary border border-secondary-subtle mt-1"
                              style={{ fontSize: '0.72rem' }}
                            >
                              {record.categoryName || 'N/A'}
                            </span>
                          </td>

                          {/* Price */}
                          <td>
                            <span className="fw-bold text-success">₹{record.packageAmount || 0}</span>
                          </td>

                          {/* Leads Usage */}
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <span className="fw-bold text-primary">{consumed}</span>
                              <span className="text-muted">/</span>
                              <span className="fw-semibold text-dark">{allocated}</span>
                            </div>
                            <span
                              className="badge bg-info-subtle text-info-emphasis border border-info-subtle mt-1"
                              style={{ fontSize: '0.7rem' }}
                            >
                              {remaining} left
                            </span>
                          </td>

                          {/* Validity */}
                          <td>
                            <div className="small text-dark text-nowrap">
                              <span className="text-muted">From:</span> {formatDate(record.planStartDate)}
                            </div>
                            <div className="small text-dark text-nowrap">
                              <span className="text-muted">To:</span> {formatDate(record.planEndDate)}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="text-center">
                            <span
                              className={`badge ${
                                isStyleActive ? 'bg-success' : 'bg-danger'
                              } text-uppercase`}
                              style={{ fontSize: '0.72rem' }}
                            >
                              {record.status || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (< 768px) */}
              <div className="d-md-none d-flex flex-column gap-2">
                {subscriptions.map((record, index) => {
                  const srNo = (currentPage - 1) * limit + index + 1;
                  const allocated = Number(record.allocatedLeads ?? 0);
                  const consumed = Number(record.consumedLeads ?? 0);
                  const remaining = Math.max(0, allocated - consumed);
                  const isStyleActive = record.status === 'active' || record.status === 'on';

                  return (
                    <div key={record.id ?? index} className="card border shadow-sm">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <span className="badge bg-light text-secondary border me-2">#{srNo}</span>
                            <span className="fw-bold text-dark">{record.partnerName || 'N/A'}</span>
                            <div className="small text-muted mt-1">
                              <i className="bi bi-telephone me-1 text-primary"></i>
                              {record.partnerPhone || 'N/A'}
                            </div>
                          </div>
                          <span className={`badge ${isStyleActive ? 'bg-success' : 'bg-danger'}`}>
                            {record.status}
                          </span>
                        </div>

                        <div className="row g-2 small border-top pt-2 mt-2">
                          <div className="col-6">
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              PACKAGE & CATEGORY
                            </div>
                            <div className="fw-semibold text-dark">{record.packageName || 'N/A'}</div>
                            <span className="badge bg-secondary-subtle text-secondary mt-1">
                              {record.categoryName || 'N/A'}
                            </span>
                          </div>
                          <div className="col-6">
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              PRICE & LEADS
                            </div>
                            <div className="fw-bold text-success">₹{record.packageAmount || 0}</div>
                            <div className="text-dark">
                              Used: <strong className="text-primary">{consumed}</strong> / {allocated} ({remaining} left)
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              VALIDITY
                            </div>
                            <div className="text-dark">
                              {formatDate(record.planStartDate)} — {formatDate(record.planEndDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3 pt-2 border-top">
            <span className="text-muted small">
              Showing {subscriptions.length} of {totalItems} entries
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
    </div>
  );
};

export default SubscriptionPartner;
