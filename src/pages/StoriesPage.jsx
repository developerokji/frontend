import React, { useState } from 'react';
import ReactPaginate from '../components/common/ReactPaginate';
import StoryModal from '../components/common/StoryModal';
import DataTable from '../components/common/DataTable';
import { useStories } from '../hooks/useApi';

const StoriesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Use API hook for stories data
  const { data: stories, loading, error, refetch } = useStories(currentPage, 3, searchTerm);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleSaveStory = async (storyData) => {
    try {
      // Here you'll call your backend API
      await storiesAPI.create(storyData);
      setShowModal(false);
      refetch(); // Refresh stories list
    } catch (error) {
      console.error('Error saving story:', error);
      // Handle error (show toast, etc.)
    }
  };

  const handleDeleteStory = async (id) => {
    try {
      await storiesAPI.delete(id);
      refetch(); // Refresh stories list
    } catch (error) {
      console.error('Error deleting story:', error);
      // Handle error
    }
  };

  const columns = [
    {
      title: 'Date',
      key: 'date',
      className: 'd-none d-md-table-cell',
      render: (text) => <small className="text-muted">{text}</small>
    },
    {
      title: 'Image',
      key: 'image',
      render: (text) => (
        <div className="d-flex align-items-center">
          <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', minWidth: '50px' }}>
            <span className="fw-bold">{text}</span>
          </div>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      className: 'd-none d-lg-table-cell',
      render: (_, record) => (
        <div className="btn-group btn-group-sm" role="group">
          <button type="button" className="btn btn-outline-primary" onClick={() => handleEditStory(record.id)}>
            <i className="bi bi-pencil"></i>
          </button>
          <button type="button" className="btn btn-outline-danger" onClick={() => handleDeleteStory(record.id)}>
            <i className="bi bi-trash"></i>
          </button>
        </div>
      )
    }
  ];

  const handleEditStory = (id) => {
    // Find story data and populate modal for editing
    const story = stories.find(s => s.id === id);
    if (story) {
      // Set modal data for editing
      // You can add state for edit modal here
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
        <h4 className="mb-0">Stories List</h4>
        <button className="btn btn-primary" onClick={handleShowModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Add Stories
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
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={stories}
            loading={loading}
            className="flex-grow-1"
          />

          <ReactPaginate
            currentPage={currentPage}
            totalPages={Math.ceil(stories.length / 3)}
            onPageChange={handlePageChange}
            showingFrom={(currentPage - 1) * 3 + 1}
            showingTo={Math.min(currentPage * 3, stories.length)}
            totalItems={stories.length}
          />
        </div>
      </div>

      <StoryModal 
        show={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveStory}
      />
    </div>
  );
};

export default StoriesPage;
