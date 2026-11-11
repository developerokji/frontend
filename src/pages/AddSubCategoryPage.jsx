import React, { useState } from 'react';
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
  const [deletingId, setDeletingId] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { data: subcategories, loading, error, refetch } = useSubCategories(
    currentPage,
    limit,
    searchTerm
  );
  const { data: categories } = useCategories();

  const handleShowModal = () => {
    setEditMode(false);
    setSelectedSubCategory(null);
    setSelectedFile(null);
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
      if (!editMode && !subCategoryData?.image) {
        alert('Sub category image is required!');
        return;
      }

      const apiData = {
        name: subCategoryData?.name,
        categoryId: subCategoryData?.categoryId,
        status: subCategoryData?.status,
      };

      if (!editMode) {
        apiData.image = subCategoryData?.image;
      } else {
        if (subCategoryData?.image && subCategoryData.image instanceof File) {
          apiData.image = subCategoryData.image;
        }
        if (!subCategoryData?.image || !(subCategoryData.image instanceof File)) {
          apiData.existingImage = selectedSubCategory?.image;
        }
      }

      if (editMode && selectedSubCategory) {
        await subCategoriesAPI.update(selectedSubCategory.id, apiData);
      } else {
        await subCategoriesAPI.create(apiData);
      }
      setShowModal(false);
      setEditMode(false);
      setSelectedSubCategory(null);
      setSelectedFile(null);
      refetch();
    } catch (err) {
      console.error('Error saving subcategory:', err);
    }
  };

  const handleEditSubCategory = (id) => {
    const subcategory = subcategories?.items?.find((sc) => sc.id === id);
    if (subcategory) {
      setSelectedSubCategory(subcategory);
      setEditMode(true);
      setShowModal(true);
    }
  };

  const handleDeleteSubCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      setDeletingId(id);
      await subCategoriesAPI.delete(id);
      refetch();
    } catch (err) {
      console.error('Error deleting subcategory:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await subCategoriesAPI.update(id, { status: newStatus });
      refetch();
    } catch (err) {
      console.error('Error toggling subcategory status:', err);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const meta = subcategories?.meta || {};
  const subcategoriesData =
    subcategories?.items?.map((item) => ({
      id: item.id,
      name: item.name,
      categoryName: item.categoryName,
      image: item.imagePath,
      status: item.status,
      categoryId: item.categoryId,
    })) || [];

  const totalItems = meta.totalItems ?? subcategoriesData.length;
  const totalPages = meta.totalPages || 1;

  return (
    <div className="container-fluid p-2 p-md-3 p-xl-4 w-100 min-w-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h4 className="mb-0 fw-bold">Add Sub Categories</h4>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={refetch}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
            Refresh
          </button>
          <CustomButton variant="primary" size="sm" icon="bi-plus-circle" onClick={handleShowModal}>
            Add Sub Category
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
                  placeholder="Search subcategories..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleSearch('')}
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
                onClick={refetch}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary me-2" role="status"></div>
              <span className="text-muted">Loading subcategories...</span>
            </div>
          ) : subcategoriesData.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-plus-square fs-1 d-block mb-2"></i>
              No subcategories found
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
                      <th style={{ width: '30%' }}>Sub Category Name</th>
                      <th style={{ width: '23%' }}>Category</th>
                      <th style={{ width: '13%' }}>Image</th>
                      <th style={{ width: '11%' }} className="text-center">
                        Status
                      </th>
                      <th style={{ width: '16%' }} className="text-end">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subcategoriesData.map((record, index) => {
                      const srNo = (currentPage - 1) * limit + index + 1;
                      const isActive = record.status === 'active';
                      const isDeleting = deletingId === record.id;

                      return (
                        <tr key={record.id ?? index}>
                          <td className="fw-semibold text-muted">{srNo}</td>

                          <td className="fw-semibold text-dark text-truncate" title={record.name}>
                            {record.name || 'N/A'}
                          </td>

                          <td className="text-truncate">
                            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                              {record.categoryName || 'N/A'}
                            </span>
                          </td>

                          <td>
                            {record.image ? (
                              <img
                                src={record.image}
                                alt={record.name}
                                className="rounded cursor-pointer"
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  objectFit: 'cover',
                                  border: '1px solid #dee2e6',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s',
                                }}
                                onClick={() => handleImageClick(record.image)}
                                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
                                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                              />
                            ) : (
                              <span className="text-muted small">No Image</span>
                            )}
                          </td>

                          <td className="text-center">
                            <span
                              className={`badge ${
                                isActive ? 'bg-success' : 'bg-secondary'
                              } text-uppercase`}
                              style={{ fontSize: '0.72rem' }}
                            >
                              {record.status || 'inactive'}
                            </span>
                          </td>

                          <td className="text-end">
                            <div className="d-inline-flex align-items-center justify-content-end gap-2 flex-nowrap">
                              <div className="form-check form-switch mb-0 d-flex align-items-center">
                                <input
                                  className="form-check-input m-0"
                                  type="checkbox"
                                  checked={isActive}
                                  onChange={() => handleToggleStatus(record.id, record.status)}
                                  style={{ cursor: 'pointer', width: '2.25em', height: '1.15em' }}
                                  title={isActive ? 'Active (Click to disable)' : 'Inactive (Click to enable)'}
                                />
                              </div>
                              <CustomButton
                                variant="primary"
                                size="sm"
                                icon="bi-pencil"
                                onClick={() => handleEditSubCategory(record.id)}
                                tooltip="Edit Sub Category"
                                disabled={isDeleting}
                              />
                              <CustomButton
                                variant="danger"
                                size="sm"
                                icon="bi-trash"
                                loading={isDeleting}
                                onClick={() => handleDeleteSubCategory(record.id)}
                                tooltip="Delete Sub Category"
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
                {subcategoriesData.map((record, index) => {
                  const srNo = (currentPage - 1) * limit + index + 1;
                  const isActive = record.status === 'active';
                  const isDeleting = deletingId === record.id;

                  return (
                    <div key={record.id ?? index} className="card border shadow-sm">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2 min-w-0">
                            {record.image && (
                              <img
                                src={record.image}
                                alt={record.name}
                                className="rounded flex-shrink-0"
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  objectFit: 'cover',
                                  border: '1px solid #dee2e6',
                                }}
                                onClick={() => handleImageClick(record.image)}
                              />
                            )}
                            <div className="min-w-0">
                              <span className="badge bg-light text-secondary border me-1">#{srNo}</span>
                              <span className="fw-bold text-dark">{record.name || 'N/A'}</span>
                              <div className="mt-1">
                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                  {record.categoryName || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="d-inline-flex align-items-center gap-2 flex-shrink-0 ms-2">
                            <div className="form-check form-switch mb-0 d-flex align-items-center">
                              <input
                                className="form-check-input m-0"
                                type="checkbox"
                                checked={isActive}
                                onChange={() => handleToggleStatus(record.id, record.status)}
                                style={{ cursor: 'pointer', width: '2.25em', height: '1.15em' }}
                              />
                            </div>
                            <CustomButton
                              variant="primary"
                              size="sm"
                              icon="bi-pencil"
                              onClick={() => handleEditSubCategory(record.id)}
                              tooltip="Edit Sub Category"
                              disabled={isDeleting}
                            />
                            <CustomButton
                              variant="danger"
                              size="sm"
                              icon="bi-trash"
                              loading={isDeleting}
                              onClick={() => handleDeleteSubCategory(record.id)}
                              tooltip="Delete Sub Category"
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
                Showing {subcategoriesData.length} of {totalItems} entries
              </span>
              <nav aria-label="Subcategories pagination">
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
