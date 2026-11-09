import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsAPI } from '../services/api';
import { isAdminUser } from '../utils/auth';

const DEFAULT_ENUMS = {
  server: ['dev', 'pro'],
  SERVER_TYPE: ['development', 'production'],
  OTP_PROVIDER: ['MSG91', 'MOCK'],
  MAINTENANCE_TYPE: ['false', 'true'],
};

const ENUM_OPTION_LABELS = {
  server: {
    dev: 'dev (UAT / Sandbox)',
    pro: 'pro (Production / Live)',
  },
  SERVER_TYPE: {
    development: 'development (Static OTP 1234)',
    production: 'production (Live Random OTP)',
  },
  OTP_PROVIDER: {
    MSG91: 'MSG91 (Live SMS)',
    MOCK: 'MOCK (Console OTP)',
  },
  MAINTENANCE_TYPE: {
    false: 'false (Maintenance Off)',
    true: 'true (Maintenance On)',
  },
};

const TABS = [
  {
    id: 'cashfree',
    label: 'Payment Gateway (Cashfree)',
    icon: 'bi-credit-card-2-front',
    categories: ['cashfree'],
  },
  {
    id: 'fees',
    label: 'Platform & Visiting Fees',
    icon: 'bi-currency-rupee',
    categories: ['fees'],
  },
  {
    id: 'server_otp',
    label: 'Server & MSG91 OTP',
    icon: 'bi-hdd-network',
    categories: ['server', 'msg91'],
  },
  {
    id: 'integrations',
    label: 'Firebase & Google Maps',
    icon: 'bi-cloud-check',
    categories: ['firebase', 'google'],
  },
  {
    id: 'contacts',
    label: 'Support Contacts',
    icon: 'bi-headset',
    categories: ['contacts'],
  },
  {
    id: 'versions',
    label: 'Maintenance & App Versions',
    icon: 'bi-phone',
    categories: ['maintenance', 'versions'],
  },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const isAdmin = isAdminUser();
  const [activeTab, setActiveTab] = useState('cashfree');
  const [formData, setFormData] = useState({});
  const [dbEnums, setDbEnums] = useState(DEFAULT_ENUMS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showSecrets, setShowSecrets] = useState({
    DEV_CASHFREE_SECRET_KEY: true,
    PRO_CASHFREE_SECRET_KEY: true,
    MSG91_AUTH_KEY: true,
    GMAP_API_KEY: true,
  });

  const currentTabConfig = TABS.find((t) => t.id === activeTab) || TABS[0];

  const loadAllSettings = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const data = await settingsAPI.getAll();
      if (data?.settings) {
        setFormData(data.settings);
      }
      if (data?.enums) {
        setDbEnums((prev) => ({ ...prev, ...data.enums }));
      }
    } catch (err) {
      try {
        const merged = {};
        for (const cat of currentTabConfig.categories) {
          const res = await settingsAPI.getCategory(cat);
          if (res?.settings) {
            Object.assign(merged, res.settings);
          } else if (res && cat === 'fees') {
            merged.PLATFORM_FEE = res.PLATFORM_FEE ?? String(res.platformFee ?? '');
            merged.VISITING_FEE = res.VISITING_FEE ?? String(res.visitingFee ?? '');
          }
        }
        setFormData((prev) => ({ ...prev, ...merged }));
      } catch (fallbackErr) {
        console.error('Failed to load settings:', fallbackErr);
        setError(
          fallbackErr.response?.data?.message ||
            fallbackErr.message ||
            'Failed to load settings from database'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [currentTabConfig, isAdmin]);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  if (!isAdmin) {
    return (
      <div className="container-fluid p-4">
        <div
          className="card border-danger-subtle shadow-sm"
          style={{ maxWidth: '540px', margin: '2rem auto' }}
        >
          <div className="card-body text-center p-4">
            <div className="text-danger mb-3">
              <i className="bi bi-shield-lock-fill fs-1"></i>
            </div>
            <h5 className="fw-bold mb-2">Admin Access Only</h5>
            <p className="text-muted small mb-4">
              You do not have permission to view or modify System Settings. Only users with the{' '}
              <code>admin</code> role can access this section.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm px-4"
              onClick={() => navigate('/dashboard')}
            >
              <i className="bi bi-arrow-left me-1"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSuccessMsg(null);
  };

  const handleQuickSwitchCashfreeServer = async (newServerMode) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await settingsAPI.updateKey('server', newServerMode);
      setFormData((prev) => ({ ...prev, server: newServerMode }));
      setSuccessMsg(
        `Cashfree payment gateway switched to ${
          newServerMode === 'pro' ? 'Production (pro)' : 'UAT / Sandbox (dev)'
        } in database.`
      );
    } catch (err) {
      console.error('Failed to switch Cashfree server mode:', err);
      setError(err.response?.data?.message || err.message || 'Failed to switch gateway mode');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = { ...formData };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      for (const cat of currentTabConfig.categories) {
        await settingsAPI.updateCategory(cat, payload);
      }
      await loadAllSettings();
      setSuccessMsg(`${currentTabConfig.label} saved to database successfully.`);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleSecret = (key) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderEnumDropdown = (fieldKey, title, helperText) => {
    const options = dbEnums[fieldKey] || DEFAULT_ENUMS[fieldKey] || [];
    const currentValue =
      formData[fieldKey] !== undefined && formData[fieldKey] !== null
        ? String(formData[fieldKey])
        : options[0] || '';
    const labelMap = ENUM_OPTION_LABELS[fieldKey] || {};

    return (
      <div className="min-w-0">
        <label className="form-label fw-semibold mb-1 d-flex flex-wrap align-items-center gap-1">
          <span>{title}</span>
          <code className="small text-muted fw-normal">({fieldKey})</code>
        </label>
        <select
          className="form-select"
          value={currentValue}
          onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {labelMap[opt] || opt}
            </option>
          ))}
        </select>
        {helperText && <div className="form-text small">{helperText}</div>}
      </div>
    );
  };

  const isCashfreeProd = ['pro', 'prod', 'production', 'live'].includes(
    String(formData.server || '').toLowerCase()
  );

  const renderCashfreeSettings = () => (
    <div>
      {/* Enum Dropdown + Quick Environment Switcher Card */}
      <div className="p-3 rounded-3 border bg-light mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-lg-6">
            {renderEnumDropdown(
              'server',
              'Active Cashfree Environment',
              'Controls which Cashfree credentials and URL are used for customer & partner payments.'
            )}
          </div>

          <div className="col-12 col-lg-6 d-flex flex-column align-items-lg-end justify-content-center">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="text-muted small">Current DB Mode:</span>
              <span
                className={`badge ${
                  isCashfreeProd ? 'bg-danger' : 'bg-warning text-dark'
                } px-2 py-1`}
              >
                {isCashfreeProd ? 'PRODUCTION (pro)' : 'UAT / SANDBOX (dev)'}
              </span>
            </div>
            <div className="btn-group btn-group-sm" role="group" aria-label="Cashfree Mode Switch">
              <button
                type="button"
                className={`btn ${
                  !isCashfreeProd ? 'btn-warning fw-semibold' : 'btn-outline-secondary'
                }`}
                disabled={saving}
                onClick={() => handleQuickSwitchCashfreeServer('dev')}
              >
                <i className="bi bi-bug me-1"></i>Switch to dev (UAT)
              </button>
              <button
                type="button"
                className={`btn ${
                  isCashfreeProd ? 'btn-danger fw-semibold' : 'btn-outline-secondary'
                }`}
                disabled={saving}
                onClick={() => handleQuickSwitchCashfreeServer('pro')}
              >
                <i className="bi bi-shield-check me-1"></i>Switch to pro (Live)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Sandbox / DEV Credentials */}
        <div className="col-12 col-xl-6">
          <div className={`card border h-100 ${!isCashfreeProd ? 'border-warning shadow-sm' : ''}`}>
            <div className="card-header bg-warning-subtle d-flex justify-content-between align-items-center">
              <span className="fw-semibold text-dark">
                <i className="bi bi-bug me-2"></i>Sandbox / UAT Credentials (DEV)
              </span>
              {!isCashfreeProd && <span className="badge bg-warning text-dark">Active</span>}
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">DEV_CASHFREE_URL</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.DEV_CASHFREE_URL ?? ''}
                  onChange={(e) => handleFieldChange('DEV_CASHFREE_URL', e.target.value)}
                  placeholder="https://sandbox.cashfree.com/pg"
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">DEV_CASHFREE_APP_ID</label>
                <input
                  type="text"
                  className="form-control font-monospace"
                  value={formData.DEV_CASHFREE_APP_ID ?? ''}
                  onChange={(e) => handleFieldChange('DEV_CASHFREE_APP_ID', e.target.value)}
                  placeholder="TEST..."
                />
              </div>
              <div className="mb-0">
                <label className="form-label fw-semibold">DEV_CASHFREE_SECRET_KEY</label>
                <div className="input-group">
                  <input
                    type={showSecrets.DEV_CASHFREE_SECRET_KEY ? 'text' : 'password'}
                    className="form-control font-monospace"
                    value={formData.DEV_CASHFREE_SECRET_KEY ?? ''}
                    onChange={(e) => handleFieldChange('DEV_CASHFREE_SECRET_KEY', e.target.value)}
                    placeholder="cfsk_ma_test_..."
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => toggleSecret('DEV_CASHFREE_SECRET_KEY')}
                    title={showSecrets.DEV_CASHFREE_SECRET_KEY ? 'Mask key' : 'Show key'}
                  >
                    <i
                      className={`bi ${
                        showSecrets.DEV_CASHFREE_SECRET_KEY ? 'bi-eye-slash' : 'bi-eye'
                      }`}
                    ></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Production / PRO Credentials */}
        <div className="col-12 col-xl-6">
          <div className={`card border h-100 ${isCashfreeProd ? 'border-danger shadow-sm' : ''}`}>
            <div className="card-header bg-danger-subtle d-flex justify-content-between align-items-center">
              <span className="fw-semibold text-danger-emphasis">
                <i className="bi bi-shield-check me-2"></i>Production / Live Credentials (PRO)
              </span>
              {isCashfreeProd && <span className="badge bg-danger">Active</span>}
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">PRO_CASHFREE_URL</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.PRO_CASHFREE_URL ?? ''}
                  onChange={(e) => handleFieldChange('PRO_CASHFREE_URL', e.target.value)}
                  placeholder="https://api.cashfree.com/pg"
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">PRO_CASHFREE_APP_ID</label>
                <input
                  type="text"
                  className="form-control font-monospace"
                  value={formData.PRO_CASHFREE_APP_ID ?? ''}
                  onChange={(e) => handleFieldChange('PRO_CASHFREE_APP_ID', e.target.value)}
                  placeholder="Live App ID"
                />
              </div>
              <div className="mb-0">
                <label className="form-label fw-semibold">PRO_CASHFREE_SECRET_KEY</label>
                <div className="input-group">
                  <input
                    type={showSecrets.PRO_CASHFREE_SECRET_KEY ? 'text' : 'password'}
                    className="form-control font-monospace"
                    value={formData.PRO_CASHFREE_SECRET_KEY ?? ''}
                    onChange={(e) => handleFieldChange('PRO_CASHFREE_SECRET_KEY', e.target.value)}
                    placeholder="cfsk_ma_prod_..."
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => toggleSecret('PRO_CASHFREE_SECRET_KEY')}
                    title={showSecrets.PRO_CASHFREE_SECRET_KEY ? 'Mask key' : 'Show key'}
                  >
                    <i
                      className={`bi ${
                        showSecrets.PRO_CASHFREE_SECRET_KEY ? 'bi-eye-slash' : 'bi-eye'
                      }`}
                    ></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeesSettings = () => (
    <div className="row g-3">
      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold">
          Platform Fee (₹) <code className="small text-muted fw-normal">(PLATFORM_FEE)</code>
        </label>
        <input
          type="number"
          step="0.01"
          className="form-control"
          value={formData.PLATFORM_FEE ?? ''}
          onChange={(e) => handleFieldChange('PLATFORM_FEE', e.target.value)}
          placeholder="9.9"
        />
        <div className="form-text">Added automatically to customer booking totals.</div>
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold">
          Visiting Fee (₹) <code className="small text-muted fw-normal">(VISITING_FEE)</code>
        </label>
        <input
          type="number"
          step="0.01"
          className="form-control"
          value={formData.VISITING_FEE ?? ''}
          onChange={(e) => handleFieldChange('VISITING_FEE', e.target.value)}
          placeholder="99"
        />
        <div className="form-text">Standard partner visiting fee applied to bookings.</div>
      </div>
    </div>
  );

  const renderServerOtpSettings = () => (
    <div className="row g-3">
      <div className="col-12 col-md-6 col-xl-4">
        {renderEnumDropdown(
          'server',
          'Server Mode',
          'Payment gateway mode: dev (Sandbox) or pro (Production).'
        )}
      </div>
      <div className="col-12 col-md-6 col-xl-4">
        {renderEnumDropdown(
          'SERVER_TYPE',
          'Server Environment',
          'development uses OTP 1234; production sends random 4-digit OTP.'
        )}
      </div>
      <div className="col-12 col-md-12 col-xl-4">
        {renderEnumDropdown(
          'OTP_PROVIDER',
          'OTP Provider',
          'Select MSG91 live SMS provider or MOCK provider.'
        )}
      </div>

      <div className="col-12">
        <hr className="my-2" />
        <h6 className="fw-bold mb-0">MSG91 SMS Configuration</h6>
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold">MSG91_URL</label>
        <input
          type="text"
          className="form-control"
          value={formData.MSG91_URL ?? ''}
          onChange={(e) => handleFieldChange('MSG91_URL', e.target.value)}
        />
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold">MSG91_AUTH_KEY</label>
        <div className="input-group">
          <input
            type={showSecrets.MSG91_AUTH_KEY ? 'text' : 'password'}
            className="form-control font-monospace"
            value={formData.MSG91_AUTH_KEY ?? ''}
            onChange={(e) => handleFieldChange('MSG91_AUTH_KEY', e.target.value)}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => toggleSecret('MSG91_AUTH_KEY')}
          >
            <i className={`bi ${showSecrets.MSG91_AUTH_KEY ? 'bi-eye-slash' : 'bi-eye'}`}></i>
          </button>
        </div>
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold">MSG91_LOGIN_OTP_TEMPLATE_ID</label>
        <input
          type="text"
          className="form-control font-monospace"
          value={formData.MSG91_LOGIN_OTP_TEMPLATE_ID ?? ''}
          onChange={(e) => handleFieldChange('MSG91_LOGIN_OTP_TEMPLATE_ID', e.target.value)}
        />
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold">MSG91_WORK_OTP_TEMPLATE_ID</label>
        <input
          type="text"
          className="form-control font-monospace"
          value={formData.MSG91_WORK_OTP_TEMPLATE_ID ?? ''}
          onChange={(e) => handleFieldChange('MSG91_WORK_OTP_TEMPLATE_ID', e.target.value)}
        />
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="row g-3">
      <div className="col-12">
        <label className="form-label fw-semibold">
          Google Maps API Key <code className="small text-muted fw-normal">(GMAP_API_KEY)</code>
        </label>
        <div className="input-group">
          <input
            type={showSecrets.GMAP_API_KEY ? 'text' : 'password'}
            className="form-control font-monospace"
            value={formData.GMAP_API_KEY ?? ''}
            onChange={(e) => handleFieldChange('GMAP_API_KEY', e.target.value)}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => toggleSecret('GMAP_API_KEY')}
          >
            <i className={`bi ${showSecrets.GMAP_API_KEY ? 'bi-eye-slash' : 'bi-eye'}`}></i>
          </button>
        </div>
      </div>
      <div className="col-12">
        <label className="form-label fw-semibold">
          Firebase / FCM Key <code className="small text-muted fw-normal">(FCM)</code>
        </label>
        <textarea
          rows="4"
          className="form-control font-monospace"
          value={formData.FCM ?? ''}
          onChange={(e) => handleFieldChange('FCM', e.target.value)}
          placeholder="Optional FCM / Firebase configuration stored in DB"
        />
      </div>
    </div>
  );

  const renderContactsSettings = () => (
    <div className="row g-3">
      <div className="col-12">
        <h6 className="fw-bold mb-1">Customer App (Home Services) Contacts</h6>
      </div>
      <div className="col-12 col-md-4">
        <label className="form-label fw-semibold">HOME_SERVICES_EMAIL</label>
        <input
          type="email"
          className="form-control"
          value={formData.HOME_SERVICES_EMAIL ?? ''}
          onChange={(e) => handleFieldChange('HOME_SERVICES_EMAIL', e.target.value)}
        />
      </div>
      <div className="col-12 col-md-4">
        <label className="form-label fw-semibold">HOME_SERVICES_PHONE</label>
        <input
          type="text"
          className="form-control"
          value={formData.HOME_SERVICES_PHONE ?? ''}
          onChange={(e) => handleFieldChange('HOME_SERVICES_PHONE', e.target.value)}
        />
      </div>
      <div className="col-12 col-md-4">
        <label className="form-label fw-semibold">HOME_SERVICES_WHATSAPP</label>
        <input
          type="text"
          className="form-control"
          value={formData.HOME_SERVICES_WHATSAPP ?? ''}
          onChange={(e) => handleFieldChange('HOME_SERVICES_WHATSAPP', e.target.value)}
        />
      </div>

      <div className="col-12 mt-3">
        <h6 className="fw-bold mb-1">Partner App Contacts</h6>
      </div>
      <div className="col-12 col-md-4">
        <label className="form-label fw-semibold">PARTNER_EMAIL</label>
        <input
          type="email"
          className="form-control"
          value={formData.PARTNER_EMAIL ?? ''}
          onChange={(e) => handleFieldChange('PARTNER_EMAIL', e.target.value)}
        />
      </div>
      <div className="col-12 col-md-4">
        <label className="form-label fw-semibold">PARTNER_PHONE</label>
        <input
          type="text"
          className="form-control"
          value={formData.PARTNER_PHONE ?? ''}
          onChange={(e) => handleFieldChange('PARTNER_PHONE', e.target.value)}
        />
      </div>
      <div className="col-12 col-md-4">
        <label className="form-label fw-semibold">PARTNER_WHATSAPP</label>
        <input
          type="text"
          className="form-control"
          value={formData.PARTNER_WHATSAPP ?? ''}
          onChange={(e) => handleFieldChange('PARTNER_WHATSAPP', e.target.value)}
        />
      </div>
    </div>
  );

  const renderVersionsSettings = () => (
    <div className="row g-3">
      <div className="col-12 col-md-6">
        {renderEnumDropdown(
          'MAINTENANCE_TYPE',
          'Maintenance Mode',
          'Set to true to put customer and partner apps into maintenance mode.'
        )}
      </div>

      <div className="col-12 mt-3">
        <h6 className="fw-bold mb-1">Customer App Versions</h6>
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold">HOME_SERVICES_ANDROID_VERSION</label>
        <input
          type="text"
          className="form-control"
          value={formData.HOME_SERVICES_ANDROID_VERSION ?? ''}
          onChange={(e) => handleFieldChange('HOME_SERVICES_ANDROID_VERSION', e.target.value)}
        />
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold">HOME_SERVICES_IOS_VERSION</label>
        <input
          type="text"
          className="form-control"
          value={formData.HOME_SERVICES_IOS_VERSION ?? ''}
          onChange={(e) => handleFieldChange('HOME_SERVICES_IOS_VERSION', e.target.value)}
        />
      </div>
      <div className="col-12">
        <label className="form-label fw-semibold">HOME_SERVICES_VERSION_FEATURES</label>
        <textarea
          rows="2"
          className="form-control"
          value={formData.HOME_SERVICES_VERSION_FEATURES ?? ''}
          onChange={(e) => handleFieldChange('HOME_SERVICES_VERSION_FEATURES', e.target.value)}
        />
      </div>

      <div className="col-12 mt-3">
        <h6 className="fw-bold mb-1">Partner App Versions</h6>
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold">PARTNER_ANDROID_VERSION</label>
        <input
          type="text"
          className="form-control"
          value={formData.PARTNER_ANDROID_VERSION ?? ''}
          onChange={(e) => handleFieldChange('PARTNER_ANDROID_VERSION', e.target.value)}
        />
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold">PARTNER_IOS_VERSION</label>
        <input
          type="text"
          className="form-control"
          value={formData.PARTNER_IOS_VERSION ?? ''}
          onChange={(e) => handleFieldChange('PARTNER_IOS_VERSION', e.target.value)}
        />
      </div>
      <div className="col-12">
        <label className="form-label fw-semibold">PARTNER_VERSION_FEATURES</label>
        <textarea
          rows="2"
          className="form-control"
          value={formData.PARTNER_VERSION_FEATURES ?? ''}
          onChange={(e) => handleFieldChange('PARTNER_VERSION_FEATURES', e.target.value)}
        />
      </div>
    </div>
  );

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'cashfree':
        return renderCashfreeSettings();
      case 'fees':
        return renderFeesSettings();
      case 'server_otp':
        return renderServerOtpSettings();
      case 'integrations':
        return renderIntegrationsSettings();
      case 'contacts':
        return renderContactsSettings();
      case 'versions':
        return renderVersionsSettings();
      default:
        return renderCashfreeSettings();
    }
  };

  return (
    <div className="container-fluid p-3 p-lg-4 w-100 min-w-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="mb-0 fw-bold">System Settings</h4>
          <small className="text-muted">
            Manage live database configuration directly from the admin panel
          </small>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={loadAllSettings}
          disabled={loading || saving}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh from DB
        </button>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-3">
          <div className="card shadow-sm border-0">
            <div className="list-group list-group-flush rounded-3">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${
                    activeTab === tab.id ? 'active fw-semibold' : ''
                  }`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSuccessMsg(null);
                    setError(null);
                  }}
                >
                  <i className={`bi ${tab.icon} me-2`}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-9 min-w-0">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
              <h5 className="mb-0 d-flex align-items-center">
                <i className={`bi ${currentTabConfig.icon} me-2 text-primary`}></i>
                {currentTabConfig.label}
              </h5>
              {formData.updated_at && (
                <small className="text-muted">
                  <i className="bi bi-database-check me-1 text-success"></i>
                  Last DB Update: {new Date(formData.updated_at).toLocaleString()}
                </small>
              )}
            </div>

            <div className="card-body">
              {error && (
                <div className="alert alert-danger d-flex align-items-center mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              {successMsg && (
                <div className="alert alert-success d-flex align-items-center mb-3">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <div>{successMsg}</div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary me-2" role="status"></div>
                  <span className="text-muted">Loading settings from database...</span>
                </div>
              ) : (
                <form onSubmit={handleSave}>
                  {renderActiveTabContent()}

                  <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={loadAllSettings}
                      disabled={saving}
                    >
                      Reset to DB Values
                    </button>
                    <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2-circle me-1"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
