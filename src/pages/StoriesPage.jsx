import React, { useState } from 'react';
import ReactPaginate from '../components/common/ReactPaginate';
import StoryModal from '../components/common/StoryModal';
import DataTable from '../components/common/DataTable';
import ImageModal from '../components/common/ImageModal';
import PaginationDropdown from '../components/common/PaginationDropdown';
import { CustomButton } from '../components/common/CustomButton';
import { useStories } from '../hooks/useApi';
import { storiesAPI } from '../services/api';

const StoriesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [limit, setLimit] = useState(25);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'on' ? 'off' : 'on';
      const formData = new FormData();
      formData.append('status', newStatus);
      
      await storiesAPI.update(id, formData);
      refetch(); // Refresh stories list
    } catch (error) {
      console.error('Error toggling story status:', error);
      // Handle error (show toast, etc.)
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${day} ${month} ${year} ${displayHours}:${minutes} ${ampm}`;
  };

  const columns = [
    {
      title: 'Date',
      key: 'created_at',
      className: 'd-none d-md-table-cell',
      render: (text) => <small className="text-muted">{formatDate(text)}</small>
    },
    {
      title: 'Image',
      key: 'image_name',
      render: (text, record) => {
        if (record.image_name && record.imagePath) {
          // API response - construct full image path
          const imagePath = `${record.imagePath}`;
          return (
            <div className="d-flex align-items-center">
              <img 
                src={imagePath} 
                alt="Story" 
                className="cursor-pointer rounded"
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  objectFit: 'cover',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onClick={() => handleImageClick(imagePath)}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              />
            </div>
          );
        } 
        return <span>No Image</span>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      className: 'd-none d-lg-table-cell',
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
          <div className="btn-group btn-group-sm" role="group">
            <CustomButton 
              variant="primary" 
              size="sm"
              icon="bi-pencil"
              onClick={() => handleEditStory(record.id)}
              tooltip="Edit Story"
              className="me-2"
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
        </div>
      )
    }
  ];

  const handleDeleteStory = async (id) => {
    try {
      await storiesAPI.delete(id);
      refetch(); // Refresh stories list
    } catch (error) {
      console.error('Error deleting story:', error);
      // Handle error
    }
  };
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

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  console.log('Stories data:', stories);
  // Extract stories array and format according to columns
  const storiesData = stories?.items?.map(item => ({
    id: item.id,
    created_at: item.createdAt,      // Column 1: Created Date
    image_name: item.imageName,        // Column 2: Image  
    imagePath: item.imagePath,        // For image rendering
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
            data={storiesData}
            loading={loading}
            className="flex-grow-1"
          />

          <ReactPaginate
            currentPage={currentPage}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
            showingFrom={(currentPage - 1) * 25 + 1}
            showingTo={Math.min(currentPage * 25, meta.totalItems)}
            totalItems={meta.totalItems}
          />
        </div>
      </div>

<StoryModal 
show={showModal}
handleClose={handleCloseModal}
handleSave={handleSaveStory}
editMode={editMode}
editData={editData}
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

export default StoriesPage;
