import React, { useState } from 'react';
import ReactPaginate from '../components/common/ReactPaginate';
import DataTable from '../components/common/DataTable';
import BannerModal from '../components/common/BannerModal';
import CustomButton from '../components/common/CustomButton';
import { useBanners } from '../hooks/useApi';

const BannerPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Use API hook for banners data
  const { data: banners, loading, error, refetch } = useBanners(currentPage, 10, searchTerm);

  const handleShowModal = () => {
    setEditMode(false);
    setSelectedBanner(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedBanner(null);
  };

  const handleSaveBanner = async (bannerData) => {
    try {
      if (editMode && selectedBanner) {
        // Update existing banner
        await bannersAPI.update(selectedBanner.id, bannerData);
      } else {
        // Create new banner
        await bannersAPI.create(bannerData);
      }
      setShowModal(false);
      setEditMode(false);
      setSelectedBanner(null);
      refetch(); // Refresh banners list
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };

  const handleEditBanner = (id) => {
    const banner = banners.find(b => b.id === id);
    if (banner) {
      setSelectedBanner(banner);
      setEditMode(true);
      setShowModal(true);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await bannersAPI.delete(id);
        refetch(); // Refresh banners list
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  const columns = [
    {
      title: 'Title',
      key: 'title',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Description',
      key: 'description',
      render: (text) => <span>{text ? text.substring(0, 50) + '...' : '-'}</span>
    },
    {
      title: 'Status',
      key: 'status',
      render: (text) => (
        <span className={`badge ${text === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
          {text}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="btn-group" role="group">
          <CustomButton 
            variant="primary" 
            size="sm"
            icon="bi-pencil"
            onClick={() => handleEditBanner(record.id)}
            tooltip="Edit Banner"
          >
          </CustomButton>
          <CustomButton 
            variant="danger" 
            size="sm"
            icon="bi-trash"
            onClick={() => handleDeleteBanner(record.id)}
            tooltip="Delete Banner"
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

  return (
    <div className="container-fluid p-3 p-lg-4 w-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <h4 className="mb-0">Banner List</h4>
        <CustomButton variant="primary" icon="bi-plus-circle" onClick={handleShowModal}>
          Add Banner
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
                  placeholder="Search banners..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={banners}
            loading={loading}
            className="flex-grow-1"
          />

          <ReactPaginate
            currentPage={currentPage}
            totalPages={Math.ceil(banners.length / 10)}
            onPageChange={handlePageChange}
            showingFrom={(currentPage - 1) * 10 + 1}
            showingTo={Math.min(currentPage * 10, banners.length)}
            totalItems={banners.length}
          />
        </div>
      </div>

      <BannerModal 
        show={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveBanner}
        editMode={editMode}
        bannerData={selectedBanner}
      />
    </div>
  );
};

export default BannerPage;
