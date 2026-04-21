import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [partnerExpanded, setPartnerExpanded] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  
  const menuItems = [
    { icon: 'bi-speedometer2', text: 'Dashboard', path: '/dashboard' },
    { icon: 'bi-book', text: 'Stories', path: '/stories' },
    { icon: 'bi-geo-alt', text: 'Locality', path: '/locality' },
    { icon: 'bi-image', text: 'Banner', path: '/banner' },
    { icon: 'bi-tags', text: 'Categories', path: '/categories', hasSubmenu: true },
    { icon: 'bi-person-badge', text: 'Client', path: '/client' },
    { icon: 'bi-people', text: 'Partner', path: '/partner', hasSubmenu: true },
    { icon: 'bi-gear', text: 'Services', path: '/services' },
    { icon: 'bi-box', text: 'Package', path: '/package' },
    { icon: 'bi-telephone', text: 'Lead', path: '/lead' },
    { icon: 'bi-people', text: 'Users', path: '/users' },
    { icon: 'bi-gear', text: 'Settings', path: '/settings' },
  ];

  const partnerSubmenu = [
    { icon: 'bi-list-check', text: 'Partner List', path: '/partner/list' },
    { icon: 'bi-card-checklist', text: 'Subscription Partner', path: '/partner/subscription' },
    { icon: 'bi-clock-history', text: 'Expire Partner', path: '/partner/expire' },
  ];

  const categoriesSubmenu = [
    { icon: 'bi-plus-circle', text: 'Add Category', path: '/categories/add' },
    { icon: 'bi-plus-square', text: 'Add Sub Category', path: '/categories/subcategory' },
  ];

  return (
    <div className="d-flex flex-column p-3 bg-light border-end" style={{ width: '250px', height: '100vh', overflowY: 'auto' }}>
      <div className="mb-4">
        <div 
          style={{ 
            width: '200px', 
            height: '120px', 
            backgroundImage: 'url(/image.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            margin: '0 auto'
          }}
        />
      </div>
      
      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map((item, index) => (
          <li className="nav-item" key={index}>
            {item.hasSubmenu ? (
              <div>
                <button
                  className={`nav-link d-flex align-items-center justify-content-between w-100 ${
                    location.pathname.startsWith(item.path) ? 'active' : 'text-dark'
                  }`}
                  onClick={() => {
                    if (item.text === 'Partner') {
                      setPartnerExpanded(!partnerExpanded);
                    } else if (item.text === 'Categories') {
                      setCategoriesExpanded(!categoriesExpanded);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    <i className={`bi ${item.icon} me-2`}></i>
                    {item.text}
                  </div>
                  <i className={`bi ${item.text === 'Partner' ? (partnerExpanded ? 'bi-chevron-up' : 'bi-chevron-down') : (categoriesExpanded ? 'bi-chevron-up' : 'bi-chevron-down')}`}></i>
                </button>
                {item.text === 'Partner' && partnerExpanded && (
                  <ul className="nav nav-pills flex-column ms-3 mt-1">
                    {partnerSubmenu.map((subItem, subIndex) => (
                      <li className="nav-item" key={subIndex}>
                        <Link
                          to={subItem.path}
                          className={`nav-link ${
                            location.pathname === subItem.path ? 'active' : 'text-dark'
                          }`}
                        >
                          <i className={`bi ${subItem.icon} me-2`}></i>
                          {subItem.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {item.text === 'Categories' && categoriesExpanded && (
                  <ul className="nav nav-pills flex-column ms-3 mt-1">
                    {categoriesSubmenu.map((subItem, subIndex) => (
                      <li className="nav-item" key={subIndex}>
                        <Link
                          to={subItem.path}
                          className={`nav-link ${
                            location.pathname === subItem.path ? 'active' : 'text-dark'
                          }`}
                        >
                          <i className={`bi ${subItem.icon} me-2`}></i>
                          {subItem.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link
                to={item.path}
                className={`nav-link ${
                  location.pathname === item.path ? 'active' : 'text-dark'
                }`}
              >
                <i className={`bi ${item.icon} me-2`}></i>
                {item.text}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
