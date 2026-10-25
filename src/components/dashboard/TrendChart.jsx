import React, { useId } from 'react';
import { formatDMYLong, formatDMYShort, formatNumber } from '../../utils/format';

const WIDTH = 600;
const HEIGHT = 200;
const PAD = { top: 10, right: 8, bottom: 26, left: 52 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

// Round the axis max up to 1, 2 or 5 × 10^n so gridline labels are readable.
const niceMax = (value) => {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((s) => s * magnitude >= value);
  return step * magnitude;
};

/**
 * Accessible SVG bar chart for one daily series.
 *
 * - The SVG has role="img" and a text summary (total, peak day).
 * - Every bar has a <title> tooltip.
 * - A "View data" disclosure renders the same numbers as a real table.
 *
 * `columns` describe the table (and tooltip) values: [{ key, label, format }].
 * The first column is the charted series.
 */
const TrendChart = ({ items = [], columns, color = 'var(--bs-primary)', formatAxis = formatNumber }) => {
  const titleId = useId();
  const [series] = columns;
  const format = series.format || formatNumber;

  const values = items.map((item) => Number(item[series.key]) || 0);
  const total = values.reduce((sum, v) => sum + v, 0);
  const peak = Math.max(0, ...values);
  const peakItem = items[values.indexOf(peak)];
  const yMax = niceMax(peak);

  const slot = items.length ? PLOT_W / items.length : PLOT_W;
  const barW = Math.max(slot * 0.7, 1);
  const y = (v) => PAD.top + PLOT_H - (v / yMax) * PLOT_H;

  const labelIdx = items.length > 1 ? [0, Math.floor((items.length - 1) / 2), items.length - 1] : [0];

  const summary = items.length
    ? `${series.label}: ${format(total)} in total over ${items.length} days` +
      (peak > 0 ? `, peaking at ${format(peak)} on ${formatDMYLong(peakItem.date)}.` : '.')
    : `${series.label}: no data.`;

  const tooltip = (item) =>
    `${formatDMYLong(item.date)}: ` +
    columns.map((c) => `${(c.format || formatNumber)(item[c.key])} ${c.label.toLowerCase()}`).join(', ');

  return (
    <figure className="mb-0">
      <p className="small text-muted mb-2">
        Total <span className="fw-semibold text-body">{format(total)}</span>
      </p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        role="img"
        aria-labelledby={titleId}
        style={{ display: 'block', maxHeight: 240 }}
      >
        <title id={titleId}>{summary}</title>

        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(yMax * f)}
              y2={y(yMax * f)}
              stroke="var(--bs-border-color)"
              strokeDasharray={f === 0 ? undefined : '3 3'}
            />
            <text
              x={PAD.left - 6}
              y={y(yMax * f)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="11"
              fill="var(--bs-secondary-color)"
            >
              {formatAxis(yMax * f)}
            </text>
          </g>
        ))}

        {items.map((item, i) => {
          const v = values[i];
          const top = y(v);
          return (
            <rect
              key={item.date}
              x={PAD.left + i * slot + (slot - barW) / 2}
              y={top}
              width={barW}
              height={Math.max(PAD.top + PLOT_H - top, v > 0 ? 1 : 0)}
              rx={barW > 6 ? 2 : 0}
              fill={color}
            >
              <title>{tooltip(item)}</title>
            </rect>
          );
        })}

        {items.length > 0 &&
          labelIdx.map((i, n) => (
            <text
              key={i}
              x={PAD.left + i * slot + slot / 2}
              y={HEIGHT - 8}
              textAnchor={n === 0 ? 'start' : n === labelIdx.length - 1 ? 'end' : 'middle'}
              fontSize="11"
              fill="var(--bs-secondary-color)"
            >
              {formatDMYShort(items[i].date)}
            </text>
          ))}
      </svg>

      <details className="mt-2 small">
        <summary className="text-primary">View data as table</summary>
        <div className="table-responsive mt-2" style={{ maxHeight: 240 }}>
          <table className="table table-sm table-striped mb-0">
            <caption className="visually-hidden">{series.label} by day</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                {columns.map((c) => (
                  <th key={c.key} scope="col" className="text-end">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.date}>
                  <th scope="row" className="fw-normal">
                    {formatDMYLong(item.date)}
                  </th>
                  {columns.map((c) => (
                    <td key={c.key} className="text-end">
                      {(c.format || formatNumber)(item[c.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
};

export default TrendChart;
