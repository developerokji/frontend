import React from 'react';

const StoryModal = ({ show, handleClose, handleSave }) => {
  return (
    show && (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fw-semibold">Add Story</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body py-4">
              <div className="mb-4">
                <label htmlFor="storyImage" className="form-label fw-medium">
                  <i className="bi bi-image me-2"></i>
                  Upload Story
                </label>
                <input type="file" className="form-control" id="storyImage" accept="image/*" />
                <small className="text-muted d-block mt-2">
                  Supported formats: JPG, PNG, GIF (Max size: 5MB)
                </small>
              </div>
              
              {/* <div className="mb-3">
                <label htmlFor="storyTitle" className="form-label fw-medium">
                  <i className="bi bi-type me-2"></i>
                  Story Title
                </label>
                <input type="text" className="form-control" id="storyTitle" placeholder="Enter story title..." />
              </div>
              
              <div className="mb-3">
                <label htmlFor="storyDescription" className="form-label fw-medium">
                  <i className="bi bi-text-paragraph me-2"></i>
                  Description
                </label>
                <textarea className="form-control" id="storyDescription" rows="3" placeholder="Enter story description..."></textarea>
              </div> */}
            </div>
            <div className="modal-footer border-top">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                <i className="bi bi-x-circle me-2"></i>
                Close
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSave}>
                <i className="bi bi-check-circle me-2"></i>
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default StoryModal;
