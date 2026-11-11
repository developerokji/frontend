import React, { useState, useEffect } from 'react';
import PackageModal from './common/PackageModal';
import PaginationDropdown from './common/PaginationDropdown';
import { packagesAPI } from '../services/api';
import { useDebounce } from '../hooks/useApi';
import { CustomButton } from './common/CustomButton';

const Packages = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(25);

  const loadPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await packagesAPI.getAll(currentPage, limit, debouncedSearch);
      if (response?.data && response.data.items) {
        setPackages(response.data.items);
        setTotalItems(response.data.meta?.totalItems ?? response.data.items.length);
        setTotalPages(response.data.meta?.totalPages || 1);
      } else if (response?.items) {
        setPackages(response.items);
        setTotalItems(response.meta?.totalItems ?? response.items.length);
        setTotalPages(response.meta?.totalPages || 1);
      } else if (response?.data) {
        const list = Array.isArray(response.data) ? response.data : [];
        setPackages(list);
        setTotalItems(list.length);
        setTotalPages(1);
      } else {
        setPackages([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load packages:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load packages. Please try again.');
      setPackages([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [currentPage, debouncedSearch, limit]);

  const handleShowModal = () => {
    setEditMode(false);
    setSelectedPackage(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedPackage(null);
  };

  const handleEditPackage = (pkg) => {
    setEditMode(true);
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  const handleSavePackage = async (packageData) => {
    try {
      setError(null);
      if (editMode && selectedPackage) {
        await packagesAPI.update(selectedPackage.id, packageData);
      } else {
        await packagesAPI.create(packageData);
      }
      await loadPackages();
      handleCloseModal();
    } catch (err) {
      console.error('Save package error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save package.');
    }
  };

  const handleDeletePackage = async (pkg) => {
    const packageId = pkg.id;
    const packageName = pkg.packageName || `#${packageId}`;
    if (!window.confirm(`Are you sure you want to delete package "${packageName}"?`)) {
      return;
    }

    try {
      setDeletingId(packageId);
      setError(null);
      setSuccessMsg(null);
      await packagesAPI.delete(packageId);
      setPackages((prev) => prev.filter((p) => p.id !== packageId));
      setTotalItems((prev) => Math.max(0, prev - 1));
      setSuccessMsg(`Package "${packageName}" deleted successfully.`);
      await loadPackages();
    } catch (err) {
      console.error('Delete package error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete package.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setError(null);
      const newStatus = currentStatus === 'on' ? 'off' : 'on';
      await packagesAPI.update(id, { status: newStatus });
      setPackages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      console.error('Error toggling package status:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update package status.');
    }
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

  return (
    <div className="container-fluid p-2 p-md-3 p-xl-4 w-100 min-w-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h4 className="mb-0 fw-bold">Packages</h4>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={loadPackages}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
            Refresh
          </button>
          <CustomButton variant="primary" size="sm" icon="bi-plus-circle" onClick={handleShowModal}>
            Add Package
          </CustomButton>
        </div>
      </div>

      {/* Main Card */}
      <div className="card shadow-sm border-0 w-100 min-w-0">
        <div className="card-body p-2 p-sm-3 w-100 min-w-0">
          {/* Search & Page Size Toolbar */}
          <div className="row g-2 mb-3 align-items-center">
            <div className="col-12 col-md-6 col-lg-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search packages..."
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
            <div className="col-12 col-md-6 col-lg-3 ms-md-auto">
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
                onClick={loadPackages}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Retry
              </button>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success alert-dismissible fade show mb-3 d-flex align-items-center justify-content-between">
              <div>
                <i className="bi bi-check-circle-fill me-2"></i>
                {successMsg}
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setSuccessMsg(null)}
              ></button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary me-2" role="status"></div>
              <span className="text-muted">Loading packages...</span>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-box fs-1 d-block mb-2"></i>
              No packages found
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
                      <th style={{ width: '7%' }}>#</th>
                      <th style={{ width: '24%' }}>Package Name</th>
                      <th style={{ width: '18%' }}>Category</th>
                      <th style={{ width: '12%' }}>Price</th>
                      <th style={{ width: '12%' }}>No. of Leads</th>
                      <th style={{ width: '12%' }}>Validity</th>
                      <th style={{ width: '15%' }} className="text-end">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((record, index) => {
                      const srNo = (currentPage - 1) * limit + index + 1;
                      const isActive = record.status === 'on';
                      const isDeleting = deletingId === record.id;

                      return (
                        <tr key={record.id ?? index}>
                          <td className="fw-semibold text-muted">{srNo}</td>

                          {/* Package Name */}
                          <td className="text-truncate">
                            <div className="fw-semibold text-dark text-truncate" title={record.packageName}>
                              {record.packageName || 'N/A'}
                            </div>
                          </td>

                          {/* Category */}
                          <td>
                            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                              {record.categoryName || 'N/A'}
                            </span>
                          </td>

                          {/* Price */}
                          <td>
                            <span className="fw-bold text-success">₹{record.packagePrice ?? 0}</span>
                          </td>

                          {/* No. of Leads */}
                          <td>
                            <span className="fw-semibold text-dark">{record.noOfLead ?? 0}</span>
                          </td>

                          {/* Validity */}
                          <td className="text-muted">
                            {record.leadCountIn} {record.leadIn}
                          </td>

                          {/* Actions */}
                          <td className="text-end">
                            <div className="d-inline-flex align-items-center justify-content-end gap-2 flex-nowrap">
                              <div className="form-check form-switch mb-0 d-flex align-items-center">
                                <input
                                  className="form-check-input m-0"
                                  type="checkbox"
                                  checked={isActive}
                                  onChange={() => handleToggleStatus(record.id, record.status)}
                                  style={{ cursor: 'pointer', width: '2.25em', height: '1.15em' }}
                                  title={isActive ? 'Active (Click to disable)' : 'Inactive (Click to enable)'}
                                />
                              </div>
                              <CustomButton
                                variant="primary"
                                size="sm"
                                icon="bi-pencil"
                                onClick={() => handleEditPackage(record)}
                                tooltip="Edit Package"
                                disabled={isDeleting}
                              />
                              <CustomButton
                                variant="danger"
                                size="sm"
                                icon="bi-trash"
                                loading={isDeleting}
                                onClick={() => handleDeletePackage(record)}
                                tooltip="Delete Package"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (< 768px) */}
              <div className="d-md-none d-flex flex-column gap-2">
                {packages.map((record, index) => {
                  const srNo = (currentPage - 1) * limit + index + 1;
                  const isActive = record.status === 'on';
                  const isDeleting = deletingId === record.id;

                  return (
                    <div key={record.id ?? index} className="card border shadow-sm">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <span className="badge bg-light text-secondary border me-2">#{srNo}</span>
                            <span className="fw-bold text-dark">{record.packageName || 'N/A'}</span>
                            <div className="mt-1">
                              <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                {record.categoryName || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <span className="fw-bold text-success fs-6">₹{record.packagePrice ?? 0}</span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
                          <div className="small text-muted">
                            <strong>{record.noOfLead ?? 0}</strong> Leads &bull; {record.leadCountIn}{' '}
                            {record.leadIn}
                          </div>
                          <div className="d-inline-flex align-items-center gap-2">
                            <div className="form-check form-switch mb-0 d-flex align-items-center">
                              <input
                                className="form-check-input m-0"
                                type="checkbox"
                                checked={isActive}
                                onChange={() => handleToggleStatus(record.id, record.status)}
                                style={{ cursor: 'pointer', width: '2.25em', height: '1.15em' }}
                              />
                            </div>
                            <CustomButton
                              variant="primary"
                              size="sm"
                              icon="bi-pencil"
                              onClick={() => handleEditPackage(record)}
                              tooltip="Edit Package"
                              disabled={isDeleting}
                            />
                            <CustomButton
                              variant="danger"
                              size="sm"
                              icon="bi-trash"
                              loading={isDeleting}
                              onClick={() => handleDeletePackage(record)}
                              tooltip="Delete Package"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination Footer */}
          {totalPages > 0 && (
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3 pt-2 border-top">
              <span className="text-muted small">
                Showing {packages.length} of {totalItems} entries
              </span>
              <nav aria-label="Packages pagination">
                <ul className="pagination pagination-sm mb-0 flex-wrap justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      &laquo; Prev
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 2
                    )
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <li className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )}
                          <li className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        </React.Fragment>
                      );
                    })}
                  <li
                    className={`page-item ${
                      currentPage === totalPages || totalPages === 0 ? 'disabled' : ''
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      Next &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      <PackageModal
        show={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSavePackage}
        editMode={editMode}
        packageData={selectedPackage}
      />
    </div>
  );
};

export default Packages;
