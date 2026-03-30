import React from 'react';

const CustomButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  fullWidth = false,
  outline = false,
  rounded = false,
  squared = false,
  shadow = false,
  tooltip = '',
  badge = '',
  ...props 
}) => {
  const baseClass = 'btn';
  
  // Variant classes
  let variantClass = outline ? `btn-outline-${variant}` : `btn-${variant}`;
  
  // Size classes
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  
  // Shape classes
  const roundedClass = rounded ? 'rounded-pill' : '';
  const squaredClass = squared ? 'rounded-0' : '';
  
  // Width class
  const fullWidthClass = fullWidth ? 'w-100' : '';
  
  // Shadow class
  const shadowClass = shadow ? 'shadow' : '';
  
  // Disabled class
  const disabledClass = disabled ? 'disabled' : '';
  
  // Combine all classes
  const buttonClass = [
    baseClass,
    variantClass,
    sizeClass,
    roundedClass,
    squaredClass,
    fullWidthClass,
    shadowClass,
    disabledClass,
    className
  ].filter(Boolean).join(' ');

  const renderIcon = () => {
    if (!icon || loading) return null;
    
    const iconElement = <i className={`${icon} ${iconPosition === 'right' ? 'ms-2' : 'me-2'}`}></i>;
    
    if (iconPosition === 'right') {
      return (
        <>
          {children}
          {iconElement}
        </>
      );
    }
    
    return (
      <>
        {iconElement}
        {children}
      </>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {children}
        </>
      );
    }
    
    if (badge) {
      return (
        <>
          {renderIcon()}
          <span className="position-relative">
            {children}
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {badge}
            </span>
          </span>
        </>
      );
    }
    
    return renderIcon();
  };

  const buttonElement = (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );

  // Add tooltip if provided
  if (tooltip) {
    return (
      <div className="d-inline-block" title={tooltip}>
        {buttonElement}
      </div>
    );
  }

  return buttonElement;
};

export default CustomButton;
