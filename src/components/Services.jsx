import React, { useState, useEffect } from 'react';
import ServiceModal from './common/ServiceModal';
import DataTable from './common/DataTable';
import ImageModal from './common/ImageModal';
import PaginationDropdown from './common/PaginationDropdown';
import { servicesAPI } from '../services/api';
import { CustomButton } from './common/CustomButton';
import './common/ServiceStyles.css';

const Services = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [limit, setLimit] = useState(25);

  // Load services
  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await servicesAPI.getAll(currentPage, limit, searchTerm);
      if (response.data && response.data.items) {
        setServices(response.data.items);
        setTotalItems(response.data.meta?.totalItems || response.data.items.length);
        setTotalPages(response.data.meta?.totalPages || 1);
      } else if (response.items) {
        setServices(response.items);
        setTotalItems(response.meta?.totalItems || response.items.length);
        setTotalPages(response.meta?.totalPages || 1);
      } else if (response.data) {
        setServices(Array.isArray(response.data) ? response.data : []);
        setTotalItems(Array.isArray(response.data) ? response.data.length : 0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to load services:', error);
      setError(error.message || 'Failed to load services. Please try again.');
      setServices([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [currentPage, searchTerm, limit]);

  const handleShowModal = () => {
    setEditMode(false);
    setSelectedService(null);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  const handleEditService = (service) => {
    setEditMode(true);
    setSelectedService(service);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleSaveService = async (serviceData) => {
    try {
      console.log(serviceData)
      if (editMode && selectedService) {
        await servicesAPI.update(selectedService.id, serviceData);
      } else {
        await servicesAPI.create(serviceData);
      }
      loadServices();
      handleCloseModal();
    } catch (error) {
      console.error('Save service error:', error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await servicesAPI.delete(serviceId);
        loadServices();
      } catch (error) {
        console.error('Delete service error:', error);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'on' ? 'off' : 'on';
      await servicesAPI.update(id, { status: newStatus });
      loadServices();
    } catch (error) {
      console.error('Error toggling service status:', error);
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
    setCurrentPage(1); // Reset to first page when changing limit
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
    <div className="h-100 d-flex flex-column p-3 p-lg-4 w-100 min-w-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2 flex-shrink-0">
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

      <div className="card flex-grow-1 d-flex flex-column w-100 min-w-0 shadow-sm border-0">
        <div className="card-body flex-grow-1 d-flex flex-column w-100 min-w-0">
          <div className="row mb-3 flex-shrink-0">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search services..."
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
                onClick={loadServices}
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
                  title: 'Name',
                  key: 'name',
                  render: (text, record) => (
                    <div className="fw-semibold">{text}</div>
                  )
                },
                {
                  title: 'Image',
                  key: 'imagePath',
                  render: (image, record) => (
                    <div className="d-flex align-items-center">
                      {image && (
                        <img
                          src={image}
                          alt={record.name}
                          className="rounded me-2 cursor-pointer"
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            minWidth: '40px', 
                            objectFit: 'cover',
                            border: '1px solid #dee2e6',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }}
                          onClick={() => handleImageClick(image)}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        />
                      ) }
                     
                    </div>
                  )
                },
                {
                  title: 'Sale Price',
                  key: 'salePrice',
                  render: (salePrice, record) => (
                    <div className="fw-bold text-success">₹{salePrice || record.price}</div>
                  )
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <div className="d-inline-flex align-items-center gap-2 flex-nowrap">
                      <div className="form-check form-switch mb-0 d-flex align-items-center">
                        <input
                          className="form-check-input m-0"
                          type="checkbox"
                          checked={record.status === 'on'}
                          onChange={() => handleToggleStatus(record.id, record.status)}
                          style={{ cursor: 'pointer', width: '2.25em', height: '1.15em' }}
                          title={record.status === 'on' ? 'Active (Click to disable)' : 'Inactive (Click to enable)'}
                        />
                      </div>
                      <CustomButton
                        variant="primary"
                        size="sm"
                        icon="bi-pencil"
                        onClick={() => handleEditService(record)}
                        tooltip="Edit Service"
                      />
                      <CustomButton
                        variant="danger"
                        size="sm"
                        icon="bi-trash"
                        onClick={() => handleDeleteService(record.id)}
                        tooltip="Delete Service"
                      />
                    </div>
                  ),
                },
                              ]}
              data={services}
              loading={loading}
              className="flex-grow-1"
            />
          </div>

          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-3 flex-shrink-0">
            <span className="text-muted small">
              Showing {services.length} of {totalItems} entries
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
