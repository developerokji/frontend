import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: 'bi-speedometer2', text: 'Dashboard', path: '/dashboard' },
    { icon: 'bi-book', text: 'Stories', path: '/stories' },
    { icon: 'bi-geo-alt', text: 'Locality', path: '/locality' },
    // { icon: 'bi-people', text: 'Users', path: '/users' },
    // { icon: 'bi-gear', text: 'Settings', path: '/settings' },
  ];

  return (
    <div className="d-flex flex-column p-3 bg-light border-end" style={{ width: '250px' }}>
      <h5 className="mb-4"><a className="navbar-brand fw-bold text-primary" href="#">
          OKJI
        </a></h5>
      
      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map((item, index) => (
          <li className="nav-item" key={index}>
            <Link
              to={item.path}
              className={`nav-link d-flex align-items-center ${
                location.pathname === item.path ? 'active' : 'text-dark'
              }`}
            >
              <i className={`bi ${item.icon} me-3`}></i>
              <span>{item.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
