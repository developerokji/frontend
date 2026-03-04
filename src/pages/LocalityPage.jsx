import React, { useState } from 'react';
import ReactPaginate from '../components/common/ReactPaginate';
import DataTable from '../components/common/DataTable';
import LocalityModal from '../components/common/LocalityModal';
import { useLocalities } from '../hooks/useApi';

const LocalityPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Use API hook for localities data
  const { data: localities, loading, error, refetch } = useLocalities(currentPage, 10, searchTerm);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleSaveLocality = async (localityData) => {
    try {
      await localitiesAPI.create(localityData);
      setShowModal(false);
      refetch(); // Refresh localities list
    } catch (error) {
      console.error('Error saving locality:', error);
    }
  };

  const handleDeleteLocality = async (id) => {
    try {
      await localitiesAPI.delete(id);
      refetch(); // Refresh localities list
    } catch (error) {
      console.error('Error deleting locality:', error);
    }
  };

  const columns = [
    {
      title: 'Locality',
      key: 'name',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'State',
      key: 'state',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'City',
      key: 'city',
      render: (text) => <span>{text}</span>
    }
  ];

  const handleEditLocality = (id) => {
    const locality = localities.find(l => l.id === id);
    if (locality) {
      // Set modal data for editing
      setShowModal(true);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container-fluid p-3 p-lg-4 w-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <h4 className="mb-0">Locality List</h4>
        <button className="btn btn-primary" onClick={handleShowModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Add Locality
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}
          
          <div className="row mb-3">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search localities..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={localities}
            loading={loading}
            className="flex-grow-1"
          />

          <ReactPaginate
            currentPage={currentPage}
            totalPages={Math.ceil(localities.length / 10)}
            onPageChange={handlePageChange}
            showingFrom={(currentPage - 1) * 10 + 1}
            showingTo={Math.min(currentPage * 10, localities.length)}
            totalItems={localities.length}
          />
        </div>
      </div>

      <LocalityModal 
        show={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveLocality}
      />
    </div>
  );
};

export default LocalityPage;
