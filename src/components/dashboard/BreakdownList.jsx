import React from 'react';
import { formatNumber } from '../../utils/format';

/**
 * Horizontal bar breakdown rendered as a plain list, so the label and value
 * are real text (readable by screen readers, zoomable, copyable). Bars are
 * decorative and sized relative to the largest row.
 *
 * rows: [{ label, value, color? }]
 */
const BreakdownList = ({ rows, format = formatNumber, showShare = false }) => {
  const max = Math.max(0, ...rows.map((r) => r.value));
  const total = rows.reduce((sum, r) => sum + r.value, 0);

  return (
    <ul className="list-unstyled mb-0">
      {rows.map((row) => {
        const width = max > 0 ? (row.value / max) * 100 : 0;
        const share = total > 0 ? Math.round((row.value / total) * 100) : 0;
        return (
          <li key={row.label} className="mb-3">
            <div className="d-flex justify-content-between small mb-1 gap-2">
              <span className="text-truncate">{row.label}</span>
              <span className="fw-semibold text-nowrap">
                {format(row.value)}
                {showShare && <span className="text-muted fw-normal"> ({share}%)</span>}
              </span>
            </div>
            <div className="progress" style={{ height: 8 }} aria-hidden="true">
              <div
                className={`progress-bar bg-${row.color || 'primary'}`}
                style={{ width: `${width}%` }}
              ></div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default BreakdownList;
