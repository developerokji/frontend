import React, { useState } from 'react';

const Settings = () => {
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

  return (
    <div className="container-fluid p-3 p-lg-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Settings</h4>
      </div>

      <div className="row">
        <div className="col-12 col-lg-3">
          <div className="card">
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
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                {activeTab === 'general' && 'General Settings'}
                {activeTab === 'security' && 'Security Settings'}
                {activeTab === 'storage' && 'Storage Settings'}
                {activeTab === 'notifications' && 'Notification Settings'}
              </h5>
            </div>
            <div className="card-body">
              {activeTab === 'general' && (
                <form>
                  <div className="mb-3">
                    <label htmlFor="siteName" className="form-label">Site Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="siteName"
                      name="siteName"
                      value={settings.siteName}
                      onChange={handleInputChange}
                    />
                  </div>
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
                </form>
              )}

              {activeTab === 'security' && (
                <form>
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
                  <div className="mb-3">
                    <label htmlFor="sessionTimeout" className="form-label">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="sessionTimeout"
                      defaultValue="30"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="maxLoginAttempts" className="form-label">Max Login Attempts</label>
                    <input
                      type="number"
                      className="form-control"
                      id="maxLoginAttempts"
                      defaultValue="5"
                    />
                  </div>
                </form>
              )}

              {activeTab === 'storage' && (
                <form>
                  <div className="mb-3">
                    <label htmlFor="maxFileSize" className="form-label">Max File Size (MB)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="maxFileSize"
                      name="maxFileSize"
                      value={settings.maxFileSize}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="allowedFileTypes" className="form-label">Allowed File Types</label>
                    <input
                      type="text"
                      className="form-control"
                      id="allowedFileTypes"
                      defaultValue="jpg, png, gif, pdf"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="storagePath" className="form-label">Storage Path</label>
                    <input
                      type="text"
                      className="form-control"
                      id="storagePath"
                      defaultValue="/uploads"
                    />
                  </div>
                </form>
              )}

              {activeTab === 'notifications' && (
                <form>
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
                  <div className="mb-3">
                    <label htmlFor="adminEmail" className="form-label">Admin Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="adminEmail"
                      defaultValue="admin@okji.com"
                    />
                  </div>
                </form>
              )}

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary">Cancel</button>
                <button type="button" className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
