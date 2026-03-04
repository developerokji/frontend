import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showingFrom, 
  showingTo, 
  totalItems,
  className = '',
  ...props 
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-3 ${className}`}>
      <span className="text-muted small">
        Showing {showingFrom} to {showingTo} of {totalItems} entries
      </span>
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <a 
              className="page-link" 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handlePrevious();
              }}
              tabIndex={currentPage === 1 ? '-1' : '0'}
            >
              <span aria-hidden="true">&laquo;</span> Previous
            </a>
          </li>
          
          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
              <a 
                className="page-link" 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
              >
                {page}
              </a>
            </li>
          ))}
          
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <a 
              className="page-link" 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleNext();
              }}
              tabIndex={currentPage === totalPages ? '-1' : '0'}
            >
              Next <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
