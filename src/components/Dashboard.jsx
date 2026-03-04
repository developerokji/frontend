import React from 'react';

const Dashboard = () => {
  return (
    <div className="container-fluid p-3 p-lg-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Dashboard</h4>
      </div>
      
      <div className="row g-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-primary">Total Stories</h5>
              <h2 className="fw-bold">24</h2>
              <small className="text-muted">+3 this week</small>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-success">Active Users</h5>
              <h2 className="fw-bold">156</h2>
              <small className="text-muted">+12 this week</small>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-warning">Localities</h5>
              <h2 className="fw-bold">8</h2>
              <small className="text-muted">+2 this month</small>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-info">Total Views</h5>
              <h2 className="fw-bold">1.2K</h2>
              <small className="text-muted">+240 this week</small>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Activity</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">New story added</h6>
                    <small className="text-muted">2 hours ago</small>
                  </div>
                  <span className="badge bg-primary">Story</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">New user registered</h6>
                    <small className="text-muted">5 hours ago</small>
                  </div>
                  <span className="badge bg-success">User</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Locality updated</h6>
                    <small className="text-muted">1 day ago</small>
                  </div>
                  <span className="badge bg-warning">Locality</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Stats</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Storage Used</span>
                  <span className="text-muted">65%</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: '65%' }}></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Bandwidth</span>
                  <span className="text-muted">42%</span>
                </div>
                <div className="progress">
                  <div className="progress-bar bg-success" style={{ width: '42%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>API Calls</span>
                  <span className="text-muted">89%</span>
                </div>
                <div className="progress">
                  <div className="progress-bar bg-warning" style={{ width: '89%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
