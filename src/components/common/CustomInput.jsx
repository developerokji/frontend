import React from "react";

const CustomInput = ({
  label,
  type = "text",
  name,
  id,
  value,
  onChange,
  register,
  required = false,
  placeholder = "",
  disabled = false,
  readOnly = false,
  error,
  helperText,
  options = [],
  rows = 3,
  icon,
  iconPosition = "left",
  className = "",
  wrapperClass = "",
  labelClass = "",
  onFocus,
  onBlur,
  ...props
}) => {

  /* ---------------- COMMON PROPS ---------------- */

  const inputClass = [
    "form-control",
    error && "is-invalid",
    readOnly && "bg-light",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const commonProps = {
    id: id || name,
    placeholder,
    disabled,
    readOnly,
    ...props,
  };

  /* ---------------- FORM BINDING ---------------- */

  const formBinding = register
    ? register(name)
    : {
        name,
        value,
        onChange,
        required,
      };

  /* ---------------- INPUT RENDER ---------------- */

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <textarea
            className={inputClass}
            rows={rows}
            {...commonProps}
            {...formBinding}
          />
        );

      case "select":
        return (
          <select
            className={inputClass}
            {...commonProps}
            {...formBinding}
            onChange={(e) => {
              if (onChange) onChange(e);
              if (formBinding.onChange) formBinding.onChange(e);
            }}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            {options.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
      case "radio":
        return (
          <div className="form-check">
            <input
              type={type}
              className="form-check-input"
              {...commonProps}
              {...formBinding}
            />
            {label && (
              <label
                className={`form-check-label ${labelClass}`}
                htmlFor={id || name}
              >
                {label}
                {required && (
                  <span className="text-danger ms-1">*</span>
                )}
              </label>
            )}
          </div>
        );

      default:
        return (
          <input
            type={type}
            className={inputClass}
            {...commonProps}
            {...formBinding}
          />
        );
    }
  };

  const inputElement = renderInput();

  /* ---------------- ICON SUPPORT ---------------- */

  const renderWithIcon = () => {
    if (!icon || type === "checkbox" || type === "radio")
      return inputElement;

    return (
      <div className="input-group">
        {iconPosition === "left" && (
          <span className="input-group-text">
            <i className={icon}></i>
          </span>
        )}

        {inputElement}

        {iconPosition === "right" && (
          <span className="input-group-text">
            <i className={icon}></i>
          </span>
        )}
      </div>
    );
  };

  /* ---------------- FINAL UI ---------------- */

  return (
    <div className={`mb-3 ${wrapperClass}`}>
      {label &&
        type !== "checkbox" &&
        type !== "radio" && (
          <label
            htmlFor={id || name}
            className={`form-label ${labelClass}`}
          >
            {label}
            {required && (
              <span className="text-danger ms-1">*</span>
            )}
          </label>
        )}

      {renderWithIcon()}

      {error && (
        <div className="invalid-feedback d-block">
          {error}
        </div>
      )}

      {helperText && (
        <div className="form-text">{helperText}</div>
      )}
    </div>
  );
};

export default CustomInput;