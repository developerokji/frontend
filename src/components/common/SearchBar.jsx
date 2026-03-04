import React from 'react';

const SearchBar = ({ 
  placeholder = 'Search...', 
  value, 
  onChange, 
  className = '',
  ...props 
}) => {
  return (
    <div className={`col-12 col-md-6 col-lg-4 ${className}`}>
      <div className="input-group">
        <span className="input-group-text">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
      </div>
    </div>
  );
};

export default SearchBar;
