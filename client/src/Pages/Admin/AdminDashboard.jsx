import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import { Link, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import InvoiceManagement from './InvoiceManagement';
import axios from 'axios';

const sidebarOptions = [
  { key: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-gauge', path: '/admin-dashboard' },
  { key: 'users', label: 'Users Management', icon: 'fa-solid fa-users', path: '/admin-dashboard/users' },
  { key: 'invoices', label: 'Invoice Management', icon: 'fa-solid fa-file-invoice', path: '/admin-dashboard/invoices' },
];

export default function AdminDashboard({ adminName = 'Admin1', adminCode = 'AD001' }) {
  const location = useLocation();
  const active = sidebarOptions.find(opt => location.pathname.startsWith(opt.path))?.key || 'dashboard';

  const [stats, setStats] = useState({
    totalSales: 0,
    totalInvoices: 0,
    // totalUsers: 0,
    totalManagers: 0,
    totalShopOwners: 0,
    topShop: '',
    topManager: '',
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const [invoiceRes, shopRes, managerRes] = await Promise.all([
          axios.get('/api/invoices', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
          axios.get('/api/admin/shopowners'),
          axios.get('/api/admin/managers'),
          // axios.get('/api/admin/users'),
        ]);
        const invoices = invoiceRes.data;
        const shopOwners = shopRes.data;
        const managers = managerRes.data;
        // const users = userRes.data;
        let totalSales = 0;
        let shopSales = {};
        let managerInvoices = {};
        invoices.forEach(inv => {
          const price = parseFloat(inv.device_price) || 0;
          totalSales += price;
          if (inv.shop_code) shopSales[inv.shop_code] = (shopSales[inv.shop_code] || 0) + price;
          if (inv.created_by) managerInvoices[inv.created_by] = (managerInvoices[inv.created_by] || 0) + 1;
        });
        // Find top shop and top manager
        let topShop = '';
        let topShopSales = 0;
        for (const code in shopSales) {
          if (shopSales[code] > topShopSales) {
            topShopSales = shopSales[code];
            topShop = code;
          }
        }
        let topManager = '';
        let topManagerCount = 0;
        for (const mgr in managerInvoices) {
          if (managerInvoices[mgr] > topManagerCount) {
            topManagerCount = managerInvoices[mgr];
            topManager = mgr;
          }
        }
        setStats({
          totalSales,
          totalInvoices: invoices.length,
          // totalUsers: users.length,
          totalManagers: managers.length,
          totalShopOwners: shopOwners.length,
          topShop,
          topManager,
        });
      } catch {
        setStats({
          totalSales: 0,
          totalInvoices: 0,
          // totalUsers: 0,
          totalManagers: 0,
          totalShopOwners: 0,
          topShop: '',
          topManager: '',
        });
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

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
                  <div className="card-icon card-blue"><i className="fa-solid fa-indian-rupee-sign"></i></div>
                  <div className="card-label">Total Sales</div>
                  <div className="card-value">₹{loadingStats ? '...' : stats.totalSales}</div>
                </div>
                <div className="dashboard-card">
                  <div className="card-icon card-yellow"><i className="fa-solid fa-file-invoice"></i></div>
                  <div className="card-label">Total Invoices</div>
                  <div className="card-value">{loadingStats ? '...' : stats.totalInvoices}</div>
                </div>
                <div className="dashboard-card">
                  <div className="card-icon card-purple"><i className="fa-solid fa-user-tie"></i></div>
                  <div className="card-label">Total Managers</div>
                  <div className="card-value">{loadingStats ? '...' : stats.totalManagers}</div>
                </div>
                <div className="dashboard-card">
                  <div className="card-icon card-orange"><i className="fa-solid fa-store"></i></div>
                  <div className="card-label">Total Shop Owners</div>
                  <div className="card-value">{loadingStats ? '...' : stats.totalShopOwners}</div>
                </div>
                <div className="dashboard-card">
                  <div className="card-icon card-pink"><i className="fa-solid fa-trophy"></i></div>
                  <div className="card-label">Top Shop (Sales)</div>
                  <div className="card-value">{loadingStats ? '...' : stats.topShop || '-'}</div>
                </div>
                <div className="dashboard-card">
                  <div className="card-icon card-brown"><i className="fa-solid fa-user-tie"></i></div>
                  <div className="card-label">Top Manager (Invoices)</div>
                  <div className="card-value">{loadingStats ? '...' : stats.topManager || '-'}</div>
                </div>
              </div>
              {/* You can add more analytics or charts here if needed */}
            </>
          } />
          <Route path="users" element={<UserManagement />} />
          <Route path="invoices" element={<InvoiceManagement />} />
          <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
