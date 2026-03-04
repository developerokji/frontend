import React from 'react';
import LogoutButton from './common/LogoutButton';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container-fluid">
        
        
        <div className="ms-auto d-flex align-items-center">
          <div className="me-3">
            <small className="text-muted">
              <i className="bi bi-person-circle me-1"></i>
              Developer
            </small>
          </div>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
