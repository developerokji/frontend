import React, { useState } from 'react';
import { CustomButton } from '../components/common/CustomButton';
import CustomInput from '../components/common/CustomInput';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: 'OKJI Stories',
    siteDescription: 'Share your stories with the world',
    allowRegistration: true,
    requireApproval: false,
    maxFileSize: 5,
    maintenanceMode: false
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const renderGeneralSettings = () => (
    <div>
      <CustomInput
        label="Site Name"
        name="siteName"
        value={settings.siteName}
        onChange={handleInputChange}
      />
      <div className="mb-3">
        <label htmlFor="siteDescription" className="form-label">Site Description</label>
        <textarea
          className="form-control"
          id="siteDescription"
          name="siteDescription"
          rows="3"
          value={settings.siteDescription}
          onChange={handleInputChange}
        />
      </div>
      <div className="mb-3">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="allowRegistration"
            name="allowRegistration"
            checked={settings.allowRegistration}
            onChange={handleInputChange}
          />
          <label className="form-check-label" htmlFor="allowRegistration">
            Allow User Registration
          </label>
        </div>
      </div>
      <div className="mb-3">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="maintenanceMode"
            name="maintenanceMode"
            checked={settings.maintenanceMode}
            onChange={handleInputChange}
          />
          <label className="form-check-label" htmlFor="maintenanceMode">
            Maintenance Mode
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div>
      <div className="mb-3">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="requireApproval"
            name="requireApproval"
            checked={settings.requireApproval}
            onChange={handleInputChange}
          />
          <label className="form-check-label" htmlFor="requireApproval">
            Require Admin Approval for New Stories
          </label>
        </div>
      </div>
      <CustomInput
        label="Session Timeout (minutes)"
        type="number"
        id="sessionTimeout"
        defaultValue="30"
      />
      <CustomInput
        label="Max Login Attempts"
        type="number"
        id="maxLoginAttempts"
        defaultValue="5"
      />
    </div>
  );

  const renderStorageSettings = () => (
    <div>
      <CustomInput
        label="Max File Size (MB)"
        type="number"
        name="maxFileSize"
        value={settings.maxFileSize}
        onChange={handleInputChange}
      />
      <CustomInput
        label="Allowed File Types"
        id="allowedFileTypes"
        defaultValue="jpg, png, gif, pdf"
      />
      <CustomInput
        label="Storage Path"
        id="storagePath"
        defaultValue="/uploads"
      />
    </div>
  );

  const renderNotificationSettings = () => (
    <div>
      <div className="mb-3">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="emailNotifications"
            defaultChecked
          />
          <label className="form-check-label" htmlFor="emailNotifications">
            Email Notifications
          </label>
        </div>
      </div>
      <div className="mb-3">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="pushNotifications"
            defaultChecked
          />
          <label className="form-check-label" htmlFor="pushNotifications">
            Push Notifications
          </label>
        </div>
      </div>
      <CustomInput
        label="Admin Email"
        type="email"
        id="adminEmail"
        defaultValue="admin@okji.com"
      />
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'storage':
        return renderStorageSettings();
      case 'notifications':
        return renderNotificationSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="container-fluid p-3 p-lg-4 w-100 h-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Settings</h4>
      </div>

      <div className="row h-100">
        <div className="col-12 col-lg-3">
          <div className="card h-100">
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'general' ? 'active' : ''}`}
                  onClick={() => setActiveTab('general')}
                >
                  <i className="bi bi-gear me-2"></i> General
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <i className="bi bi-shield-lock me-2"></i> Security
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'storage' ? 'active' : ''}`}
                  onClick={() => setActiveTab('storage')}
                >
                  <i className="bi bi-hdd me-2"></i> Storage
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <i className="bi bi-bell me-2"></i> Notifications
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-9">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">
                {activeTab === 'general' && 'General Settings'}
                {activeTab === 'security' && 'Security Settings'}
                {activeTab === 'storage' && 'Storage Settings'}
                {activeTab === 'notifications' && 'Notification Settings'}
              </h5>
            </div>
            <div className="card-body">
              <form>
                {renderTabContent()}
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <CustomButton variant="secondary">
                    Cancel
                  </CustomButton>
                  <CustomButton>
                    Save Changes
                  </CustomButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
