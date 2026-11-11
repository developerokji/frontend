import React, { useState } from 'react';
import BannerModal from '../components/common/BannerModal';
import ImageModal from '../components/common/ImageModal';
import PaginationDropdown from '../components/common/PaginationDropdown';
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
  const [limit, setLimit] = useState(25);
  const [deletingId, setDeletingId] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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
      const formData = new FormData();
      if (bannerData.image) {
        formData.append('bannerImage', bannerData.image);
      }
      formData.append('bannerTitle', bannerData.banner_title);
      formData.append('bannerDesc', bannerData.banner_desc);
      formData.append('categoryId', bannerData.category_id);
      formData.append('status', bannerData.status);
      formData.append('show', bannerData.is_visible);

      if (bannerData.sub_category_id) {
        formData.append('subCategoryId', bannerData.sub_category_id);
      }
      if (bannerData.service_id) {
        formData.append('serviceId', bannerData.service_id);
      }
      if (bannerData.image) {
        formData.append('imageName', bannerData.image.name);
      }

      if (editMode && selectedBanner?.id) {
        await bannersAPI.update(selectedBanner.id, formData);
      } else {
        await bannersAPI.create(formData);
      }

      setShowModal(false);
      setEditMode(false);
      setSelectedBanner(null);
      refetch();
    } catch (err) {
      console.error('Error saving banner:', err);
    }
  };

  const handleEditBanner = (id) => {
    const banner = banners?.items?.find((b) => b.id === id);
    if (banner) {
      setSelectedBanner(banner);
      setEditMode(true);
      setShowModal(true);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      setDeletingId(id);
      await bannersAPI.delete(id);
      refetch();
    } catch (err) {
      console.error('Error deleting banner:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'on' ? 'off' : 'on';
      const formData = new FormData();
      formData.append('status', newStatus);
      await bannersAPI.update(id, formData);
      refetch();
    } catch (err) {
      console.error('Error updating banner status:', err);
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

  const bannersData =
    banners?.items?.map((item) => ({
      id: item.id,
      category_id: item.categoryId,
      banner_title: item.bannerTitle,
      banner_desc: item.bannerDesc,
      banner_img: item.imagePath,
      banner_img_path: item.imagePath,
      status: item.status,
      is_visible: item.isVisible,
      sub_category_id: item.subCategoryId,
      service_id: item.serviceId,
      category_name: item.categoryName,
      sub_category_name: item.subCategoryName,
    })) || [];

  const meta = banners?.meta || {};
  const totalItems = meta.totalItems ?? bannersData.length;
  const totalPages = meta.totalPages || 1;

  return (
    <div className="container-fluid p-2 p-md-3 p-xl-4 w-100 min-w-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h4 className="mb-0 fw-bold">Banner List</h4>
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
            Add Banner
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
                  placeholder="Search banners..."
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
              <span className="text-muted">Loading banners...</span>
            </div>
          ) : bannersData.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-image fs-1 d-block mb-2"></i>
              No banners found
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
                      <th style={{ width: '18%' }}>Category</th>
                      <th style={{ width: '24%' }}>Title</th>
                      <th style={{ width: '22%' }}>Description</th>
                      <th style={{ width: '13%' }}>Image</th>
                      <th style={{ width: '16%' }} className="text-end">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bannersData.map((record, index) => {
                      const srNo = (currentPage - 1) * limit + index + 1;
                      const isActive = record.status === 'on';
                      const isDeleting = deletingId === record.id;

                      return (
                        <tr key={record.id ?? index}>
                          <td className="fw-semibold text-muted">{srNo}</td>

                          <td className="text-truncate">
                            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                              {record.category_name || 'N/A'}
                            </span>
                          </td>

                          <td className="fw-semibold text-dark text-truncate" title={record.banner_title}>
                            {record.banner_title || 'N/A'}
                          </td>

                          <td className="text-muted text-truncate" title={record.banner_desc || '-'}>
                            {record.banner_desc || '-'}
                          </td>

                          <td>
                            {record.banner_img_path ? (
                              <img
                                src={record.banner_img_path}
                                alt="Banner"
                                className="rounded cursor-pointer"
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  objectFit: 'cover',
                                  border: '1px solid #dee2e6',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s',
                                }}
                                onClick={() => handleImageClick(record.banner_img_path)}
                                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
                                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                              />
                            ) : (
                              <span className="text-muted small">No Image</span>
                            )}
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
                                onClick={() => handleEditBanner(record.id)}
                                tooltip="Edit Banner"
                                disabled={isDeleting}
                              />
                              <CustomButton
                                variant="danger"
                                size="sm"
                                icon="bi-trash"
                                loading={isDeleting}
                                onClick={() => handleDeleteBanner(record.id)}
                                tooltip="Delete Banner"
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
                {bannersData.map((record, index) => {
                  const srNo = (currentPage - 1) * limit + index + 1;
                  const isActive = record.status === 'on';
                  const isDeleting = deletingId === record.id;

                  return (
                    <div key={record.id ?? index} className="card border shadow-sm">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div className="d-flex align-items-start gap-2 min-w-0">
                            {record.banner_img_path && (
                              <img
                                src={record.banner_img_path}
                                alt="Banner"
                                className="rounded flex-shrink-0"
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  objectFit: 'cover',
                                  border: '1px solid #dee2e6',
                                }}
                                onClick={() => handleImageClick(record.banner_img_path)}
                              />
                            )}
                            <div className="min-w-0">
                              <span className="badge bg-light text-secondary border me-1">#{srNo}</span>
                              <span className="fw-bold text-dark">{record.banner_title || 'N/A'}</span>
                              <div className="mt-1">
                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                  {record.category_name || 'N/A'}
                                </span>
                              </div>
                              {record.banner_desc && (
                                <div className="small text-muted text-truncate mt-1">
                                  {record.banner_desc}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="d-inline-flex align-items-center gap-2 flex-shrink-0">
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
                              onClick={() => handleEditBanner(record.id)}
                              tooltip="Edit Banner"
                              disabled={isDeleting}
                            />
                            <CustomButton
                              variant="danger"
                              size="sm"
                              icon="bi-trash"
                              loading={isDeleting}
                              onClick={() => handleDeleteBanner(record.id)}
                              tooltip="Delete Banner"
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
                Showing {bannersData.length} of {totalItems} entries
              </span>
              <nav aria-label="Banners pagination">
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

      <BannerModal
        show={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveBanner}
        editMode={editMode}
        bannerData={selectedBanner}
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

export default BannerPage;
