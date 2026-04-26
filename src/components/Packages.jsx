import React, { useState, useEffect } from 'react';
import PackageModal from './common/PackageModal';
import DataTable from './common/DataTable';
import PaginationDropdown from './common/PaginationDropdown';
import { packagesAPI } from '../services/api';
import { CustomButton } from './common/CustomButton';

const Packages = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [limit, setLimit] = useState(25);

  // Load packages
  const loadPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await packagesAPI.getAll(currentPage, limit, searchTerm);
      if (response.data && response.data.items) {
        setPackages(response.data.items);
        setTotalItems(response.data.meta?.totalItems || response.data.items.length);
        setTotalPages(response.data.meta?.totalPages || 1);
      } else if (response.items) {
        setPackages(response.items);
        setTotalItems(response.meta?.totalItems || response.items.length);
        setTotalPages(response.meta?.totalPages || 1);
      } else if (response.data) {
        setPackages(Array.isArray(response.data) ? response.data : []);
        setTotalItems(Array.isArray(response.data) ? response.data.length : 0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to load packages:', error);
      setError(error.message || 'Failed to load packages. Please try again.');
      setPackages([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [currentPage, searchTerm, limit]);

  const handleShowModal = () => {
    setEditMode(false);
    setSelectedPackage(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleEditPackage = (pkg) => {
    setEditMode(true);
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  const handleSavePackage = async (packageData) => {
    try {
      if (editMode && selectedPackage) {
        await packagesAPI.update(selectedPackage.id, packageData);
      } else {
        await packagesAPI.create(packageData);
      }
      loadPackages();
      handleCloseModal();
    } catch (error) {
      console.error('Save package error:', error);
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await packagesAPI.delete(packageId);
        loadPackages();
      } catch (error) {
        console.error('Delete package error:', error);
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

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'on' ? 'off' : 'on';
      await packagesAPI.update(id, { status: newStatus });
      loadPackages();
    } catch (error) {
      console.error('Error toggling package status:', error);
    }
  };

  return (
    <div className="h-100 d-flex flex-column p-3 p-lg-4 w-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3 flex-shrink-0">
        <h4 className="mb-0">Packages</h4>
        <CustomButton variant="primary" onClick={handleShowModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Add Package
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
                  placeholder="Search packages..."
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
                onClick={loadPackages}
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
                    const index = packages.findIndex(pkg => pkg.id === record.id);
                    return <div className="fw-semibold">{(currentPage - 1) * limit + index + 1}</div>;
                  }
                },
                {
                  title: 'Package Name',
                  key: 'packageName',
                  render: (text, record) => (
                    <div className="fw-semibold">{text}</div>
                  )
                },
                {
                  title: 'Category Name',
                  key: 'categoryName',
                  render: (text, record) => (
                    <div className="text-muted">{text || 'N/A'}</div>
                  )
                },
                {
                  title: 'Package Price',
                  key: 'packagePrice',
                  render: (price, record) => (
                    <div className="fw-bold text-success">₹{price}</div>
                  )
                },
                {
                  title: 'No. of Leads',
                  key: 'noOfLead',
                  render: (noOfLead, record) => (
                    <div className="text-muted">{noOfLead}</div>
                  )
                },
                {
                  title: 'Validity',
                  key: 'duration',
                  render: (_, record) => (
                    <div className="text-muted">{record.leadCountIn} {record.leadIn}</div>
                  )
                },
                {
                  title: 'Action',
                  key: 'actions',
                  render: (_, record) => (
                    <div className="d-flex align-items-center gap-2">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          checked={record.status === 'on'}
                          onChange={() => handleToggleStatus(record.id, record.status)}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                      <div className="btn-group btn-group-sm d-flex gap-2" role="group">
                        <CustomButton 
                          variant="primary" 
                          size="sm"
                          icon="bi-pencil"
                          onClick={() => handleEditPackage(record)}
                          tooltip="Edit Package"
                        >
                        </CustomButton>
                        <CustomButton 
                          variant="danger" 
                          size="sm"
                          icon="bi-trash"
                          onClick={() => handleDeletePackage(record.id)}
                          tooltip="Delete Package"
                        >
                        </CustomButton>
                      </div>
                    </div>
                  )
                },
              ]}
              data={packages}
              loading={loading}
              className="flex-grow-1"
            />
          </div>

          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-3 flex-shrink-0">
            <span className="text-muted small">
              Showing {packages.length} of {totalItems} entries
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
