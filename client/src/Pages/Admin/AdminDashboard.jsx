import React from 'react';
import './AdminDashboard.css';
import { Link, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import UserManagement from './UserManagement';

const sidebarOptions = [
  { key: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-gauge', path: '/admin-dashboard' },
  { key: 'users', label: 'Users Management', icon: 'fa-solid fa-users', path: '/admin-dashboard/users' },
  { key: 'invoices', label: 'Invoice Management', icon: 'fa-solid fa-file-invoice', path: '/admin-dashboard/invoices' },
];

export default function AdminDashboard({ adminName = 'Admin1', adminCode = 'AD001' }) {
  const location = useLocation();
  const active = sidebarOptions.find(opt => location.pathname.startsWith(opt.path))?.key || 'dashboard';

  return (
    <div className="admin-dashboard-root">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="dashboard-title">Admin Dashboard</div>
          <div className="admin-info">
            <div className="admin-name">{adminName}</div>
            <div className="admin-code">{adminCode}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {sidebarOptions.map(opt => (
            <Link
              key={opt.key}
              to={opt.path}
              className={`sidebar-option${active === opt.key ? ' active' : ''}`}
            >
              <i className={opt.icon} style={{marginRight:'10px'}}></i>
              {opt.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-logout">
          <i className="fa-solid fa-right-from-bracket" style={{marginRight:'10px'}}></i>Logout
        </div>
      </aside>
      <main className="dashboard-main">
        <Routes>
          <Route path="/" element={
            <>
              <div className="dashboard-header">Dashboard Overview</div>
              <div className="dashboard-cards">
                <div className="dashboard-card">
                  <div className="card-icon card-blue"><i className="fa-solid fa-users"></i></div>
                  <div className="card-label">Total Users</div>
                  <div className="card-value">6</div>
                </div>
                <div className="dashboard-card">
                  <div className="card-icon card-green"><i className="fa-solid fa-phone"></i></div>
                  <div className="card-label">Phone Inspections</div>
                  <div className="card-value">3</div>
                </div>
                <div className="dashboard-card">
                  <div className="card-icon card-yellow"><i className="fa-solid fa-clipboard-list"></i></div>
                  <div className="card-label">Active Claims</div>
                  <div className="card-value">0</div>
                </div>
                <div className="dashboard-card">
                  <div className="card-icon card-purple"><i className="fa-solid fa-shield"></i></div>
                  <div className="card-label">Warranties Sold</div>
                  <div className="card-value">0</div>
                </div>
              </div>
              <div className="dashboard-sales">
                <div>Warranties Sales Per Month</div>
                <div>Total Sales: 0</div>
                <div className="dashboard-sales-chart"></div>
              </div>
            </>
          } />
          <Route path="users" element={<UserManagement />} />
          <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
