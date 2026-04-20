import React, { useState } from 'react';
import ReactPaginate from '../components/common/ReactPaginate';
import DataTable from '../components/common/DataTable';
import BannerModal from '../components/common/BannerModal';
import ImageModal from '../components/common/ImageModal';
import { CustomButton } from '../components/common/CustomButton';
import { useBanners } from '../hooks/useApi';
import { bannersAPI } from '../services/api';

const BannerPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [limit, setLimit] = useState(3);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Use API hook for banners data
  const { data: banners, loading, error, refetch } = useBanners(currentPage, limit, searchTerm);

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
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add file
      if (bannerData.image) {
        formData.append('banner_img', bannerData.image);
      }
      
      // Add other fields
      formData.append('category_id', bannerData.category_id);
      formData.append('banner_title', bannerData.banner_title);
      formData.append('banner_desc', bannerData.banner_desc);
      formData.append('status', bannerData.status);
      formData.append('is_visible', bannerData.is_visible);
      
      // Add optional fields if they exist
      if (selectedBanner?.sub_category_id) {
        formData.append('sub_category_id', selectedBanner.sub_category_id);
      }
      if (selectedBanner?.service_id) {
        formData.append('service_id', selectedBanner.service_id);
      }
      
      if (bannerData.image) {
        formData.append('imageName', bannerData.image.name);
      }
      
      // Check if it's edit mode or create mode
      if (editMode && selectedBanner?.id) {
        // Update existing banner
        await bannersAPI.update(selectedBanner.id, formData);
      } else {
        // Create new banner
        await bannersAPI.create(formData);
      }
      
      setShowModal(false);
      setEditMode(false);
      setSelectedBanner(null);
      refetch(); // Refresh banners list
    } catch (error) {
      console.error('Error saving banner:', error);
      // Handle error (show toast, etc.)
    }
  };

  const handleEditBanner = (id) => {
    // Find banner data and populate modal for editing
    const banner = banners?.items?.find(b => b.id === id);
    console.log('Editing banner:', banner);
    if (banner) {
      setSelectedBanner(banner);
      setEditMode(true);
      setShowModal(true);
    }
  };

  const handleDeleteBanner = async (id) => {
    try {
      await bannersAPI.delete(id);
      refetch(); // Refresh banners list
    } catch (error) {
      console.error('Error deleting banner:', error);
      // Handle error
    }
  };

  const columns = [
    {
      title: 'Category',
      key: 'category_id',
      render: (text) => (
        <span >
          {text}
        </span>
      )
    },
    {
      title: 'Title',
      key: 'banner_title',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Desc',
      key: 'banner_desc',
      render: (text) => <span>{text ? text.substring(0, 50) + '...' : '-'}</span>
    },
    {
      title: 'Image',
      key: 'banner_img',
      render: (text, record) => {
        if (record.banner_img && record.banner_img_path) {
          // Construct full image path
          const imagePath = `${record.banner_img_path}${record.banner_img}`;
          return (
            <div className="d-flex align-items-center">
              <img 
                src={imagePath} 
                alt="Banner" 
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
      title: 'Action',
      key: 'actions',
      className: 'd-none d-lg-table-cell',
      render: (_, record) => (
        <div className="d-flex align-items-center gap-2">
          <div className="form-check form-switch">
            <input 
              className="form-check-input" 
              type="checkbox" 
              checked={record.status === 'on'}
              readOnly
              style={{ cursor: 'default' }}
            />
          </div>
          <div className="btn-group btn-group-sm" role="group">
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

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  console.log('Banners data:', banners);
  // Extract banners array and format according to columns
  const bannersData = banners?.items?.map(item => ({
    id: item.id,
    category_id: item.category_id,           // Column 1: Category
    banner_title: item.banner_title,         // Column 2: Title
    banner_desc: item.banner_desc,           // Column 3: Description
    banner_img: item.banner_img,             // Column 4: Image name
    banner_img_path: item.banner_img_path,    // For image rendering
    status: item.status,                    // Column 5: Status
    is_visible: item.is_visible,             // For position visibility
    sub_category_id: item.sub_category_id,   // Additional fields
    service_id: item.service_id,             // Additional fields
    created_at: item.created_at              // Created date
  })) || [];
  
  const meta = banners?.meta || {};
  const totalItems = meta.totalItems || bannersData.length;

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
            data={bannersData}
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

      <BannerModal 
        show={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveBanner}
        setSelectedFile={setSelectedFile}
        selectedFile={selectedFile}
        editMode={editMode}
        bannerData={selectedBanner}
      />

      <ImageModal
        show={showImageModal}
        handleClose={handleCloseImageModal}
        imageUrl={selectedImage}
      />
    </div>
  );
};

export default BannerPage;
