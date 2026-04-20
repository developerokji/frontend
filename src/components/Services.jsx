import React, { useState, useEffect } from 'react';
import ServiceModal from './common/ServiceModal';
import DataTable from './common/DataTable';
import ImageModal from './common/ImageModal';
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

  const limit = 10;

  // Load services
  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await servicesAPI.getAll(currentPage, limit, searchTerm);
      if (response.items) {
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
  }, [currentPage, searchTerm]);

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
    <div className="h-100 d-flex flex-column p-3 p-lg-4 w-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3 flex-shrink-0">
        <h4 className="mb-0">Services</h4>
        <CustomButton variant="primary" onClick={handleShowModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Add Service
        </CustomButton>
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
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
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
                  key: 'service_name',
                  render: (text, record) => (
                    <div className="fw-semibold">{text}</div>
                  )
                },
                {
                  title: 'Image',
                  key: 'service_image_path',
                  render: (image, record) => (
                    <div className="d-flex align-items-center">
                      {image ? (
                        <img
                          src={image}
                          alt={record.service_name}
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
                      ) : (
                        <div 
                          className="rounded me-2 bg-light d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            minWidth: '40px',
                            border: '1px solid #dee2e6'
                          }}
                        >
                          <i className="bi bi-gear text-muted"></i>
                        </div>
                      )}
                      <div>
                        <div className="small text-muted">Image</div>
                        <div className="small fw-medium">Preview</div>
                      </div>
                    </div>
                  )
                },
                {
                  title: 'Sale Price',
                  key: 'sale_price',
                  render: (salePrice, record) => (
                    <div className="fw-bold text-success">₹{salePrice || record.price}</div>
                  )
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <div className="d-flex align-items-center gap-2">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          checked={record.status === 'on'}
                          readOnly
                          style={{ cursor: 'default' }}
                        />
                      </div>
                      <div className="btn-group btn-group-sm" role="group">
                        <CustomButton 
                          variant="primary" 
                          size="sm"
                          icon="bi-pencil"
                          onClick={() => handleEditService(record)}
                          tooltip="Edit Service"
                        >
                        </CustomButton>
                        <CustomButton 
                          variant="danger" 
                          size="sm"
                          icon="bi-trash"
                          onClick={() => handleDeleteService(record.id)}
                          tooltip="Delete Service"
                        >
                        </CustomButton>
                      </div>
                    </div>
                  )
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
