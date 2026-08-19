import React, { useState, useEffect } from 'react';
import DataTable from './common/DataTable';
import PaginationDropdown from './common/PaginationDropdown';
import { partnerSubscriptionsAPI } from '../services/api';

const ExpiredPartner = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(25);

  // Load expired partner subscriptions
  const loadSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await partnerSubscriptionsAPI.getExpired(currentPage, limit, searchTerm);
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
      console.error('Failed to load expired subscriptions:', err);
      setError(err.message || 'Failed to load expired subscriptions. Please try again.');
      setSubscriptions([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [currentPage, searchTerm, limit]);

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

  return (
    <div className="h-100 d-flex flex-column p-3 p-lg-4 w-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3 flex-shrink-0">
        <h4 className="mb-0">Expired Partners</h4>
      </div>

      <div className="card flex-grow-1 d-flex flex-column w-100">
        <div className="card-body flex-grow-1 d-flex flex-column w-100">
          <div className="row mb-3 flex-shrink-0 g-3">
            {/* <div className="col-12 col-md-6 col-lg-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search partner, package, category..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div> */}
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
                onClick={loadSubscriptions}
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
                  title: 'Sr No',
                  key: 'sr_no',
                  render: (text, record) => {
                    const index = subscriptions.findIndex(sub => sub.subscriptionId === record.subscriptionId);
                    return <div className="fw-semibold">{(currentPage - 1) * limit + index + 1}</div>;
                  }
                },
                {
                  title: 'Partner Name',
                  key: 'partnerName',
                  render: (text, record) => (
                    <div>
                      <div className="fw-semibold">{text || 'N/A'}</div>
                      <div className="text-muted small">{record.partnerEmail || ''}</div>
                    </div>
                  )
                },
                {
                  title: 'Partner Phone',
                  key: 'partnerPhone',
                  render: (text) => (
                    <div className="text-muted">{text || 'N/A'}</div>
                  )
                },
                {
                  title: 'Package Name',
                  key: 'packageName',
                  render: (text) => (
                    <div className="fw-semibold">{text || 'N/A'}</div>
                  )
                },
                {
                  title: 'Category',
                  key: 'categoryName',
                  render: (text) => (
                    <span className="badge bg-secondary">{text || 'N/A'}</span>
                  )
                },
                {
                  title: 'Price',
                  key: 'packagePrice',
                  render: (price, record) => {
                    const finalPrice = price || record.packageAmount;
                    return <div className="fw-bold text-success">₹{finalPrice || 0}</div>;
                  }
                },
                {
                  title: 'Expiry Date',
                  key: 'planEndDate',
                  render: (date) => (
                    <div className="text-muted fw-semibold">{formatDate(date)}</div>
                  )
                },
                {
                  title: 'Status',
                  key: 'status',
                  render: (val) => {
                    const isStyleActive = val === 'active' || val === 'on';
                    return (
                      <span className={`badge ${isStyleActive ? 'bg-success' : 'bg-danger'}`}>
                        {val}
                      </span>
                    );
                  }
                }
              ]}
              data={subscriptions}
              loading={loading}
              className="flex-grow-1"
            />
          </div>

          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-3 flex-shrink-0">
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
    </div>
  );
};

export default ExpiredPartner;
