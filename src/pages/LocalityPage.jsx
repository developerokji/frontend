import React, { useState } from 'react';
import LocalityModal from '../components/common/LocalityModal';
import PaginationDropdown from '../components/common/PaginationDropdown';
import { CustomButton } from '../components/common/CustomButton';
import { useLocalities } from '../hooks/useApi';
import { localitiesAPI } from '../services/api';

const LocalityPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLocality, setSelectedLocality] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(25);
  const [deletingId, setDeletingId] = useState(null);

  const { data: localities, loading, error, refetch } = useLocalities(currentPage, limit, searchTerm);

  const handleShowModal = () => {
    setEditMode(false);
    setSelectedLocality(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedLocality(null);
  };

  const handleSaveLocality = async (localityData) => {
    try {
      const payload = {
        stateId: localityData?.state,
        cityId: localityData?.city,
        localityName: localityData?.name,
      };
      if (editMode && selectedLocality) {
        await localitiesAPI.update(selectedLocality.id, payload);
      } else {
        await localitiesAPI.create(payload);
      }
      setShowModal(false);
      setEditMode(false);
      setSelectedLocality(null);
      refetch();
    } catch (err) {
      console.error('Error saving locality:', err);
    }
  };

  const handleEditLocality = (id) => {
    const locality = localities?.items?.find((l) => l.id === id);
    if (locality) {
      setSelectedLocality(locality);
      setEditMode(true);
      setShowModal(true);
    }
  };

  const handleDeleteLocality = async (id) => {
    if (!window.confirm('Are you sure you want to delete this locality?')) return;
    try {
      setDeletingId(id);
      await localitiesAPI.delete(id);
      refetch();
    } catch (err) {
      console.error('Error deleting locality:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const meta = localities?.meta || {};
  const localitiesData =
    localities?.items?.map((item) => ({
      id: item.id,
      city: item.city,
      state_name: item.stateName,
      created_at: item.createdAt,
      state_id: item.stateId,
      city_id: item.cityId,
      locality: item.localityName,
    })) || [];

  const totalItems = meta.totalItems ?? localitiesData.length;
  const totalPages = meta.totalPages || 1;

  return (
    <div className="container-fluid p-2 p-md-3 p-xl-4 w-100 min-w-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h4 className="mb-0 fw-bold">Locality List</h4>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={refetch}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
            Refresh
          </button>
          <CustomButton variant="primary" size="sm" icon="bi-plus-circle" onClick={handleShowModal}>
            Add Locality
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
                  placeholder="Search state, city, pin code..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleSearch('')}
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
                onClick={refetch}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary me-2" role="status"></div>
              <span className="text-muted">Loading localities...</span>
            </div>
          ) : localitiesData.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-geo-alt fs-1 d-block mb-2"></i>
              No localities found
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
                      <th style={{ width: '8%' }}>#</th>
                      <th style={{ width: '30%' }}>State Name</th>
                      <th style={{ width: '28%' }}>City Name</th>
                      <th style={{ width: '18%' }}>Pin Code</th>
                      <th style={{ width: '16%' }} className="text-end">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {localitiesData.map((record, index) => {
                      const srNo = (currentPage - 1) * limit + index + 1;
                      const isDeleting = deletingId === record.id;

                      return (
                        <tr key={record.id ?? index}>
                          <td className="fw-semibold text-muted">{srNo}</td>
                          <td className="fw-semibold text-dark text-truncate" title={record.state_name}>
                            {record.state_name || 'N/A'}
                          </td>
                          <td className="text-dark text-truncate" title={record.city}>
                            {record.city || 'N/A'}
                          </td>
                          <td>
                            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                              {record.locality || 'N/A'}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="d-inline-flex align-items-center justify-content-end gap-2 flex-nowrap">
                              <CustomButton
                                variant="primary"
                                size="sm"
                                icon="bi-pencil"
                                onClick={() => handleEditLocality(record.id)}
                                tooltip="Edit Locality"
                                disabled={isDeleting}
                              />
                              <CustomButton
                                variant="danger"
                                size="sm"
                                icon="bi-trash"
                                loading={isDeleting}
                                onClick={() => handleDeleteLocality(record.id)}
                                tooltip="Delete Locality"
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
                {localitiesData.map((record, index) => {
                  const srNo = (currentPage - 1) * limit + index + 1;
                  const isDeleting = deletingId === record.id;

                  return (
                    <div key={record.id ?? index} className="card border shadow-sm">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span className="badge bg-light text-secondary border me-2">#{srNo}</span>
                            <span className="fw-bold text-dark">{record.city || 'N/A'}</span>
                            <div className="small text-muted mt-1">
                              {record.state_name || 'N/A'} &bull;{' '}
                              <span className="badge bg-secondary-subtle text-secondary border">
                                {record.locality || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="d-inline-flex align-items-center gap-2">
                            <CustomButton
                              variant="primary"
                              size="sm"
                              icon="bi-pencil"
                              onClick={() => handleEditLocality(record.id)}
                              tooltip="Edit Locality"
                              disabled={isDeleting}
                            />
                            <CustomButton
                              variant="danger"
                              size="sm"
                              icon="bi-trash"
                              loading={isDeleting}
                              onClick={() => handleDeleteLocality(record.id)}
                              tooltip="Delete Locality"
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
                Showing {localitiesData.length} of {totalItems} entries
              </span>
              <nav aria-label="Localities pagination">
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

      <LocalityModal
        show={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveLocality}
        editMode={editMode}
        localityData={selectedLocality}
      />
    </div>
  );
};

export default LocalityPage;
