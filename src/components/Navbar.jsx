import React from 'react';
import LogoutButton from './common/LogoutButton';

const Navbar = ({ onToggleSidebar, sidebarOpen = false, sidebarId = 'app-sidebar' }) => {
  return (
    <nav className="app-navbar navbar navbar-light bg-white border-bottom flex-shrink-0">
      <div className="container-fluid flex-nowrap gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm d-lg-none"
          onClick={onToggleSidebar}
          aria-controls={sidebarId}
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          <i className="bi bi-list fs-5" aria-hidden="true"></i>
        </button>

        <div className="ms-auto d-flex align-items-center gap-3 min-w-0">
          <small className="text-muted text-truncate">
            <i className="bi bi-person-circle me-1" aria-hidden="true"></i>
            Developer
          </small>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
