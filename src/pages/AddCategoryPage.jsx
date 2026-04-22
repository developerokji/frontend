import React, { useState } from 'react';
import ReactPaginate from '../components/common/ReactPaginate';
import DataTable from '../components/common/DataTable';
import CategoryModal from '../components/common/CategoryModal';
import ImageModal from '../components/common/ImageModal';
import { CustomButton } from '../components/common/CustomButton';
import { useCategories } from '../hooks/useApi';
import { categoriesAPI } from '../services/api';

const AddCategoryPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Use API hook for categories data
  const { data: categories, loading, error, refetch } = useCategories(currentPage, 10, searchTerm);

  const handleShowModal = () => {
    setEditMode(false);
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedCategory(null);
    setSelectedFile(null);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      // For create mode, image is mandatory
      if (!editMode && !categoryData?.image) {
        alert('Category image is required!');
        return;
      }
      
      // Prepare data for API
      let apiData = {
        categoryName: categoryData?.categoryName,
        status: categoryData?.status
      };
      
      // Only include image if:
      // 1. Create mode: always include
      // 2. Edit mode: only include if new file is selected
      if (!editMode) {
        // Create mode - include image
        apiData.image = categoryData?.image;
      } else {
        // Edit mode - include image only if new file selected
        if (categoryData?.image && categoryData.image instanceof File) {
          apiData.image = categoryData.image;
        }
        // Keep existing image path if no new image selected
        if (!categoryData?.image || !(categoryData.image instanceof File)) {
          apiData.existingImage = selectedCategory?.image_path;
        }
      }
      
      if (editMode && selectedCategory) {
        // Update existing category
        await categoriesAPI.update(selectedCategory.id, apiData);
      } else {
        // Create new category
        await categoriesAPI.create(apiData);
      }
      setShowModal(false);
      setEditMode(false);
      setSelectedCategory(null);
      setSelectedFile(null);
      refetch(); // Refresh categories list
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEditCategory = (id) => {
    const category = categories?.items?.find(c => c.id === id);
    console.log('Found category for edit:', category); // Debug log
    if (category) {
      setSelectedCategory(category);
      setEditMode(true);
      setShowModal(true);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoriesAPI.delete(id);
        refetch(); // Refresh categories list
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const columns = [
    {
      title: 'Category Name',
      key: 'name',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Category Image',
      key: 'image',
      render: (text) => (
        <img 
          src={text} 
          alt="Category" 
          className="cursor-pointer rounded"
          style={{ 
            width: '50px', 
            height: '50px', 
            objectFit: 'cover',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onClick={() => handleImageClick(text)}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        />
      )
    },
    {
      title: 'Created Date',
      key: 'created_at',
      render: (text) => <span>{new Date(text).toLocaleDateString()}</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="d-flex align-items-center gap-2">
          <div className="form-check form-switch">
            <input 
              className="form-check-input" 
              type="checkbox" 
              checked={record.status === 'active'}
              readOnly
              style={{ cursor: 'default' }}
            />
          </div>
          <div className="btn-group btn-group-sm d-flex gap-2" role="group">
            <CustomButton 
              variant="primary" 
              size="sm"
              icon="bi-pencil"
              onClick={() => handleEditCategory(record.id)}
              tooltip="Edit Category"
            >
            </CustomButton>
            <CustomButton 
              variant="danger" 
              size="sm"
              icon="bi-trash"
              onClick={() => handleDeleteCategory(record.id)}
              tooltip="Delete Category"
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

  console.log('Categories data:', categories);
  
  // Extract meta information from response
  const meta = categories?.meta || {};
  
  // Extract categories array and format according to columns
  const categoriesData = categories?.items?.map(item => ({
    id: item.id,
    name: item.name,
    image: item.image_path,
    status: item.status,
    created_at: item.created_at
  })) || [];
  
  const totalItems = meta.totalItems || categoriesData.length;

  return (
    <div className="container-fluid p-3 p-lg-4 w-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <h4 className="mb-0">Add Categories</h4>
        <CustomButton variant="primary" icon="bi-plus-circle" onClick={handleShowModal}>
          Add Category
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
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={categoriesData}
            loading={loading}
            className="flex-grow-1"
          />

          <ReactPaginate
            currentPage={currentPage}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
            showingFrom={(currentPage - 1) * 10 + 1}
            showingTo={Math.min(currentPage * 10, meta.totalItems)}
            totalItems={meta.totalItems}
          />
        </div>
      </div>

      <CategoryModal 
        show={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveCategory}
        editMode={editMode}
        categoryData={selectedCategory}
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

export default AddCategoryPage;
