import React, { useState, useEffect } from 'react';
import PartnerModal from './common/PartnerModal';
import DataTable from './common/DataTable';
import PaginationDropdown from './common/PaginationDropdown';
import { partnersAPI } from '../services/api';
import { CustomButton } from './common/CustomButton';

const PartnerList = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const [limit, setLimit] = useState(25);

  // Load partners
  const loadPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await partnersAPI.getAll(currentPage, limit, searchTerm);
      if (response.data && response.data.items) {
        setPartners(response.data.items);
        setTotalItems(response.data.meta?.totalItems || response.data.items.length);
        setTotalPages(response.data.meta?.totalPages || 1);
      } else if (response.data) {
        setPartners(Array.isArray(response.data) ? response.data : []);
        setTotalItems(Array.isArray(response.data) ? response.data.length : 0);
        setTotalPages(1);
      } else if (response.items) {
        setPartners(response.items);
        setTotalItems(response.meta?.totalItems || response.items.length);
        setTotalPages(response.meta?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to load partners:', error);
      setError(error.message || 'Failed to load partners. Please try again.');
      setPartners([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, [currentPage, searchTerm, limit]);

  const handleShowModal = () => {
    setEditMode(false);
    setSelectedPartner(null);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  const handleEditPartner = (partner) => {
    setEditMode(true);
    setSelectedPartner(partner);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleSavePartner = async (partnerData) => {
    try {
      if (editMode && selectedPartner) {
        await partnersAPI.update(selectedPartner.id, partnerData);
      } else {
        await partnersAPI.create(partnerData);
      }
      loadPartners();
      handleCloseModal();
    } catch (error) {
      console.error('Save partner error:', error);
    }
  };

  const handleDeletePartner = async (partnerId) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      try {
        await partnersAPI.delete(partnerId);
        loadPartners();
      } catch (error) {
        console.error('Delete partner error:', error);
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
    setCurrentPage(1); // Reset to first page when changing limit
  };

  return (
    <div className="h-100 d-flex flex-column p-3 p-lg-4 w-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3 flex-shrink-0">
        <h4 className="mb-0">Partner List</h4>
        <CustomButton variant="primary" onClick={handleShowModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Add partner +
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
                  placeholder="Search..."
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
                onClick={loadPartners}
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
                    <div className="fw-semibold">{text || 'N/A'}</div>
                  )
                },
                {
                  title: 'Email',
                  key: 'email',
                  render: (email, record) => (
                    <div className="text-muted">{email || 'N/A'}</div>
                  )
                },
                {
                  title: 'Phone',
                  key: 'phone',
                  render: (phone, record) => (
                    <div className="text-muted">{phone || 'N/A'}</div>
                  )
                },
                {
                  title: 'Status',
                  key: 'account_status',
                  render: (status, record) => (
                    <span className={`badge ${status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                      {status || 'inactive'}
                    </span>
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
                          checked={record.account_status === 'active'}
                          readOnly
                          style={{ cursor: 'default' }}
                        />
                      </div>
                      <div className="btn-group btn-group-sm d-flex gap-2" role="group">
                        <CustomButton 
                          variant="primary" 
                          size="sm"
                          icon="bi-pencil"
                          onClick={() => handleEditPartner(record)}
                          tooltip="Edit Partner"
                        >
                        </CustomButton>
                        <CustomButton 
                          variant="danger" 
                          size="sm"
                          icon="bi-trash"
                          onClick={() => handleDeletePartner(record.id)}
                          tooltip="Delete Partner"
                        >
                        </CustomButton>
                      </div>
                    </div>
                  )
                },
              ]}
              data={partners}
              loading={loading}
              className="flex-grow-1"
            />
          </div>

          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-3 flex-shrink-0">
            <span className="text-muted small">
              Showing {partners.length} of {totalItems} entries
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

      <PartnerModal
        show={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSavePartner}
        editMode={editMode}
        partnerData={selectedPartner}
        setSelectedFile={setSelectedFile}
        selectedFile={selectedFile}
      />
    </div>
  );
};

export default PartnerList;
