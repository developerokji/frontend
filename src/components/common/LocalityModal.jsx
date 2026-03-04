import React from 'react';

const LocalityModal = ({ show, handleClose, handleSave }) => {
  return (
    show && (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fw-semibold">Add Locality</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body py-4">
              <div className="mb-3">
                <label htmlFor="localityName" className="form-label fw-medium">
                  <i className="bi bi-geo-alt me-2"></i>
                  Locality
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="localityName" 
                  placeholder="Enter locality..." 
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="localityState" className="form-label fw-medium">
                    <i className="bi bi-map me-2"></i>
                    State
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="localityState" 
                    placeholder="Enter state..." 
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="localityCity" className="form-label fw-medium">
                    <i className="bi bi-building me-2"></i>
                    City
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="localityCity" 
                    placeholder="Enter city..." 
                  />
                </div>
              </div>
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

export default LocalityModal;
