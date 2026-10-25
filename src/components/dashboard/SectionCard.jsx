import React, { useId } from 'react';

export const SectionError = ({ error, onRetry }) => (
  <div className="alert alert-danger d-flex flex-wrap align-items-center gap-2 mb-3" role="alert">
    <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
    <span className="flex-grow-1">{error.message}</span>
    {onRetry && error.status !== 403 && (
      <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>
        <i className="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
        Retry
      </button>
    )}
  </div>
);

export const SectionSpinner = ({ label = 'Loading' }) => (
  <div className="d-flex justify-content-center align-items-center py-5" role="status">
    <div className="spinner-border text-primary" aria-hidden="true"></div>
    <span className="visually-hidden">{label}…</span>
  </div>
);

/**
 * Card wrapper that owns the loading / error / empty states for one section.
 * While refetching with data already on screen, the old content stays visible
 * (marked aria-busy) with a small spinner in the header.
 */
const SectionCard = ({
  id,
  title,
  subtitle,
  actions,
  loading,
  error,
  onRetry,
  hasData,
  isEmpty,
  emptyMessage = 'Nothing to show yet.',
  className = '',
  bodyClassName = '',
  children,
}) => {
  const headingId = useId();

  let body;
  if (!hasData && loading) {
    body = <SectionSpinner label={`Loading ${title}`} />;
  } else if (!hasData && error) {
    body = <SectionError error={error} onRetry={onRetry} />;
  } else if (isEmpty) {
    body = (
      <>
        {error && <SectionError error={error} onRetry={onRetry} />}
        <p className="text-muted text-center py-4 mb-0">{emptyMessage}</p>
      </>
    );
  } else {
    body = (
      <>
        {error && <SectionError error={error} onRetry={onRetry} />}
        {children}
      </>
    );
  }

  return (
    <section id={id} className={`card h-100 ${className}`} aria-labelledby={headingId} aria-busy={loading}>
      <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h2 id={headingId} className="h6 mb-0 d-flex align-items-center gap-2">
            {title}
            {loading && hasData && (
              <span className="spinner-border spinner-border-sm text-secondary" role="status">
                <span className="visually-hidden">Refreshing</span>
              </span>
            )}
          </h2>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        {actions}
      </div>
      <div className={`card-body ${bodyClassName}`}>{body}</div>
    </section>
  );
};

export default SectionCard;
