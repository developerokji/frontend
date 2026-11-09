import React, { useState, useEffect } from 'react';
import ServiceModal from './common/ServiceModal';
import ImageModal from './common/ImageModal';
import PaginationDropdown from './common/PaginationDropdown';
import { servicesAPI } from '../services/api';
import { useDebounce } from '../hooks/useApi';
import { CustomButton } from './common/CustomButton';
import './common/ServiceStyles.css';

const Services = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [limit, setLimit] = useState(25);

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await servicesAPI.getAll(currentPage, limit, debouncedSearch);
      if (response?.data && response.data.items) {
        setServices(response.data.items);
        setTotalItems(response.data.meta?.totalItems ?? response.data.items.length);
        setTotalPages(response.data.meta?.totalPages || 1);
      } else if (response?.items) {
        setServices(response.items);
        setTotalItems(response.meta?.totalItems ?? response.items.length);
        setTotalPages(response.meta?.totalPages || 1);
      } else if (response?.data) {
        const list = Array.isArray(response.data) ? response.data : [];
        setServices(list);
        setTotalItems(list.length);
        setTotalPages(1);
      } else {
        setServices([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load services. Please try again.');
      setServices([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [currentPage, debouncedSearch, limit]);

  const handleShowModal = () => {
    setEditMode(false);
    setSelectedService(null);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setEditMode(false);
    setSelectedService(null);
  };

  const handleEditService = (service) => {
    setEditMode(true);
    setSelectedService(service);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleSaveService = async (serviceData) => {
    try {
      setError(null);
      if (editMode && selectedService) {
        await servicesAPI.update(selectedService.id, serviceData);
      } else {
        await servicesAPI.create(serviceData);
      }
      await loadServices();
      handleCloseModal();
    } catch (err) {
      console.error('Save service error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save service.');
    }
  };

  const handleDeleteService = async (service) => {
    const serviceId = service.id;
    const serviceName = service.name || `#${serviceId}`;
    if (!window.confirm(`Are you sure you want to delete service "${serviceName}"?`)) {
      return;
    }

    try {
      setDeletingId(serviceId);
      setError(null);
      setSuccessMsg(null);
      await servicesAPI.delete(serviceId);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      setTotalItems((prev) => Math.max(0, prev - 1));
      setSuccessMsg(`Service "${serviceName}" deleted successfully.`);
      await loadServices();
    } catch (err) {
      console.error('Delete service error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete service.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setError(null);
      const newStatus = currentStatus === 'on' ? 'off' : 'on';
      await servicesAPI.update(id, { status: newStatus });
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error('Error toggling service status:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update service status.');
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

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  return (
    <div className="container-fluid p-2 p-md-3 p-xl-4 w-100 min-w-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h4 className="mb-0 fw-bold">Services</h4>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={loadServices}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
            Refresh
          </button>
          <CustomButton variant="primary" size="sm" icon="bi-plus-circle" onClick={handleShowModal}>
            Add Service
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
                  placeholder="Search services..."
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
                onClick={loadServices}
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
              <span className="text-muted">Loading services...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-gear fs-1 d-block mb-2"></i>
              No services found
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
                      <th style={{ width: '43%' }}>Service Name</th>
                      <th style={{ width: '15%' }}>Image</th>
                      <th style={{ width: '17%' }}>Sale Price</th>
                      <th style={{ width: '18%' }} className="text-end">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((record, index) => {
                      const srNo = (currentPage - 1) * limit + index + 1;
                      const isActive = record.status === 'on';
                      const isDeleting = deletingId === record.id;

                      return (
                        <tr key={record.id ?? index}>
                          <td className="fw-semibold text-muted">{srNo}</td>

                          {/* Service Name */}
                          <td className="text-truncate">
                            <div className="fw-semibold text-dark text-truncate" title={record.name}>
                              {record.name || 'N/A'}
                            </div>
                          </td>

                          {/* Image */}
                          <td>
                            {record.imagePath ? (
                              <img
                                src={record.imagePath}
                                alt={record.name}
                                className="rounded cursor-pointer"
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  objectFit: 'cover',
                                  border: '1px solid #dee2e6',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s',
                                }}
                                onClick={() => handleImageClick(record.imagePath)}
                                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
                                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                              />
                            ) : (
                              <span className="text-muted small">No Image</span>
                            )}
                          </td>

                          {/* Sale Price */}
                          <td>
                            <span className="fw-bold text-success">
                              ₹{record.salePrice || record.price || 0}
                            </span>
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
                                onClick={() => handleEditService(record)}
                                tooltip="Edit Service"
                                disabled={isDeleting}
                              />
                              <CustomButton
                                variant="danger"
                                size="sm"
                                icon="bi-trash"
                                loading={isDeleting}
                                onClick={() => handleDeleteService(record)}
                                tooltip="Delete Service"
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
                {services.map((record, index) => {
                  const srNo = (currentPage - 1) * limit + index + 1;
                  const isActive = record.status === 'on';
                  const isDeleting = deletingId === record.id;

                  return (
                    <div key={record.id ?? index} className="card border shadow-sm">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2 min-w-0">
                            {record.imagePath && (
                              <img
                                src={record.imagePath}
                                alt={record.name}
                                className="rounded flex-shrink-0"
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  objectFit: 'cover',
                                  border: '1px solid #dee2e6',
                                }}
                                onClick={() => handleImageClick(record.imagePath)}
                              />
                            )}
                            <div className="min-w-0">
                              <span className="badge bg-light text-secondary border me-1">#{srNo}</span>
                              <span className="fw-bold text-dark">{record.name || 'N/A'}</span>
                              <div className="fw-bold text-success small mt-1">
                                ₹{record.salePrice || record.price || 0}
                              </div>
                            </div>
                          </div>
                          <div className="d-inline-flex align-items-center gap-2 flex-shrink-0 ms-2">
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
                              onClick={() => handleEditService(record)}
                              tooltip="Edit Service"
                              disabled={isDeleting}
                            />
                            <CustomButton
                              variant="danger"
                              size="sm"
                              icon="bi-trash"
                              loading={isDeleting}
                              onClick={() => handleDeleteService(record)}
                              tooltip="Delete Service"
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
                Showing {services.length} of {totalItems} entries
              </span>
              <nav aria-label="Services pagination">
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

      <ServiceModal
        show={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveService}
        editMode={editMode}
        serviceData={selectedService}
        setSelectedFile={setSelectedFile}
        selectedFile={selectedFile}
      />

      <ImageModal
        show={showImageModal}
        handleClose={handleCloseImageModal}
        imageUrl={selectedImage}
      />
    </div>
  );
};

export default Services;
