import React from 'react';

const StatCard = ({ title, value, change, color, icon }) => {
  const getColorClass = () => {
    switch(color) {
      case 'primary': return 'text-primary';
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'info': return 'text-info';
      default: return 'text-primary';
    }
  };

  return (
    <div className="card text-center h-100">
      <div className="card-body d-flex flex-column justify-content-center">
        <h5 className={`card-title ${getColorClass()}`}>{title}</h5>
        <h2 className="fw-bold">{value}</h2>
        <small className="text-muted">{change}</small>
      </div>
    </div>
  );
};

export default StatCard;
