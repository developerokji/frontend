import React from 'react';

const CustomInput = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  icon, 
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={props.id || label} className="form-label">
          {icon && <i className={`${icon} me-2`}></i>}
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="input-group">
        {icon && !label && (
          <span className="input-group-text">
            <i className={icon}></i>
          </span>
        )}
        <input
          type={type}
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
      </div>
    </div>
  );
};

export default CustomInput;
