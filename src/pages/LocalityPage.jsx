import React, { useState } from 'react';
import ReactPaginate from '../components/common/ReactPaginate';
import DataTable from '../components/common/DataTable';
import LocalityModal from '../components/common/LocalityModal';
import PaginationDropdown from '../components/common/PaginationDropdown';
import { CustomButton } from '../components/common/CustomButton';
import { useLocalities, useCities } from '../hooks/useApi';
import { localitiesAPI } from '../services/api';

const LocalityPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLocality, setSelectedLocality] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(25);

  // Use API hook for localities data
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
      let payload={
        stateId:localityData?.state, cityId:localityData?.city, localityName:localityData?.name
      }
      if (editMode && selectedLocality) {
        // Update existing locality
        await localitiesAPI.update(selectedLocality.id, payload);
      } else {
        // Create new locality
        await localitiesAPI.create(payload);
      }
      setShowModal(false);
      setEditMode(false);
      setSelectedLocality(null);
      refetch(); // Refresh localities list
    } catch (error) {
      console.error('Error saving locality:', error);
    }
  };

  const handleEditLocality = (id) => {
    const locality = localities?.items?.find(l => l.id === id);
    console.log('Found locality for edit:', locality); // Debug log
    if (locality) {
      setSelectedLocality(locality);
      setEditMode(true);
      setShowModal(true);
    }
  };

  const handleDeleteLocality = async (id) => {
    if (window.confirm('Are you sure you want to delete this locality?')) {
      try {
        await localitiesAPI.delete(id);
        refetch(); // Refresh localities list
      } catch (error) {
        console.error('Error deleting locality:', error);
      }
    }
  };

  const columns = [
    {
      title: 'Locality Name',
      key: 'locality',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'City Name',
      key: 'city',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'State Name',
      key: 'state_name',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="btn-group btn-group-sm d-flex gap-2" role="group">
          <CustomButton 
            variant="primary" 
            size="sm"
            icon="bi-pencil"
            onClick={() => handleEditLocality(record.id)}
            tooltip="Edit Locality"
          >
          </CustomButton>
          <CustomButton 
            variant="danger" 
            size="sm"
            icon="bi-trash"
            onClick={() => handleDeleteLocality(record.id)}
            tooltip="Delete Locality"
          >
          </CustomButton>
        </div>
      )
    }
  ];

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
    refetch(); // Refetch data with new limit
  };

  console.log('Localities data:', localities);
  
  // Extract meta information from response
  const meta = localities?.meta || {};
  
  // Extract localities array and format according to columns
  const localitiesData = localities?.items?.map(item => ({
    id: item.id,
    city: item.city,                  // Column 1: City
    state_name: item.state_name,       // Column 2: State
    created_at: item.created_at,       // Column 3: Created Date
    state_id: item.state_id,           // For edit functionality
    city_id: item.city_id,
    locality:item.localityName              // For edit functionality
  })) || [];
  
  const totalItems = meta.totalItems || localitiesData.length;

  return (
    <div className="container-fluid p-3 p-lg-4 w-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <h4 className="mb-0">Locality List</h4>
        <CustomButton variant="primary" icon="bi-plus-circle" onClick={handleShowModal}>
          Add Locality
        </CustomButton>
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
            <div className="col-12 col-md-6 col-lg-4">
              <PaginationDropdown 
                limit={limit} 
                onLimitChange={handleLimitChange}
                disabled={loading}
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={localitiesData}
            loading={loading}
            className="flex-grow-1"
          />

          <ReactPaginate
            currentPage={currentPage}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
            showingFrom={(currentPage - 1) * limit + 1}
            showingTo={Math.min(currentPage * limit, meta.totalItems)}
            totalItems={meta.totalItems}
          />
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
