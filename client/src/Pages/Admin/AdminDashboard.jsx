import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import InvoiceManagement from './InvoiceManagement';
import axios from 'axios';
import { BarChart3, Users, FileText, Store, User, Trophy, TrendingUp, ArrowUpRight, Shield, DollarSign, Smartphone } from 'lucide-react';
const sidebarOptions = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/admin-dashboard' },
  { key: 'users', label: 'Users Management', icon: Users, path: '/admin-dashboard/users' },
  { key: 'invoices', label: 'Invoice Management', icon: FileText, path: '/admin-dashboard/invoices' },
];

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

export default function AdminDashboard() {
  const location = useLocation();
  const [adminDetails, setAdminDetails] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('lifetime');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalInvoices: 0,
    salesChange: 0,
    invoicesChange: 0,
    totalManagers: 0,
    totalShopOwners: 0,
    topShop: '',
    topManager: '',
    topSellingModel: '',
    avgMonthlySales: 0,
    avgMonthlyInvoices: 0,
    firstSaleDate: null
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  const [currentView, setCurrentView] = useState('dashboard');

  const statCards = [
    {
      label: 'Total Sales',
      value: loadingStats ? '...' : `₹${stats.totalSales.toLocaleString()}`,
      icon: DollarSign,
      color: 'blue',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: stats.salesChange ? (stats.salesChange > 0 ? `+${stats.salesChange}%` : `${stats.salesChange}%`) : '-',
      trendUp: stats.salesChange > 0
    },
    {
      label: 'Total Invoices',
      value: loadingStats ? '...' : stats.totalInvoices.toLocaleString(),
      icon: FileText,
      color: 'green',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      trend: stats.invoicesChange ? (stats.invoicesChange > 0 ? `+${stats.invoicesChange}%` : `${stats.invoicesChange}%`) : '-',
      trendUp: stats.invoicesChange > 0
    },
    {
      label: 'Total Managers',
      value: loadingStats ? '...' : stats.totalManagers,
      icon: User,
      color: 'purple',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      trend: '+2',
      trendUp: true
    },
    {
      label: 'Total Shop Owners',
      value: loadingStats ? '...' : stats.totalShopOwners,
      icon: Store,
      color: 'orange',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      trend: '+5',
      trendUp: true
    },
    {
      label: 'Top Shop (Sales)',
      value: loadingStats ? '...' : stats.topShop || '-',
      icon: Trophy,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      trend: 'Leading',
      trendUp: true
    },
    {
      label: 'Top Selling Model',
      value: loadingStats ? '...' : stats.topSellingModel || '-',
      icon: Smartphone,
      color: 'teal',
      bgColor: 'bg-teal-100',
      iconColor: 'text-teal-600',
      trend: 'Most Popular',
      trendUp: true
    }
  ];

  const fetchRecentActivities = async () => {
    setLoadingActivities(true);
    try {
      const response = await axios.get('/api/invoices/recent', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      setRecentActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      setRecentActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchRecentActivities();
    }
  }, [currentView]);

  useEffect(() => {
    // Fetch admin details
    const fetchAdminDetails = async () => {
      try {
        const response = await axios.get('/api/admin/details', {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        setAdminDetails(response.data);
      } catch (error) {
        console.error('Failed to fetch admin details:', error);
      }
    };

    fetchAdminDetails();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const response = await axios.get(`/api/stats/admin/${selectedDuration}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        
        if (selectedDuration === 'lifetime') {
          setStats({
            totalSales: response.data.lifetime.totalSales,
            totalInvoices: response.data.lifetime.totalInvoices,
            avgMonthlySales: response.data.lifetime.avgMonthlySales,
            avgMonthlyInvoices: response.data.lifetime.avgMonthlyInvoices,
            firstSaleDate: response.data.lifetime.firstSaleDate,
            totalManagers: response.data.totalManagers,
            totalShopOwners: response.data.totalShopOwners,
            topShop: response.data.topShop,
            topManager: response.data.topManager,
            topSellingModel: response.data.topSellingModel,
            salesChange: 0,
            invoicesChange: 0
          });
        } else {
          const period = selectedDuration === 'monthly' ? 'Month' : 'Year';
          setStats({
            totalSales: response.data[`current${period}`].totalSales,
            totalInvoices: response.data[`current${period}`].totalInvoices,
            salesChange: response.data.percentageChanges.salesChange,
            invoicesChange: response.data.percentageChanges.invoicesChange,
            totalManagers: response.data.totalManagers,
            totalShopOwners: response.data.totalShopOwners,
            topShop: response.data.topShop,
            topManager: response.data.topManager,
            topSellingModel: response.data.topSellingModel,
            avgMonthlySales: 0,
            avgMonthlyInvoices: 0,
            firstSaleDate: null
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats({
          totalSales: 0,
          totalInvoices: 0,
          salesChange: 0,
          invoicesChange: 0,
          totalManagers: 0,
          totalShopOwners: 0,
          topShop: '',
          topManager: '',
          topSellingModel: '',
          avgMonthlySales: 0,
          avgMonthlyInvoices: 0,
          firstSaleDate: null
        });
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [selectedDuration]);

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
        
        .font-inter { font-family: 'Inter', sans-serif; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', sans-serif;
        }
        
        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-72 bg-white shadow-sm border-r border-gray-200 flex-shrink-0 flex flex-col custom-scrollbar">
          {/* Admin Info Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 font-poppins text-sm leading-tight truncate max-w-[180px]">
                  {adminDetails ? adminDetails.admin_name : 'Loading...'}
                </h3>
                <p className="text-xs text-blue-600 font-medium truncate max-w-[180px]">{adminDetails ? adminDetails.admin_code : 'Loading...'}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">System Administrator</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="p-4">
            <div className="space-y-2">
              {sidebarOptions.map(option => {
                const Icon = option.icon;
                const isActive = currentView === option.key;
                return (
                  <button
                    key={option.key}
                    onClick={() => setCurrentView(option.key)}
                    className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 mr-2.5" />
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
          
          {/* Logout Button */}
          <div className="mt-auto p-4 border-t border-gray-200">
            <button
              onClick={() => {
                sessionStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {currentView === 'dashboard' ? (
            <div className="space-y-6">
              {/* Page Header with Duration Toggle */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 font-poppins">Dashboard Overview</h2>
                <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                  {['monthly', 'yearly', 'lifetime'].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setSelectedDuration(duration)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedDuration === duration
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {duration.charAt(0).toUpperCase() + duration.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
                          {loadingStats ? (
                            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                          ) : (
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                          )}
                        </div>
                        <div className={`p-3 ${card.bgColor} rounded-lg`}>
                          <Icon className={`w-6 h-6 ${card.iconColor}`} />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        {loadingStats ? (
                          <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                        ) : (
                          <>
                            <span className={`text-xs ${card.trendUp ? 'text-green-600' : 'text-red-600'} font-medium`}>
                              {card.trend}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">vs last month</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Activity Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 font-poppins">Recent Activity</h3>
                  <button 
                    onClick={() => setCurrentView('invoices')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All Invoices
                  </button>
                </div>
                <div className="space-y-3">
                  {loadingActivities ? (
                    // Loading skeleton
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg animate-pulse">
                        <div className="p-2 bg-gray-200 rounded-full mr-3 w-8 h-8"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))
                  ) : recentActivities.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No recent activities
                    </div>
                  ) : (
                    recentActivities.map(activity => (
                      <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-full mr-3">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              New invoice from {activity.shop_name || 'Unknown Shop'}
                            </p>
                            <span className="text-xs text-gray-500 ml-2">
                              ₹{parseFloat(activity.device_price).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            #{activity.invoice_id} • {formatTimeAgo(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : currentView === 'users' ? (
            <UserManagement />
          ) : (
            <InvoiceManagement />
          )}
        </main>
      </div>
    </div>
  );
}
