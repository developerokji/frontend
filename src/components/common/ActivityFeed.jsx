import React from 'react';

const ActivityFeed = ({ activities }) => {
  const getBadgeClass = (type) => {
    switch(type) {
      case 'Story': return 'bg-primary';
      case 'User': return 'bg-success';
      case 'Locality': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="card-body">
      <div className="list-group list-group-flush">
        {activities.map((activity, index) => (
          <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">{activity.title}</h6>
              <small className="text-muted">{activity.time}</small>
            </div>
            <span className={`badge ${getBadgeClass(activity.type)}`}>
              {activity.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
