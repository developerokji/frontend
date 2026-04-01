import React from 'react';

const ReactPaginate = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showingFrom, 
  showingTo, 
  totalItems,
  className = '',
  ...props 
}) => {
  const handlePageChange = (page) => {
    onPageChange(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
      endPage = totalPages;
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className={`d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-3 ${className}`}>
      <span className="text-muted small">
        Showing {showingFrom} to {showingTo} of {totalItems} items
      </span>
      
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <span aria-hidden="true">&laquo;</span> Previous
            </button>
          </li>
          
          {renderPageNumbers().map((page) => (
            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            </li>
          ))}
          
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ReactPaginate;
