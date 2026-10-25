import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import KpiCard from '../components/dashboard/KpiCard';
import SectionCard, { SectionError } from '../components/dashboard/SectionCard';
import TrendChart from '../components/dashboard/TrendChart';
import BreakdownList from '../components/dashboard/BreakdownList';
import PagedTableSection from '../components/dashboard/PagedTableSection';
import { useDashboardResource } from '../components/dashboard/useDashboardResource';
import BookingModal from '../components/common/BookingModal';
import {
  formatDMYLong,
  formatINR,
  formatINRCompact,
  formatISODate,
  formatNumber,
} from '../utils/format';

// Window used for "expiring soon" everywhere on the page (banner, KPI, table).
const EXPIRING_DAYS = 7;
const TREND_RANGES = [7, 30, 90];
const TABLE_PAGE_SIZE = 5;

const LEAD_STATUS = {
  review: { label: 'Review', color: 'warning' },
  pending: { label: 'Pending', color: 'secondary' },
  active: { label: 'Active', color: 'primary' },
  on_going: { label: 'On going', color: 'info' },
  payment_pending: { label: 'Payment pending', color: 'warning' },
  close: { label: 'Completed', color: 'success' },
  cancel: { label: 'Cancelled', color: 'danger' },
};

const StatusBadge = ({ status }) => {
  const info = LEAD_STATUS[status] || { label: status || 'Unknown', color: 'secondary' };
  return <span className={`badge text-bg-${info.color}`}>{info.label}</span>;
};

const PartnerCell = ({ row }) => (
  <>
    <div className="fw-semibold">{row.partnerName || '—'}</div>
    {row.partnerPhone && <div className="text-muted">{row.partnerPhone}</div>}
  </>
);

const plural = (n, one, many = `${one}s`) => `${formatNumber(n)} ${n === 1 ? one : many}`;

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.focus({ preventScroll: true });
};

