import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const SIDEBAR_ID = 'app-sidebar';

/**
 * Authenticated page shell: sidebar + navbar + scrollable main area.
 * Below 992px the sidebar is a drawer that closes on navigation, on Escape,
 * or when the backdrop is tapped.
 */
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the drawer whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setSidebarOpen(false);
  }

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen]);

  // If the window grows past the drawer breakpoint, reset the drawer state.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 992px)');
    const onChange = (e) => {
      if (e.matches) setSidebarOpen(false);
    };
    // Safari < 14 only supports addListener.
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  return (
    <div className="app-shell">
      <Sidebar id={SIDEBAR_ID} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <button
          type="button"
          className="app-backdrop d-lg-none"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="app-content">
        <Navbar
          sidebarId={SIDEBAR_ID}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
