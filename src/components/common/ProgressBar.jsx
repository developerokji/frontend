import React from 'react';

const ProgressBar = ({ label, value, color = 'primary' }) => {
  const getColorClass = () => {
    switch(color) {
      case 'success': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'info': return 'bg-info';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span>{label}</span>
        <span className="text-muted">{value}%</span>
      </div>
      <div className="progress">
        <div className={`progress-bar ${getColorClass()}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;
