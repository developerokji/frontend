import React from 'react';

const ImageModal = ({ show, handleClose, imageUrl }) => {
  if (!show) return null;

  return (
    <div 
      className="modal fade show" 
      style={{ 
        display: 'block', 
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 9999
      }} 
      tabIndex="-1"
      onClick={handleClose}
    >
      <div 
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content bg-transparent border-0">
          <div className="modal-body p-0 position-relative">
            <button 
              type="button" 
              className="btn-close position-absolute top-0 end-0 m-3 bg-white rounded-circle"
              onClick={handleClose}
              style={{ zIndex: 10000 }}
            ></button>
            <img
              src={imageUrl}
              alt="Full size image"
              className="img-fluid rounded"
              style={{ 
                maxHeight: '80vh',
                maxWidth: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
