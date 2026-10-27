import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { icon: 'bi-speedometer2', text: 'Dashboard', path: '/dashboard' },
  { icon: 'bi-book', text: 'Stories', path: '/stories' },
  { icon: 'bi-geo-alt', text: 'Locality', path: '/locality' },
  { icon: 'bi-image', text: 'Banner', path: '/banner' },
  { icon: 'bi-tags', text: 'Categories', path: '/categories', hasSubmenu: true },
  { icon: 'bi-gear', text: 'Services', path: '/services' },
  { icon: 'bi-person-badge', text: 'Client', path: '/client' },
  { icon: 'bi-people', text: 'Partner', path: '/partner', hasSubmenu: true },
  { icon: 'bi-box', text: 'Package', path: '/package' },
  { icon: 'bi-telephone', text: 'Lead', path: '/lead' },
];

const submenus = {
  Partner: [
    { icon: 'bi-list-check', text: 'Partner List', path: '/partner/list' },
    { icon: 'bi-card-checklist', text: 'Subscription Partner', path: '/partner/subscription' },
    { icon: 'bi-clock-history', text: 'Expire Partner', path: '/partner/expire' },
  ],
  Categories: [
    { icon: 'bi-plus-circle', text: 'Add Category', path: '/categories/add' },
    { icon: 'bi-plus-square', text: 'Add Sub Category', path: '/categories/subcategory' },
  ],
};

/**
 * Side navigation. On lg+ it is a fixed column; below lg it is an off-canvas
 * drawer controlled by `open` / `onClose` (see App.css .app-sidebar).
 */
const Sidebar = ({ id = 'app-sidebar', open = false, onClose }) => {
  const location = useLocation();
  // Start with the section that contains the current page expanded.
  const [expanded, setExpanded] = useState(() => ({
    Partner: location.pathname.startsWith('/partner'),
    Categories: location.pathname.startsWith('/categories'),
  }));

  const toggle = (name) => setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

  return (
    <aside
      id={id}
      className={`app-sidebar d-flex flex-column px-3 bg-light border-end ${open ? 'is-open' : ''}`}
      aria-label="Main navigation"
    >
      <div className="d-flex align-items-start mb-4">
        <Link to="/dashboard" className="app-sidebar-logo d-block" aria-label="OKJI dashboard"></Link>
        <button
          type="button"
          className="btn-close d-lg-none flex-shrink-0"
          aria-label="Close menu"
          onClick={onClose}
        ></button>
      </div>

      <nav>
        <ul className="nav nav-pills flex-column mb-auto">
          {menuItems.map((item) => {
            if (!item.hasSubmenu) {
              return (
                <li className="nav-item" key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${location.pathname === item.path ? 'active' : 'text-dark'}`}
                    aria-current={location.pathname === item.path ? 'page' : undefined}
                  >
                    <i className={`bi ${item.icon} me-2`} aria-hidden="true"></i>
                    {item.text}
                  </Link>
                </li>
              );
            }

            const isOpen = expanded[item.text];
            const submenuId = `${id}-${item.text.toLowerCase()}`;
            return (
              <li className="nav-item" key={item.path}>
                <button
                  type="button"
                  className={`nav-link d-flex align-items-center justify-content-between w-100 border-0 ${
                    location.pathname.startsWith(item.path) ? 'active' : 'text-dark bg-transparent'
                  }`}
                  onClick={() => toggle(item.text)}
                  aria-expanded={isOpen}
                  aria-controls={submenuId}
                >
                  <span className="d-flex align-items-center">
                    <i className={`bi ${item.icon} me-2`} aria-hidden="true"></i>
                    {item.text}
                  </span>
                  <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true"></i>
                </button>
                {isOpen && (
                  <ul id={submenuId} className="nav nav-pills flex-column ms-3 mt-1">
                    {submenus[item.text].map((sub) => (
                      <li className="nav-item" key={sub.path}>
                        <Link
                          to={sub.path}
                          className={`nav-link ${location.pathname === sub.path ? 'active' : 'text-dark'}`}
                          aria-current={location.pathname === sub.path ? 'page' : undefined}
                        >
                          <i className={`bi ${sub.icon} me-2`} aria-hidden="true"></i>
                          {sub.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
