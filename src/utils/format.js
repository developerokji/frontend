// Display formatting helpers (Indian locale).

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrCompactFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat('en-IN');

const toNumber = (value) => Number(value) || 0;

/** ₹12,34,567 */
export const formatINR = (value) => inrFormatter.format(toNumber(value));

/** ₹12.3L, used where space is tight (chart axes). */
export const formatINRCompact = (value) => inrCompactFormatter.format(toNumber(value));

/** 12,34,567 */
export const formatNumber = (value) => numberFormatter.format(toNumber(value));

/** 'DD-MM-YYYY' -> Date (local), or null. */
export const parseDMY = (value) => {
  if (!value || typeof value !== 'string') return null;
  const [d, m, y] = value.split('-').map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
};

/** 'DD-MM-YYYY' -> '25 Oct' */
export const formatDMYShort = (value) => {
  const date = parseDMY(value);
  return date
    ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : value || '—';
};

/** 'DD-MM-YYYY' -> '25 Oct 2026' */
export const formatDMYLong = (value) => {
  const date = parseDMY(value);
  return date
    ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : value || '—';
};

/** ISO datetime -> '25 Oct 2026' */
export const formatISODate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