const DashboardPage = () => {
  const [trendDays, setTrendDays] = useState(30);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const summary = useDashboardResource(
    (config) => dashboardAPI.getSummary(EXPIRING_DAYS, config),
    `summary:${EXPIRING_DAYS}`,
  );
  const trends = useDashboardResource(
    (config) => dashboardAPI.getTrends(trendDays, config),
    `trends:${trendDays}`,
  );

  const s = summary.data;
  const trendItems = trends.data?.items || [];

  // Without admin rights nothing on this page will load; say so once.
  if (summary.error?.status === 403) {
    return (
      <div className="container-fluid p-3 p-lg-4">
        <h1 className="h4 mb-4">Dashboard</h1>
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-shield-lock me-2" aria-hidden="true"></i>
          The dashboard is only available to admin accounts. Sign in with an admin account to view it.
        </div>
      </div>
    );
  }

  const refreshAll = () => {
    summary.retry();
    trends.retry();
  };

  const kpis = [
    {
      title: 'Customers',
      icon: 'bi-person-badge',
      color: 'primary',
      to: '/client',
      value: formatNumber(s?.customers.total),
      details: s && [
        `${formatNumber(s.customers.active)} active`,
        `+${formatNumber(s.customers.newThisMonth)} this month · +${formatNumber(s.customers.newToday)} today`,
      ],
    },
    {
      title: 'Partners',
      icon: 'bi-people',
      color: 'info',
      to: '/partner/list',
      value: formatNumber(s?.partners.total),
      details: s && [
        `${formatNumber(s.partners.active)} active · ${formatNumber(s.partners.suspended)} suspended`,
        `${formatNumber(s.partners.online)} online now`,
      ],
    },
    {
      title: 'Partners with active plan',
      icon: 'bi-patch-check',
      color: 'success',
      to: '/partner/subscription',
      value: formatNumber(s?.partners.withActivePlan),
      details: s && [
        `${formatNumber(s.partners.expiringSoon)} expiring in ${EXPIRING_DAYS} days`,
        `${formatNumber(s.partners.neverSubscribed)} never subscribed`,
      ],
    },
    {
      title: 'Partners with expired plan',
      icon: 'bi-clock-history',
      color: 'danger',
      to: '/partner/expire',
      value: formatNumber(s?.partners.expired),
      details: s && ['No current or upcoming plan'],
    },
    {
      title: 'Leads',
      icon: 'bi-telephone',
      color: 'primary',
      to: '/lead',
      value: formatNumber(s?.leads.total),
      details: s && [
        `${formatNumber(s.leads.today)} today · ${formatNumber(s.leads.thisMonth)} this month`,
        `${formatNumber(s.leads.completed)} completed · ${formatNumber(s.leads.cancelled)} cancelled`,
      ],
    },
    {
      title: 'Unassigned open leads',
      icon: 'bi-person-exclamation',
      color: 'warning',
      to: '/lead',
      value: formatNumber(s?.leads.unassigned),
      details: s && [
        `${formatNumber(s.leads.review)} in review · ${formatNumber(s.leads.pending)} pending`,
      ],
    },
    {
      title: 'Subscription revenue',
      icon: 'bi-currency-rupee',
      color: 'success',
      value: formatINR(s?.revenue.subscription.total),
      details: s && [`${formatINR(s.revenue.subscription.thisMonth)} this month`],
    },
    {
      title: 'Booking revenue',
      icon: 'bi-wallet2',
      color: 'secondary',
      value: formatINR(s?.revenue.booking.total),
      details: s && [
        `${formatINR(s.revenue.booking.thisMonth)} this month`,
        `${formatINR(s.revenue.booking.platformFee)} platform fees`,
      ],
    },
  ];

  const expiringCount = s?.partners.expiringSoon || 0;

  return (
    <div className="container-fluid p-3 p-lg-4 w-100">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="h4 mb-0">Dashboard</h1>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={refreshAll}
          disabled={summary.loading || trends.loading}
        >
          <i className="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
          Refresh
        </button>
      </div>

      {/* Expiry alert */}
      {expiringCount > 0 && !bannerDismissed && (
        <div
          className="alert alert-warning d-flex flex-wrap align-items-center gap-2 mb-4"
          role="status"
        >
          <i className="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span className="flex-grow-1">
            <strong>{plural(expiringCount, 'partner plan')}</strong>{' '}
            {expiringCount === 1 ? 'expires' : 'expire'} in the next {EXPIRING_DAYS} days.
          </span>
          <button
            type="button"
            className="btn btn-sm btn-warning"
            onClick={() => scrollToSection('expiring-plans')}
          >
            Review plans
          </button>
          <button
            type="button"
            className="btn-close"
            aria-label="Dismiss expiring plans alert"
            onClick={() => setBannerDismissed(true)}
          ></button>
        </div>
      )}

      {/* KPI cards */}
      <section aria-label="Key figures" className="mb-4" aria-busy={summary.loading}>
        {summary.error && <SectionError error={summary.error} onRetry={summary.retry} />}
        <div className="row g-3">
          {kpis.map((kpi) => (
            <div key={kpi.title} className="col-12 col-sm-6 col-xl-3">
              <KpiCard
                {...kpi}
                value={s ? kpi.value : '—'}
                details={kpi.details || []}
                loading={!s && summary.loading}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Trends */}
      <div className="mb-4">
        <SectionCard
          title="Trends"
          subtitle={`Daily figures for the last ${trendDays} days`}
          loading={trends.loading}
          error={trends.error}
          onRetry={trends.retry}
          hasData={Boolean(trends.data)}
          isEmpty={Boolean(trends.data) && trendItems.length === 0}
          emptyMessage="No activity in this period."
          actions={
            <div className="btn-group btn-group-sm" role="group" aria-label="Trend period">
              {TREND_RANGES.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`btn ${trendDays === d ? 'btn-primary' : 'btn-outline-primary'}`}
                  aria-pressed={trendDays === d}
                  onClick={() => setTrendDays(d)}
                >
                  {d} days
                </button>
              ))}
            </div>
          }
        >
          <div className="row g-4">
            <div className="col-12 col-xl-4">
              <h3 className="h6">Bookings</h3>
              <TrendChart
                items={trendItems}
                color="var(--bs-primary)"
                columns={[
                  { key: 'bookings', label: 'Bookings' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </div>
            <div className="col-12 col-xl-4">
              <h3 className="h6">Subscription revenue</h3>
              <TrendChart
                items={trendItems}
                color="var(--bs-success)"
                formatAxis={formatINRCompact}
                columns={[{ key: 'subscriptionRevenue', label: 'Revenue', format: formatINR }]}
              />
            </div>
            <div className="col-12 col-xl-4">
              <h3 className="h6">New customers</h3>
              <TrendChart
                items={trendItems}
                color="var(--bs-info)"
                columns={[{ key: 'newCustomers', label: 'New customers' }]}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Breakdowns (all from the summary call) */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6 col-xxl-4">
          <SectionCard
            title="Leads by status"
            loading={summary.loading}
            error={summary.error}
            onRetry={summary.retry}
            hasData={Boolean(s)}
            isEmpty={Boolean(s) && s.leads.total === 0}
            emptyMessage="No leads yet."
          >
            {s && (
              <BreakdownList
                showShare
                rows={[
                  { label: 'Review', value: s.leads.review, color: 'warning' },
                  { label: 'Pending', value: s.leads.pending, color: 'secondary' },
                  { label: 'Active', value: s.leads.active, color: 'primary' },
                  { label: 'On going', value: s.leads.onGoing, color: 'info' },
                  { label: 'Payment pending', value: s.leads.paymentPending, color: 'warning' },
                  { label: 'Completed', value: s.leads.completed, color: 'success' },
                  { label: 'Cancelled', value: s.leads.cancelled, color: 'danger' },
                ]}
              />
            )}
          </SectionCard>
        </div>

        <div className="col-12 col-lg-6 col-xxl-4">
          <SectionCard
            title="Partner plan status"
            loading={summary.loading}
            error={summary.error}
            onRetry={summary.retry}
            hasData={Boolean(s)}
            isEmpty={Boolean(s) && s.partners.total === 0}
            emptyMessage="No partners yet."
          >
            {s && (
              <BreakdownList
                rows={[
                  { label: 'Active plan', value: s.partners.withActivePlan, color: 'success' },
                  {
                    label: `Expiring in ${EXPIRING_DAYS} days`,
                    value: s.partners.expiringSoon,
                    color: 'warning',
                  },
                  { label: 'Expired', value: s.partners.expired, color: 'danger' },
                  { label: 'Never subscribed', value: s.partners.neverSubscribed, color: 'secondary' },
                ]}
              />
            )}
          </SectionCard>
        </div>

        <div className="col-12 col-lg-6 col-xxl-4">
          <SectionCard
            title="Coverage & catalogue"
            loading={summary.loading}
            error={summary.error}
            onRetry={summary.retry}
            hasData={Boolean(s)}
          >
            {s && (
              <dl className="row mb-0 small">
                {[
                  ['Serviceable pincodes', s.locations.localities],
                  ['Pincodes covered by partners', s.locations.partnerCoveredPincodes],
                  ['Cities', s.locations.cities],
                  ['States', s.locations.states],
                  ['Active categories', s.catalogue.categories],
                  ['Active sub-categories', s.catalogue.subCategories],
                  ['Live services', s.catalogue.services],
                  ['Live packages', s.catalogue.packages],
                ].map(([label, value]) => (
                  <React.Fragment key={label}>
                    <dt className="col-8 fw-normal text-muted mb-2">{label}</dt>
                    <dd className="col-4 text-end fw-semibold mb-2">{formatNumber(value)}</dd>
                  </React.Fragment>
                ))}
              </dl>
            )}
          </SectionCard>
        </div>

        <div className="col-12 col-lg-6">
          <SectionCard
            title="Top categories"
            subtitle="By bookings handled"
            loading={summary.loading}
            error={summary.error}
            onRetry={summary.retry}
            hasData={Boolean(s)}
            isEmpty={Boolean(s) && s.topCategories.length === 0}
            emptyMessage="No assigned bookings yet."
          >
            {s && (
              <BreakdownList
                rows={s.topCategories.map((c) => ({
                  label: c.categoryName,
                  value: c.bookings,
                  color: 'primary',
                }))}
              />
            )}
          </SectionCard>
        </div>

        <div className="col-12 col-lg-6">
          <SectionCard
            title="Top pincodes"
            subtitle="By bookings"
            loading={summary.loading}
            error={summary.error}
            onRetry={summary.retry}
            hasData={Boolean(s)}
            isEmpty={Boolean(s) && s.topPincodes.length === 0}
            emptyMessage="No bookings with an address yet."
          >
            {s && (
              <BreakdownList
                rows={s.topPincodes.map((p) => ({
                  label: p.city ? `${p.pincode} · ${p.city}` : p.pincode,
                  value: p.bookings,
                  color: 'info',
                }))}
              />
            )}
          </SectionCard>
        </div>
      </div>

      {/* Tables */}
      <div className="row g-3">
        <div className="col-12" id="expiring-plans" tabIndex={-1} style={{ outline: 'none' }}>
          <PagedTableSection
            title="Plans expiring soon"
            subtitle={`Partners whose plan ends in the next ${EXPIRING_DAYS} days and have not renewed`}
            actions={
              <Link to="/partner/subscription" className="btn btn-sm btn-outline-primary">
                All subscriptions
              </Link>
            }
            resourceKey={`expiring:${EXPIRING_DAYS}`}
            fetchPage={(params, config) =>
              dashboardAPI.getExpiringPartners({ ...params, days: EXPIRING_DAYS }, config)
            }
            limit={TABLE_PAGE_SIZE}
            rowKey={(r) => r.subscriptionId}
            emptyMessage={`No plans expire in the next ${EXPIRING_DAYS} days.`}
            columns={[
              { key: 'partner', title: 'Partner', render: (r) => <PartnerCell row={r} /> },
              { key: 'categoryName', title: 'Category' },
              { key: 'packageName', title: 'Package' },
              {
                key: 'leads',
                title: 'Leads left',
                className: 'text-end',
                render: (r) => (
                  <>
                    <span className="fw-semibold">{formatNumber(r.remainingLeads)}</span>
                    <span className="text-muted">
                      {' '}
                      of {formatNumber(r.allocatedLeads)}
                    </span>
                  </>
                ),
              },
              { key: 'planEndDate', title: 'Ends on', render: (r) => formatDMYLong(r.planEndDate) },
              {
                key: 'daysUntilExpiry',
                title: 'Expires',
                render: (r) => (
                  <span className={`badge text-bg-${r.daysUntilExpiry <= 1 ? 'danger' : 'warning'}`}>
                    {r.daysUntilExpiry === 0
                      ? 'Today'
                      : r.daysUntilExpiry === 1
                        ? 'Tomorrow'
                        : `In ${r.daysUntilExpiry} days`}
                  </span>
                ),
              },
            ]}
          />
        </div>

        <div className="col-12 col-xxl-6">
          <PagedTableSection
            title="Expired partners"
            subtitle="No current or upcoming plan"
            actions={
              <Link to="/partner/expire" className="btn btn-sm btn-outline-primary">
                View all
              </Link>
            }
            resourceKey="expired"
            fetchPage={(params, config) => dashboardAPI.getExpiredPartners(params, config)}
            limit={TABLE_PAGE_SIZE}
            rowKey={(r) => r.partnerId}
            emptyMessage="No expired partners."
            columns={[
              { key: 'partner', title: 'Partner', render: (r) => <PartnerCell row={r} /> },
              { key: 'categoryName', title: 'Category' },
              { key: 'packageName', title: 'Last package' },
              { key: 'planEndDate', title: 'Ended on', render: (r) => formatDMYLong(r.planEndDate) },
              {
                key: 'daysSinceExpiry',
                title: 'Expired',
                render: (r) =>
                  r.daysSinceExpiry === 0 ? 'Today' : `${plural(r.daysSinceExpiry, 'day')} ago`,
              },
            ]}
          />
        </div>

        <div className="col-12 col-xxl-6">
          <PagedTableSection
            title="Recent leads"
            actions={
              <Link to="/lead" className="btn btn-sm btn-outline-primary">
                View all
              </Link>
            }
            resourceKey="leads"
            fetchPage={(params, config) => dashboardAPI.getRecentLeads(params, config)}
            limit={TABLE_PAGE_SIZE}
            rowKey={(r) => r.id}
            emptyMessage="No leads yet."
            columns={[
              {
                key: 'bookingOrderId',
                title: 'Booking',
                render: (r) => (
                  <>
                    <div className="fw-semibold">{r.bookingOrderId || `#${r.id}`}</div>
                    <div className="text-muted">{formatISODate(r.createdAt)}</div>
                  </>
                ),
              },
              { key: 'serviceName', title: 'Service' },
              { key: 'clientName', title: 'Customer' },
              {
                key: 'acceptedPartnerName',
                title: 'Partner',
                render: (r) => r.acceptedPartnerName || <span className="text-muted">Unassigned</span>,
              },
              { key: 'workStatus', title: 'Status', render: (r) => <StatusBadge status={r.workStatus} /> },
              { key: 'total', title: 'Total', className: 'text-end', render: (r) => formatINR(r.total) },
              {
                key: 'view',
                title: <span className="visually-hidden">Actions</span>,
                render: (r) => (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setSelectedLead(r)}
                    aria-label={`View booking ${r.bookingOrderId || r.id}`}
                  >
                    <i className="bi bi-eye" aria-hidden="true"></i>
                  </button>
                ),
              },
            ]}
          />
        </div>
      </div>

      <BookingModal
        show={Boolean(selectedLead)}
        handleClose={() => setSelectedLead(null)}
        bookingData={selectedLead}
      />
    </div>
  );
};

export default DashboardPage;
