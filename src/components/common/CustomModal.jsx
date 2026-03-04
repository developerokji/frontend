import React from 'react';

const CustomModal = ({ 
  show, 
  handleClose, 
  handleSave, 
  title, 
  children, 
  size = 'md',
  saveText = 'Save changes',
  closeText = 'Close',
  showFooter = true,
  ...props 
}) => {
  if (!show) return null;

  return (
    <div 
      className="modal fade show" 
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      tabIndex="-1"
      {...props}
    >
      <div className={`modal-dialog modal-dialog-centered modal-${size}`}>
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-semibold">{title}</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body py-4">
            {children}
          </div>
          {showFooter && (
            <div className="modal-footer border-top">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleClose}
              >
                <i className="bi bi-x-circle me-2"></i>
                {closeText}
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSave}
              >
                <i className="bi bi-check-circle me-2"></i>
                {saveText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
