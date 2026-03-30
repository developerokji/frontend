import React, { useState, useEffect } from 'react';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';

const LocalityModal = ({ show, handleClose, handleSave, editMode = false, localityData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    city: ''
  });

  // Reset form when modal opens or localityData changes
  useEffect(() => {
    if (editMode && localityData) {
      setFormData({
        name: localityData.name || '',
        state: localityData.state || '',
        city: localityData.city || ''
      });
    } else {
      setFormData({
        name: '',
        state: '',
        city: ''
      });
    }
  }, [editMode, localityData, show]);

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
                {editMode ? 'Edit Locality' : 'Add Locality'}
              </h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body py-4">
                <CustomInput
                  label="Locality"
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter locality..."
                  required
                  icon="bi-geo-alt"
                />

                <div className="row">
                  <div className="col-md-6">
                    <CustomInput
                      label="State"
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Enter state..."
                      required
                      icon="bi-map"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <CustomInput
                      label="City"
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city..."
                      required
                      icon="bi-building"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary" onClick={handleClose}>
                  <i className="bi bi-x-circle me-2"></i>
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-check-circle me-2"></i>
                  {editMode ? 'Update Locality' : 'Save Locality'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  );
};

export default LocalityModal;
