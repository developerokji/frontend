import React from 'react';
import { Link } from 'react-router-dom';

/**
 * One headline number. When `to` is set the whole card is clickable via
 * Bootstrap's stretched-link on the title, so there is a single, well-named
 * link per card for keyboard and screen-reader users.
 */
const KpiCard = ({ title, value, icon, color = 'primary', details = [], to, loading }) => (
  <div className="card h-100 position-relative kpi-card">
    <div className="card-body d-flex gap-3 align-items-start">
      <span
        className={`d-inline-flex align-items-center justify-content-center rounded-3 bg-${color}-subtle text-${color}-emphasis flex-shrink-0`}
        style={{ width: 44, height: 44 }}
        aria-hidden="true"
      >
        <i className={`bi ${icon} fs-5`}></i>
      </span>
      <div className="min-w-0">
        <h3 className="h6 text-muted fw-normal mb-1">
          {to ? (
            <Link to={to} className="stretched-link text-reset text-decoration-none">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        {loading ? (
          <div className="placeholder-glow" aria-hidden="true">
            <span className="placeholder col-8 fs-3"></span>
          </div>
        ) : (
          <p className="fs-3 fw-semibold mb-1 lh-sm">{value}</p>
        )}
        {!loading &&
          details.map((line) => (
            <small key={line} className="d-block text-muted">
              {line}
            </small>
          ))}
      </div>
    </div>
  </div>
);

export default KpiCard;
