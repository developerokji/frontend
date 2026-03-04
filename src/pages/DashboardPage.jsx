import React from 'react';
import StatCard from '../components/common/StatCard';
import ActivityFeed from '../components/common/ActivityFeed';
import ProgressBar from '../components/common/ProgressBar';

const DashboardPage = () => {
  const stats = [
    { title: 'Total Stories', value: '24', change: '+3 this week', color: 'primary' },
    { title: 'Active Users', value: '156', change: '+12 this week', color: 'success' },
    { title: 'Localities', value: '8', change: '+2 this month', color: 'warning' },
    { title: 'Total Views', value: '1.2K', change: '+240 this week', color: 'info' }
  ];

  const activities = [
    { title: 'New story added', time: '2 hours ago', type: 'Story' },
    { title: 'New user registered', time: '5 hours ago', type: 'User' },
    { title: 'Locality updated', time: '1 day ago', type: 'Locality' }
  ];

  const progressStats = [
    { label: 'Storage Used', value: 65, color: 'primary' },
    { label: 'Bandwidth', value: 42, color: 'success' },
    { label: 'API Calls', value: 89, color: 'warning' }
  ];

  return (
    <div className="container-fluid p-3 p-lg-4 w-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Dashboard</h4>
      </div>
      
      {/* <div className="row g-4 w-100">
        {stats.map((stat, index) => (
          <div key={index} className="col-12 col-md-6 col-lg-3">
            <StatCard {...stat} />
          </div>
        ))}
      </div>
      
      <div className="row mt-4 w-100">
        <div className="col-12 col-lg-8">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Recent Activity</h5>
            </div>
            <ActivityFeed activities={activities} />
          </div>
        </div>
        
        <div className="col-12 col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Quick Stats</h5>
            </div>
            <div className="card-body">
              {progressStats.map((stat, index) => (
                <ProgressBar key={index} {...stat} />
              ))}
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default DashboardPage;
