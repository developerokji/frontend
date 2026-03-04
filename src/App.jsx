import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import AuthGuard from './components/common/AuthGuard';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StoriesPage from './pages/StoriesPage';
import LocalityPage from './pages/LocalityPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <div className="d-flex" style={{ height: '100vh', width: '100vw' }}>
                <Sidebar />
                <div className="flex-grow-1 d-flex flex-column">
                  <Navbar />
                  <main className="flex-grow-1 overflow-auto p-3" style={{ width: 'calc(100vw - 250px)' }}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/stories" element={<StoriesPage />} />
                      <Route path="/locality" element={<LocalityPage />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
