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
  style,
  ...props
}) => {
  const baseClass = 'btn';

  const variantClass = outline ? `btn-outline-${variant}` : `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const roundedClass = rounded ? 'rounded-pill' : '';
  const squaredClass = squared ? 'rounded-0' : '';
  const fullWidthClass = fullWidth ? 'w-100' : '';
  const shadowClass = shadow ? 'shadow' : '';
  const disabledClass = disabled ? 'disabled' : '';

  // Ignore whitespace-only children so icon-only buttons stay centered
  const hasVisibleChildren = React.Children.toArray(children).some((child) => {
    if (typeof child === 'string') return child.trim().length > 0;
    return Boolean(child);
  });

  const isIconOnly = Boolean(icon && !hasVisibleChildren && !loading);

  const buttonClass = [
    baseClass,
    variantClass,
    sizeClass,
    roundedClass,
    squaredClass,
    fullWidthClass,
    shadowClass,
    disabledClass,
    'd-inline-flex align-items-center justify-content-center',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderIcon = () => {
    if (!icon || loading) return null;

    const marginClass = hasVisibleChildren
      ? iconPosition === 'right'
        ? 'ms-2'
        : 'me-2'
      : '';
    const normalizedIcon = icon.startsWith('bi-') ? `bi ${icon}` : icon;
    const iconElement = (
      <i className={`${normalizedIcon} ${marginClass}`.trim()} aria-hidden="true"></i>
    );

    if (!hasVisibleChildren) {
      return iconElement;
    }

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
          <span
            className={`spinner-border spinner-border-sm ${hasVisibleChildren ? 'me-2' : ''}`.trim()}
            role="status"
            aria-hidden="true"
          ></span>
          {hasVisibleChildren ? children : null}
        </>
      );
    }

    if (badge) {
      return (
        <>
          {renderIcon()}
          <span className="position-relative">
            {hasVisibleChildren ? children : null}
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {badge}
            </span>
          </span>
        </>
      );
    }

    if (icon) {
      return renderIcon();
    }

    return children;
  };

  const iconOnlyStyle = isIconOnly
    ? {
        width: size === 'sm' ? '32px' : size === 'lg' ? '42px' : '36px',
        height: size === 'sm' ? '32px' : size === 'lg' ? '42px' : '36px',
        padding: 0,
        flexShrink: 0,
        ...style,
      }
    : style;

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
      title={tooltip || undefined}
      aria-label={tooltip || undefined}
      style={iconOnlyStyle}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export { CustomButton };
