import React, { useState, useEffect } from 'react';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';

const BannerModal = ({ show, handleClose, handleSave, editMode = false, bannerData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Active'
  });

  // Reset form when modal opens or bannerData changes
  useEffect(() => {
    if (editMode && bannerData) {
      setFormData({
        title: bannerData.title || '',
        description: bannerData.description || '',
        status: bannerData.status || 'Active'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'Active'
      });
    }
  }, [editMode, bannerData, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave(formData);
  };

  return (
    show && (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fw-semibold">
                {editMode ? 'Edit Banner' : 'Add Banner'}
              </h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body py-4">
                <CustomInput
                  label="Title"
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter banner title..."
                  required
                  icon="bi-type"
                />

                <CustomInput
                  label="Description"
                  type="textarea"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter banner description..."
                  rows="3"
                  icon="bi-text-paragraph"
                  helperText="Provide a brief description for the banner"
                />

                <CustomInput
                  label="Status"
                  type="select"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  icon="bi-list-check"
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' }
                  ]}
                />
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary" onClick={handleClose}>
                  <i className="bi bi-x-circle me-2"></i>
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-check-circle me-2"></i>
                  {editMode ? 'Update Banner' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  );
};

export default BannerModal;
