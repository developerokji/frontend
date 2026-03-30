import React from 'react';

const CustomInput = ({ 
  label, 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  name,
  id,
  required = false,
  disabled = false,
  readOnly = false,
  size = 'md',
  variant = 'default',
  icon,
  iconPosition = 'left',
  error,
  helperText,
  className = '',
  rows = 3,
  maxLength,
  minLength,
  pattern,
  autoComplete = 'off',
  autoFocus = false,
  options = [], // For select
  wrapperClass = '',
  labelClass = '',
  ...props 
}) => {
  const baseClass = 'form-control';
  
  // Size classes
  const sizeClass = size !== 'md' ? `form-control-${size}` : '';
  
  // Variant classes
  const variantClass = variant !== 'default' ? `form-control-${variant}` : '';
  
  // State classes
  const errorClass = error ? 'is-invalid' : '';
  const disabledClass = disabled ? 'disabled' : '';
  const readOnlyClass = readOnly ? 'bg-light' : '';
  
  // Combine all classes
  const inputClass = [
    baseClass,
    sizeClass,
    variantClass,
    errorClass,
    disabledClass,
    readOnlyClass,
    className
  ].filter(Boolean).join(' ');

  const renderIcon = () => {
    if (!icon) return null;
    
    const iconElement = <i className={`${icon} ${iconPosition === 'right' ? 'ms-2' : 'me-2'}`}></i>;
    
    if (iconPosition === 'right') {
      return (
        <>
          {inputElement}
          {iconElement}
        </>
      );
    }
    
    return (
      <>
        {iconElement}
        {inputElement}
      </>
    );
  };

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={id || name}
          name={name}
          className={inputClass}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          rows={rows}
          maxLength={maxLength}
          minLength={minLength}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          {...props}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          id={id || name}
          name={name}
          className={inputClass}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          {...props}
        >
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'checkbox' || type === 'radio') {
      return (
        <input
          type={type}
          id={id || name}
          name={name}
          className="form-check-input"
          checked={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          {...props}
        />
      );
    }

    return (
      <input
        type={type}
        id={id || name}
        name={name}
        className={inputClass}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        {...props}
      />
    );
  };

  const inputElement = renderInput();

  // For checkbox/radio, return directly (no wrapper needed)
  if (type === 'checkbox' || type === 'radio') {
    return (
      <div className={`form-check mb-3 ${wrapperClass}`}>
        <inputElement />
        <label className={`form-check-label ${labelClass}`} htmlFor={id || name}>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
        {error && (
          <div className="invalid-feedback">
            {error}
          </div>
        )}
        {helperText && (
          <div className="form-text text-muted">
            {helperText}
          </div>
        )}
      </div>
    );
  }

  // For other inputs, wrap with label and helper text
  const renderWithWrapper = () => {
    if (icon) {
      return (
        <div className="input-group">
          {renderIcon()}
        </div>
      );
    }
    
    return inputElement;
  };

  return (
    <div className={`mb-3 ${wrapperClass}`}>
      {label && type !== 'checkbox' && type !== 'radio' && (
        <label htmlFor={id || name} className={`form-label ${labelClass}`}>
          {icon && iconPosition === 'left' && <i className={`${icon} me-2`}></i>}
          {label}
          {required && <span className="text-danger ms-1">*</span>}
          {icon && iconPosition === 'right' && <i className={`${icon} ms-2`}></i>}
        </label>
      )}
      
      {renderWithWrapper()}
      
      {error && (
        <div className="invalid-feedback">
          {error}
        </div>
      )}
      
      {helperText && (
        <div className="form-text text-muted">
          {helperText}
        </div>
      )}
    </div>
  );
};

export default CustomInput;
