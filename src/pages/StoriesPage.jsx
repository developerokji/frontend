import React, { useState } from 'react';
import StoryModal from '../components/common/StoryModal';
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
  const [deletingId, setDeletingId] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { data: stories, loading, error, refetch } = useStories(currentPage, limit, searchTerm);

  const handleShowModal = () => {
    setEditMode(false);
    setEditData({});
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setEditData({});
    setSelectedFile(null);
  };

  const handleSaveStory = async (storyData) => {
    try {
      const formData = new FormData();
      if (storyData.image) {
        formData.append('image', storyData.image);
      }
      formData.append('status', storyData.status);
      if (storyData.image) {
        formData.append('imageName', storyData.image.name);
      }

      if (editMode && editData.id) {
        await storiesAPI.update(editData.id, formData);
      } else {
        await storiesAPI.create(formData);
      }

      setShowModal(false);
      setEditMode(false);
      setEditData({});
      refetch();
    } catch (err) {
      console.error('Error saving story:', err);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'on' ? 'off' : 'on';
      const formData = new FormData();
      formData.append('status', newStatus);
      await storiesAPI.update(id, formData);
      refetch();
    } catch (err) {
      console.error('Error toggling story status:', err);
    }
  };

  const handleDeleteStory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    try {
      setDeletingId(id);
      await storiesAPI.delete(id);
      refetch();
    } catch (err) {
      console.error('Error deleting story:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditStory = (id) => {
    const story = stories?.items?.find((s) => s.id === id);
    if (story) {
      setEditData(story);
      setEditMode(true);
      setShowModal(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
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

  const storiesData =
    stories?.items?.map((item) => ({
      id: item.id,
      created_at: item.createdAt,
      image_name: item.imageName,
      imagePath: item.imagePath,
      status: item.status,
    })) || [];

  const meta = stories?.meta || {};
  const totalItems = meta.totalItems ?? storiesData.length;
  const totalPages = meta.totalPages || 1;

  return (
    <div className="container-fluid p-2 p-md-3 p-xl-4 w-100 min-w-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h4 className="mb-0 fw-bold">Stories List</h4>
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
            Add Stories
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
                  placeholder="Search stories..."
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
              <span className="text-muted">Loading stories...</span>
            </div>
          ) : storiesData.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-book fs-1 d-block mb-2"></i>
              No stories found
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
                      <th style={{ width: '8%' }}>#</th>
                      <th style={{ width: '37%' }}>Created Date</th>
                      <th style={{ width: '25%' }}>Story Image</th>
                      <th style={{ width: '12%' }} className="text-center">
                        Status
                      </th>
                      <th style={{ width: '18%' }} className="text-end">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {storiesData.map((record, index) => {
                      const srNo = (currentPage - 1) * limit + index + 1;
                      const isActive = record.status === 'on';
                      const isDeleting = deletingId === record.id;

                      return (
                        <tr key={record.id ?? index}>
                          <td className="fw-semibold text-muted">{srNo}</td>

                          <td className="text-muted">{formatDate(record.created_at)}</td>

                          <td>
                            {record.imagePath ? (
                              <img
                                src={record.imagePath}
                                alt="Story"
                                className="rounded cursor-pointer"
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  objectFit: 'cover',
                                  border: '1px solid #dee2e6',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s',
                                }}
                                onClick={() => handleImageClick(record.imagePath)}
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
                              {isActive ? 'Active' : 'Inactive'}
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
                                onClick={() => handleEditStory(record.id)}
                                tooltip="Edit Story"
                                disabled={isDeleting}
                              />
                              <CustomButton
                                variant="danger"
                                size="sm"
                                icon="bi-trash"
                                loading={isDeleting}
                                onClick={() => handleDeleteStory(record.id)}
                                tooltip="Delete Story"
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
                {storiesData.map((record, index) => {
                  const srNo = (currentPage - 1) * limit + index + 1;
                  const isActive = record.status === 'on';
                  const isDeleting = deletingId === record.id;

                  return (
                    <div key={record.id ?? index} className="card border shadow-sm">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            {record.imagePath && (
                              <img
                                src={record.imagePath}
                                alt="Story"
                                className="rounded flex-shrink-0"
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  objectFit: 'cover',
                                  border: '1px solid #dee2e6',
                                }}
                                onClick={() => handleImageClick(record.imagePath)}
                              />
                            )}
                            <div>
                              <span className="badge bg-light text-secondary border me-1">#{srNo}</span>
                              <div className="small text-muted mt-1">{formatDate(record.created_at)}</div>
                            </div>
                          </div>
                          <div className="d-inline-flex align-items-center gap-2">
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
                              onClick={() => handleEditStory(record.id)}
                              tooltip="Edit Story"
                              disabled={isDeleting}
                            />
                            <CustomButton
                              variant="danger"
                              size="sm"
                              icon="bi-trash"
                              loading={isDeleting}
                              onClick={() => handleDeleteStory(record.id)}
                              tooltip="Delete Story"
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
                Showing {storiesData.length} of {totalItems} entries
              </span>
              <nav aria-label="Stories pagination">
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
