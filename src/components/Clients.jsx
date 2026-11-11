import React, { useState, useEffect } from 'react';
import ClientModal from './common/ClientModal';
import PaginationDropdown from './common/PaginationDropdown';
import { clientsAPI } from '../services/api';
import { useDebounce } from '../hooks/useApi';
import { CustomButton } from './common/CustomButton';

const Clients = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
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
  const [limit, setLimit] = useState(25);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await clientsAPI.getAll(currentPage, limit, debouncedSearch);
      if (response?.data && response.data.items) {
        setClients(response.data.items);
        setTotalItems(response.data.meta?.totalItems ?? response.data.items.length);
        setTotalPages(response.data.meta?.totalPages || 1);
      } else if (response?.items) {
        setClients(response.items);
        setTotalItems(response.meta?.totalItems ?? response.items.length);
        setTotalPages(response.meta?.totalPages || 1);
      } else if (response?.data) {
        const list = Array.isArray(response.data) ? response.data : [];
        setClients(list);
        setTotalItems(list.length);
        setTotalPages(1);
      } else {
        setClients([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load clients. Please try again.');
      setClients([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [currentPage, debouncedSearch, limit]);

  const handleShowModal = () => {
    setEditMode(false);
    setSelectedClient(null);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setEditMode(false);
    setSelectedClient(null);
  };

  const handleEditClient = (client) => {
    setEditMode(true);
    setSelectedClient(client);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleSaveClient = async (clientData) => {
    try {
      setError(null);
      if (editMode && selectedClient) {
        await clientsAPI.update(selectedClient.id, clientData);
      } else {
        await clientsAPI.create(clientData);
      }
      await loadClients();
      handleCloseModal();
    } catch (err) {
      console.error('Save client error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save client.');
    }
  };

  const handleDeleteClient = async (client) => {
    const clientId = client.id;
    const clientName = client.name || `#${clientId}`;
    if (!window.confirm(`Are you sure you want to delete client "${clientName}"?`)) {
      return;
    }

    try {
      setDeletingId(clientId);
      setError(null);
      setSuccessMsg(null);
      await clientsAPI.delete(clientId);
      setClients((prev) => prev.filter((c) => c.id !== clientId));
      setTotalItems((prev) => Math.max(0, prev - 1));
      setSuccessMsg(`Client "${clientName}" deleted successfully.`);
      await loadClients();
    } catch (err) {
      console.error('Delete client error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete client.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setError(null);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await clientsAPI.update(id, { accountStatus: newStatus });
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, accountStatus: newStatus } : c))
      );
    } catch (err) {
      console.error('Error toggling client status:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update client status.');
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
        <h4 className="mb-0 fw-bold">Client List</h4>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={loadClients}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
            Refresh
          </button>
          <CustomButton variant="primary" size="sm" icon="bi-plus-circle" onClick={handleShowModal}>
            Add Client
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
                  placeholder="Search client name, phone, email..."
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
                onClick={loadClients}
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
              <span className="text-muted">Loading clients...</span>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-people fs-1 d-block mb-2"></i>
              No clients found
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
                      <th style={{ width: '25%' }}>Client Name</th>
                      <th style={{ width: '18%' }}>Phone</th>
                      <th style={{ width: '24%' }}>Email</th>
                      <th style={{ width: '11%' }} className="text-center">
                        Status
                      </th>
                      <th style={{ width: '15%' }} className="text-end">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((record, index) => {
                      const srNo = (currentPage - 1) * limit + index + 1;
                      const isActive = record.accountStatus === 'active';
                      const isDeleting = deletingId === record.id;

                      return (
                        <tr key={record.id ?? index}>
                          <td className="fw-semibold text-muted">{srNo}</td>

                          {/* Client Name */}
                          <td className="text-truncate">
                            <div className="fw-semibold text-dark text-truncate" title={record.name}>
                              {record.name || 'N/A'}
                            </div>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                              ID: #{record.id}
                            </span>
                          </td>

                          {/* Phone */}
                          <td className="text-truncate">
                            <div className="text-dark">
                              <i className="bi bi-telephone me-1 text-primary"></i>
                              {record.phone || 'N/A'}
                            </div>
                          </td>

                          {/* Email */}
                          <td className="text-truncate">
                            <div
                              className="text-muted text-truncate"
                              title={record.email || 'N/A'}
                            >
                              <i className="bi bi-envelope me-1"></i>
                              {record.email || 'N/A'}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="text-center">
                            <span
                              className={`badge ${
                                isActive ? 'bg-success' : 'bg-secondary'
                              } text-uppercase`}
                              style={{ fontSize: '0.72rem' }}
                            >
                              {record.accountStatus || 'inactive'}
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
                                  onChange={() => handleToggleStatus(record.id, record.accountStatus)}
                                  style={{ cursor: 'pointer', width: '2.25em', height: '1.15em' }}
                                  title={
                                    isActive
                                      ? 'Active (Click to set inactive)'
                                      : 'Inactive (Click to set active)'
                                  }
                                />
                              </div>
                              <CustomButton
                                variant="primary"
                                size="sm"
                                icon="bi-pencil"
                                onClick={() => handleEditClient(record)}
                                tooltip="Edit Client"
                                disabled={isDeleting}
                              />
                              <CustomButton
                                variant="danger"
                                size="sm"
                                icon="bi-trash"
                                loading={isDeleting}
                                onClick={() => handleDeleteClient(record)}
                                tooltip="Delete Client"
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
                {clients.map((record, index) => {
                  const srNo = (currentPage - 1) * limit + index + 1;
                  const isActive = record.accountStatus === 'active';
                  const isDeleting = deletingId === record.id;

                  return (
                    <div key={record.id ?? index} className="card border shadow-sm">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <span className="badge bg-light text-secondary border me-2">#{srNo}</span>
                            <span className="fw-bold text-dark">{record.name || 'N/A'}</span>
                            <div className="small text-muted mt-1">
                              <i className="bi bi-telephone me-1 text-primary"></i>
                              {record.phone || 'N/A'}
                            </div>
                            {record.email && (
                              <div className="small text-muted text-truncate">
                                <i className="bi bi-envelope me-1"></i>
                                {record.email}
                              </div>
                            )}
                          </div>
                          <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
                            {record.accountStatus || 'inactive'}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
                          <span className="small text-muted">ID: #{record.id}</span>
                          <div className="d-inline-flex align-items-center gap-2">
                            <div className="form-check form-switch mb-0 d-flex align-items-center">
                              <input
                                className="form-check-input m-0"
                                type="checkbox"
                                checked={isActive}
                                onChange={() => handleToggleStatus(record.id, record.accountStatus)}
                                style={{ cursor: 'pointer', width: '2.25em', height: '1.15em' }}
                              />
                            </div>
                            <CustomButton
                              variant="primary"
                              size="sm"
                              icon="bi-pencil"
                              onClick={() => handleEditClient(record)}
                              tooltip="Edit Client"
                              disabled={isDeleting}
                            />
                            <CustomButton
                              variant="danger"
                              size="sm"
                              icon="bi-trash"
                              loading={isDeleting}
                              onClick={() => handleDeleteClient(record)}
                              tooltip="Delete Client"
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
                Showing {clients.length} of {totalItems} entries
              </span>
              <nav aria-label="Clients pagination">
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

      <ClientModal
        show={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveClient}
        editMode={editMode}
        clientData={selectedClient}
        setSelectedFile={setSelectedFile}
        selectedFile={selectedFile}
      />
    </div>
  );
};

export default Clients;
