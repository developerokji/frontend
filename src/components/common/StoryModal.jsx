import React from 'react';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';

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
              
              <CustomInput
                label="Story Title"
                type="text"
                id="storyTitle"
                name="storyTitle"
                placeholder="Enter story title..."
                icon="bi-type"
                helperText="Give your story a catchy title"
              />
              
              <CustomInput
                label="Description"
                type="textarea"
                id="storyDescription"
                name="storyDescription"
                placeholder="Enter story description..."
                rows="3"
                icon="bi-text-paragraph"
                helperText="Describe your story in a few sentences"
              />
            </div>
            <div className="modal-footer border-top">
              <CustomButton variant="secondary" onClick={handleClose}>
                <i className="bi bi-x-circle me-2"></i>
                Close
              </CustomButton>
              <CustomButton variant="primary" onClick={handleSave}>
                <i className="bi bi-check-circle me-2"></i>
                Save changes
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default StoryModal;
