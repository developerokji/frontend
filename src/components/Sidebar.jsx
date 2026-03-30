import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [partnerExpanded, setPartnerExpanded] = useState(false);
  
  const menuItems = [
    { icon: 'bi-speedometer2', text: 'Dashboard', path: '/dashboard' },
    { icon: 'bi-book', text: 'Stories', path: '/stories' },
    { icon: 'bi-geo-alt', text: 'Locality', path: '/locality' },
    { icon: 'bi-image', text: 'Banner', path: '/banner' },
    { icon: 'bi-tags', text: 'Categories', path: '/categories' },
    { icon: 'bi-person-badge', text: 'Client', path: '/client' },
    { icon: 'bi-people', text: 'Partner', path: '/partner', hasSubmenu: true },
    { icon: 'bi-gear', text: 'Services', path: '/services' },
    { icon: 'bi-box', text: 'Package', path: '/package' },
    { icon: 'bi-telephone', text: 'Lead', path: '/lead' },
    { icon: 'bi-people', text: 'Users', path: '/users' },
    { icon: 'bi-gear', text: 'Settings', path: '/settings' },
  ];

  const partnerSubmenu = [
    { icon: 'bi-person-plus', text: 'Add Partner', path: '/partner/add' },
    { icon: 'bi-list-check', text: 'Partner List', path: '/partner/list' },
    { icon: 'bi-graph-up', text: 'Partner Analytics', path: '/partner/analytics' },
    { icon: 'bi-award', text: 'Partner Performance', path: '/partner/performance' },
  ];

  return (
    <div className="d-flex flex-column p-3 bg-light border-end" style={{ width: '250px', height: '100vh', overflowY: 'auto' }}>
      <h5 className="mb-4">
        <a className="navbar-brand fw-bold text-primary text-decoration-none" href="#">
          <i className="bi bi-book me-2"></i>
          OKJI
        </a>
      </h5>
      
      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map((item, index) => (
          <li className="nav-item" key={index}>
            {item.hasSubmenu ? (
              <div>
                <button
                  className={`nav-link d-flex align-items-center justify-content-between w-100 ${
                    location.pathname.startsWith(item.path) ? 'active' : 'text-dark'
                  }`}
                  onClick={() => setPartnerExpanded(!partnerExpanded)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    <i className={`bi ${item.icon} me-3`}></i>
                    <span>{item.text}</span>
                  </div>
                  <i className={`bi ${partnerExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                </button>
                
                {partnerExpanded && (
                  <ul className="nav nav-pills flex-column ms-3 mt-1">
                    {partnerSubmenu.map((subItem, subIndex) => (
                      <li className="nav-item" key={subIndex}>
                        <Link
                          to={subItem.path}
                          className={`nav-link d-flex align-items-center ${
                            location.pathname === subItem.path ? 'active' : 'text-dark'
                          }`}
                          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                        >
                          <i className={`bi ${subItem.icon} me-2`}></i>
                          <span>{subItem.text}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center ${
                  location.pathname === item.path ? 'active' : 'text-dark'
                }`}
              >
                <i className={`bi ${item.icon} me-3`}></i>
                <span>{item.text}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
