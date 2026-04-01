import React, { useState } from 'react';
import ReactPaginate from '../components/common/ReactPaginate';
import StoryModal from '../components/common/StoryModal';
import DataTable from '../components/common/DataTable';
import CustomButton from '../components/common/CustomButton';
import { useStories } from '../hooks/useApi';
import { storiesAPI } from '../services/api';

const StoriesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [limit, setLimit] = useState(3);

  // Use API hook for stories data
  const { data: stories, loading, error, refetch } = useStories(currentPage, limit, searchTerm);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleSaveStory = async (storyData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add file
      if (storyData.image) {
        formData.append('image', storyData.image);
      }
      
      // Add other fields
      formData.append('status', storyData.status);
      if (storyData.image) {
        formData.append('imageName', storyData.image.name);
      }
      
      // Check if it's edit mode or create mode
      if (editMode && editData.id) {
        // Update existing story
        await storiesAPI.update(editData.id, formData);
      } else {
        // Create new story
        await storiesAPI.create(formData);
      }
      
      setShowModal(false);
      setEditMode(false);
      setEditData({});
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
      title: 'Created Date',
      key: 'created_at',
      className: 'd-none d-md-table-cell',
      render: (text) => <small className="text-muted">{new Date(text).toLocaleDateString()}</small>
    },
    {
      title: 'Image',
      key: 'image_name',
      render: (text, record) => {
        if (record.image_name && record.image_path) {
          // API response - construct full image path
          const imagePath = `${record.image_path}${record.image_name}`;
          return (
            <div className="d-flex align-items-center">
              <img src={imagePath} alt="Story" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
            </div>
          );
        } 
      }
    },
    {
      title: 'Status',
      key: 'status',
      render: (text) => (
        <span className={`badge ${text === 'on' ? 'bg-success' : 'bg-secondary'}`}>
          {text === 'on' ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      className: 'd-none d-lg-table-cell',
      render: (_, record) => (
        <div className="btn-group btn-group-sm" role="group">
          <CustomButton 
            variant="primary" 
            size="sm"
            icon="bi-pencil"
            onClick={() => handleEditStory(record.id)}
            tooltip="Edit Story"
          >
          </CustomButton>
          <CustomButton 
            variant="danger" 
            size="sm"
            icon="bi-trash"
            onClick={() => handleDeleteStory(record.id)}
            tooltip="Delete Story"
          >
          </CustomButton>
        </div>
      )
    }
  ];

  const handleEditStory = (id) => {
    // Find story data and populate modal for editing
    const story = stories?.items.find(s => s.id === id);
    console.log('Editing story:', story);
    if (story) {
      setEditData(story)
      setShowModal(true);
      setEditMode(true);

    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  console.log('Stories data:', stories);
  // Extract stories array and format according to columns
  const storiesData = stories?.items?.map(item => ({
    id: item.id,
    created_at: item.created_at,      // Column 1: Created Date
    image_name: item.image_name,        // Column 2: Image  
    image_path: item.image_path,        // For image rendering
    status: item.status                 // Column 3: Status
  })) || [];
  
  const meta = stories?.meta || {};
  const totalItems = meta.totalItems || storiesData.length;

  return (
    <div className="container-fluid p-3 p-lg-4 w-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <h4 className="mb-0">Stories List</h4>
        <CustomButton variant="primary" icon="bi-plus-circle" onClick={handleShowModal}>
          Add Stories
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
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={storiesData}
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

      <StoryModal 
        show={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveStory}
        setSelectedFile={setSelectedFile}
        selectedFile={selectedFile}
        editMode={editMode}
        storyData={editData}
      />
    </div>
  );
};

export default StoriesPage;
