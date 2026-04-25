import React from 'react';

const PaginationDropdown = ({ limit, onLimitChange, disabled = false }) => {
  const limits = [10, 25, 50, 100, 150];

  return (
    <select 
      className="form-select" 
      value={limit}
      onChange={(e) => onLimitChange(Number(e.target.value))}
      disabled={disabled}
      style={{ maxWidth: '200px' }}
    >
      {limits.map(limitOption => (
        <option key={limitOption} value={limitOption}>
          {limitOption} entries per page
        </option>
      ))}
    </select>
  );
};

export default PaginationDropdown;
