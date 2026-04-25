import React, { useState } from 'react';
import ReactPaginate from '../components/common/ReactPaginate';
import DataTable from '../components/common/DataTable';
import SubCategoryModal from '../components/common/SubCategoryModal';
import ImageModal from '../components/common/ImageModal';
import PaginationDropdown from '../components/common/PaginationDropdown';
import { CustomButton } from '../components/common/CustomButton';
import { useSubCategories, useCategories } from '../hooks/useApi';
import { subCategoriesAPI } from '../services/api';

const AddSubCategoryPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(25);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Use API hook for subcategories data
  const { data: subcategories, loading, error, refetch } = useSubCategories(currentPage, limit, searchTerm);
  
  // Get categories for dropdown
  const { data: categories } = useCategories();
  
  console.log('Categories data for dropdown:', categories);

  const handleShowModal = () => {
    setEditMode(false);
    setSelectedSubCategory(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedSubCategory(null);
    setSelectedFile(null);
  };

  const handleSaveSubCategory = async (subCategoryData) => {
    try {
      // For create mode, image is mandatory
      if (!editMode && !subCategoryData?.image) {
        alert('Sub category image is required!');
        return;
      }
      
      // Prepare data for API
      let apiData = {
        name: subCategoryData?.name,
        categoryId: subCategoryData?.categoryId,
        status: subCategoryData?.status
      };
      
      // Only include image if:
      // 1. Create mode: always include
      // 2. Edit mode: only include if new file is selected
      if (!editMode) {
        // Create mode - include image
        apiData.image = subCategoryData?.image;
      } else {
        // Edit mode - include image only if new file selected
        if (subCategoryData?.image && subCategoryData.image instanceof File) {
          apiData.image = subCategoryData.image;
        }
        // Keep existing image path if no new image selected
        if (!subCategoryData?.image || !(subCategoryData.image instanceof File)) {
          apiData.existingImage = selectedSubCategory?.image;
        }
      }
      
      if (editMode && selectedSubCategory) {
        // Update existing subcategory
        await subCategoriesAPI.update(selectedSubCategory.id, apiData);
      } else {
        // Create new subcategory
        await subCategoriesAPI.create(apiData);
      }
      setShowModal(false);
      setEditMode(false);
      setSelectedSubCategory(null);
      setSelectedFile(null);
      refetch(); // Refresh subcategories list
    } catch (error) {
      console.error('Error saving subcategory:', error);
    }
  };

  const handleEditSubCategory = (id) => {
    const subcategory = subcategories?.items?.find(sc => sc.id === id);
    console.log('Found subcategory for edit:', subcategory); // Debug log
    if (subcategory) {
      setSelectedSubCategory(subcategory);
      setEditMode(true);
      setShowModal(true);
    }
  };

  const handleDeleteSubCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await subCategoriesAPI.delete(id);
        refetch(); // Refresh subcategories list
      } catch (error) {
        console.error('Error deleting subcategory:', error);
      }
    }
  };

  const columns = [
    {
      title: 'Sub Category Name',
      key: 'name',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Category Name',
      key: 'categoryName',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Image',
      key: 'image',
      render: (text) => (
        <img 
          src={text} 
          alt="Sub Category" 
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
              onClick={() => handleEditSubCategory(record.id)}
              tooltip="Edit Sub Category"
            >
            </CustomButton>
            <CustomButton 
              variant="danger" 
              size="sm"
              icon="bi-trash"
              onClick={() => handleDeleteSubCategory(record.id)}
              tooltip="Delete Sub Category"
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

  console.log('SubCategories data:', subcategories);
  
  // Extract meta information from response
  const meta = subcategories?.meta || {};
  
  // Extract subcategories array and format according to columns
  const subcategoriesData = subcategories?.items?.map(item => ({
    id: item.id,
    name: item.name,
    categoryName: item.categoryName,
    image: item.image_path,
    status: item.status,
    categoryId: item.categoryId
  })) || [];
  
  const totalItems = meta.totalItems || subcategoriesData.length;

  return (
    <div className="container-fluid p-3 p-lg-4 w-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <h4 className="mb-0">Add Sub Categories</h4>
        <CustomButton variant="primary" icon="bi-plus-circle" onClick={handleShowModal}>
          Add Sub Category
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
                  placeholder="Search subcategories..."
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
            data={subcategoriesData}
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

      <SubCategoryModal 
        show={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveSubCategory}
        editMode={editMode}
        subCategoryData={selectedSubCategory}
        categories={categories?.items || []}
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

export default AddSubCategoryPage;
