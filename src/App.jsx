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
import BannerPage from './pages/BannerPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AddCategoryPage from './pages/AddCategoryPage';
import AddSubCategoryPage from './pages/AddSubCategoryPage';
import Services from './components/Services';
import Clients from './components/Clients';
import PartnerList from './components/PartnerList';

// Placeholder components for new routes
const CategoriesPage = () => <div className="p-4"><h2>Categories Management</h2><p>Categories content will go here...</p></div>;
const PartnerPage = () => <div className="p-4"><h2>Partner Management</h2><p>Partner content will go here...</p></div>;
const SubscriptionPartnerPage = () => <div className="p-4"><h2>Subscription Partner</h2><p>Subscription partner content will go here...</p></div>;
const ExpirePartnerPage = () => <div className="p-4"><h2>Expire Partner</h2><p>Expire partner content will go here...</p></div>;
const PackagePage = () => <div className="p-4"><h2>Package Management</h2><p>Package content will go here...</p></div>;
const LeadPage = () => <div className="p-4"><h2>Lead Management</h2><p>Lead content will go here...</p></div>;

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
                      <Route path="/banner" element={<BannerPage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/categories/add" element={<AddCategoryPage />} />
                      <Route path="/categories/subcategory" element={<AddSubCategoryPage />} />
                      <Route path="/client" element={<Clients />} />
                      <Route path="/partner" element={<PartnerPage />} />
                      <Route path="/partner/list" element={<PartnerList />} />
                      <Route path="/partner/subscription" element={<SubscriptionPartnerPage />} />
                      <Route path="/partner/expire" element={<ExpirePartnerPage />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/package" element={<PackagePage />} />
                      <Route path="/lead" element={<LeadPage />} />
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
