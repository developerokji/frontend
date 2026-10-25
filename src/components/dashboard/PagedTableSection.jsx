import React, { useState } from 'react';
import SectionCard from './SectionCard';
import { useDashboardResource } from './useDashboardResource';
import { formatNumber } from '../../utils/format';

/**
 * A dashboard card with a server-paginated table.
 *
 * fetchPage({ page, limit }, axiosConfig) must resolve to { items, meta }.
 * columns: [{ key, title, render?(row), className? }]
 * `resourceKey` should change when the query (other than page) changes.
 */
const PagedTableSection = ({
  id,
  title,
  subtitle,
  actions,
  fetchPage,
  resourceKey,
  columns,
  rowKey,
  caption,
  emptyMessage,
  limit = 5,
}) => {
  const [page, setPage] = useState(1);
  const { data, loading, error, retry } = useDashboardResource(
    (config) => fetchPage({ page, limit }, config),
    `${resourceKey}:${page}:${limit}`,
  );

  const items = data?.items || [];
  const meta = data?.meta || {};
  const totalPages = Math.max(meta.totalPages || 1, 1);
  const totalItems = meta.totalItems || 0;

  return (
    <SectionCard
      id={id}
      title={title}
      subtitle={subtitle}
      actions={actions}
      loading={loading}
      error={error}
      onRetry={retry}
      hasData={Boolean(data)}
      isEmpty={Boolean(data) && items.length === 0 && page === 1}
      emptyMessage={emptyMessage}
      bodyClassName="p-0"
    >
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <caption className="visually-hidden">{caption || title}</caption>
          <thead className="table-light">
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className={`small text-nowrap ${col.className || ''}`}>
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((col) => (
                  <td key={col.key} className={`small ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <nav
        className="d-flex flex-wrap justify-content-between align-items-center gap-2 px-3 py-2 border-top"
        aria-label={`${title} pagination`}
      >
        <span className="small text-muted" aria-live="polite">
          Page {formatNumber(page)} of {formatNumber(totalPages)} · {formatNumber(totalItems)} total
        </span>
        <div className="btn-group btn-group-sm">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1 || loading}
            aria-label={`Previous page of ${title}`}
          >
            <i className="bi bi-chevron-left" aria-hidden="true"></i> Prev
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages || loading}
            aria-label={`Next page of ${title}`}
          >
            Next <i className="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </nav>
    </SectionCard>
  );
};

export default PagedTableSection;
