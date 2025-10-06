import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, Store, FileText, TrendingUp, RefreshCw, Receipt, Smartphone, Bell, AlertTriangle, User } from 'lucide-react';
import ShopWarrantyManagement from './ShopWarrantyManagement';
import InvoiceDetailsModal from '../../components/InvoiceDetailsModal';
import AnalyticsGraphs from '../../components/AnalyticsGraphs';

const NotificationsPage = ({ notifications, onInvoiceClick }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900 font-poppins">Warranty Notifications</h2>
      <p className="text-sm text-gray-600">Devices with warranty expiring in the next 30 days</p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <Bell className="w-12 h-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Notifications</h3>
            <p>There are no devices with warranty expiring soon.</p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {notification.device_model_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Invoice #
                        <a
                          href="#"
                          className="text-blue-600 hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            onInvoiceClick(notification);
                          }}
                        >
                          {notification.invoice_id}
                        </a>
                      </p>
                    </div>
                    <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
                      Expires {new Date(notification.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    {notification.customer_name}
                  </div>
                  
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

const InvoiceTable = ({ invoices, onInvoiceClick, isRecent = false }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr className="bg-gray-50 text-left">
          <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
          <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
          <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Contact</th>
          <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Device Model</th>
          <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {(isRecent ? invoices.slice(0, 7) : invoices).map(inv => (
          <tr key={inv.id} className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-4 py-3 text-sm text-blue-600">
              <a href="#" className="hover:underline" onClick={e => { e.preventDefault(); onInvoiceClick(inv); }}>
                {inv.invoice_id}
              </a>
            </td>
            <td className="px-4 py-3 text-sm text-gray-900">{inv.date ? inv.date.slice(0,10) : ''}</td>
            <td className="px-4 py-3 text-sm text-gray-900">{inv.customer_name}</td>
            <td className="px-4 py-3 text-sm text-gray-900">{inv.customer_contact_number}</td>
            <td className="px-4 py-3 text-sm text-gray-900">{inv.device_model_name}</td>
            <td className="px-4 py-3 text-sm text-gray-900">{inv.device_price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function ShopOwnerDashboard() {
  const { userInfo } = useAuth();
  const [loadingStats, setLoadingStats] = useState(true);
  const [shopDetails, setShopDetails] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState('monthly');
    const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Click outside handler for notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalInvoices: 0,
    salesChange: 0,
    invoicesChange: 0,
    topSellingModel: '',
    avgMonthlySales: 0,
    avgMonthlyInvoices: 0,
    firstSaleDate: null
  });

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const response = await axios.get('/api/shopowner/details', {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        setShopDetails(response.data);
      } catch (error) {
        console.error('Failed to fetch shop details:', error);
      }
    };
    
    fetchShopDetails();
  }, []);

  const fetchRecentInvoices = async () => {
    if (!shopDetails) return;
    setLoadingRecent(true);
    try {
      const res = await axios.get(`/api/invoices?shop_code=${shopDetails.shop_code}&sort=date:desc`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      setRecentInvoices(res.data);
    } catch {
      setRecentInvoices([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  const fetchStats = async () => {
    if (!shopDetails) return;
    setLoadingStats(true);
    try {
      const res = await axios.get(`/api/stats/shopowner/${selectedDuration}`, {
        params: { shop_code: shopDetails.shop_code },
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });

      if (selectedDuration === 'lifetime') {
        // Handle lifetime stats
        setStats({
          totalSales: res.data.lifetime.totalSales,
          totalInvoices: res.data.lifetime.totalInvoices,
          avgMonthlySales: res.data.lifetime.avgMonthlySales,
          avgMonthlyInvoices: res.data.lifetime.avgMonthlyInvoices,
          firstSaleDate: res.data.lifetime.firstSaleDate,
          topSellingModel: res.data.topSellingModel,
          salesChange: 0,
          invoicesChange: 0
        });
      } else {
        // Handle monthly/yearly stats
        const period = selectedDuration === 'monthly' ? 'Month' : 'Year';
        setStats({
          totalSales: res.data[`current${period}`].totalSales,
          totalInvoices: res.data[`current${period}`].totalInvoices,
          salesChange: res.data.percentageChanges.salesChange,
          invoicesChange: res.data.percentageChanges.invoicesChange,
          topSellingModel: res.data.topSellingModel,
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
        topSellingModel: '',
        avgMonthlySales: 0,
        avgMonthlyInvoices: 0,
        firstSaleDate: null
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAllInvoices = async () => {
    if (!shopDetails) return;
    setLoadingAll(true);
    try {
      const res = await axios.get(`/api/invoices?shop_code=${shopDetails.shop_code}`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      setAllInvoices(res.data);
    } catch {
      setAllInvoices([]);
    } finally {
      setLoadingAll(false);
    }
  };

  const fetchWarrantyNotifications = async () => {
    if (!shopDetails) return;
    try {
      const response = await axios.get('/api/warranty/notifications', {
        params: { shop_code: shopDetails.shop_code },
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      setNotifications(response.data.notifications);
      setNotificationCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch warranty notifications:', error);
      setNotifications([]);
      setNotificationCount(0);
    }
  };

  useEffect(() => {
    if (!shopDetails) return;
    
    if (sidebarTab === 'dashboard') {
      fetchRecentInvoices();
      fetchStats();
    }
    fetchAllInvoices();
    fetchWarrantyNotifications();
    
    // Set up polling for notifications every 5 minutes
    const notificationInterval = setInterval(fetchWarrantyNotifications, 300000);
    return () => clearInterval(notificationInterval);
    // eslint-disable-next-line
  }, [sidebarTab, shopDetails, selectedDuration]);

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
      `}</style>
            
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex-shrink-0 flex flex-col">
          {/* Shop Info Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Store className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 font-poppins text-sm leading-tight">
                    {shopDetails?.shop_name || 'Loading...'}
                  </h3>
                  <p className="text-xs text-blue-600 font-medium">{shopDetails?.shop_code || 'Loading...'}</p>
                </div>
              </div>
              
              
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{shopDetails?.shop_address || 'Loading...'}</p>
          </div>
          
          {/* Navigation */}
          <nav className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setSidebarTab('dashboard')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  sidebarTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                Dashboard
              </button>
              
              <button
                onClick={() => setSidebarTab('invoices')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  sidebarTab === 'invoices'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <FileText className="w-4 h-4 mr-3" />
                All Invoices
              </button>

              <button
                onClick={() => setSidebarTab('warranties')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  sidebarTab === 'warranties'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <Receipt className="w-4 h-4 mr-3" />
                Warranty Management
              </button>

              <button
                onClick={() => setSidebarTab('notifications')}
                className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  sidebarTab === 'notifications'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <div className='flex items-center justify-center'>
                  <Bell className="w-4 h-4 mr-3" />
                <span className="flex-1">Notifications</span>
                </div>
                {notificationCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                    {notificationCount}
                  </span>
                )}
              </button>
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
          {sidebarTab === 'dashboard' ? (
            <div className="space-y-6">
              {/* Page Header */}
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-poppins">Dashboard</h2>
                    <p className="text-gray-600 mt-1">Overview of your shop's performance</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                    {[
                      { id: 'monthly', label: 'This Month' },
                      { id: 'yearly', label: 'This Year' },
                      { id: 'lifetime', label: 'All Time' }
                    ].map(duration => (
                      <button
                        key={duration.id}
                        onClick={() => setSelectedDuration(duration.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          selectedDuration === duration.id
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {duration.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Total Sales {selectedDuration === 'lifetime' ? '' : selectedDuration === 'yearly' ? '(This Year)' : '(This Month)'}
                      </p>
                      {loadingStats ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-32 rounded mt-1"></div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">₹{stats.totalSales.toLocaleString()}</p>
                      )}
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    {loadingStats ? (
                      <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                    ) : selectedDuration === 'lifetime' ? (
                      <>
                        <span className="text-xs font-medium text-green-600">
                          Avg ₹{stats.avgMonthlySales.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">per month</span>
                      </>
                    ) : stats.salesChange !== 0 && (
                      <>
                        <span className={`text-xs font-medium ${stats.salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.salesChange >= 0 ? '↑' : '↓'} {Math.abs(stats.salesChange)}%
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          vs last {selectedDuration === 'yearly' ? 'year' : 'month'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Total Invoices {selectedDuration === 'lifetime' ? '' : selectedDuration === 'yearly' ? '(This Year)' : '(This Month)'}
                      </p>
                      {loadingStats ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-24 rounded mt-1"></div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
                      )}
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Receipt className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    {loadingStats ? (
                      <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                    ) : selectedDuration === 'lifetime' ? (
                      <>
                        <span className="text-xs font-medium text-blue-600">
                          Avg {stats.avgMonthlyInvoices}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">per month</span>
                      </>
                    ) : stats.invoicesChange !== 0 && (
                      <>
                        <span className={`text-xs font-medium ${stats.invoicesChange >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {stats.invoicesChange >= 0 ? '↑' : '↓'} {Math.abs(stats.invoicesChange)}%
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          vs last {selectedDuration === 'yearly' ? 'year' : 'month'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Top Selling Model {selectedDuration === 'lifetime' ? '(All Time)' : selectedDuration === 'yearly' ? '(This Year)' : '(This Month)'}
                      </p>
                      {loadingStats ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-40 rounded mt-1"></div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">{stats.topSellingModel || '-'}</p>
                      )}
                    </div>
                    <div className="p-3 bg-teal-100 rounded-lg">
                      <Smartphone className="w-6 h-6 text-teal-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    {loadingStats ? (
                      <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                    ) : (
                      <>
                        <span className="text-xs font-medium text-teal-600">Most Popular</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {selectedDuration === 'lifetime' ? 'model' : selectedDuration === 'yearly' ? 'this year' : 'this month'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Notification Card */}
              {notificationCount > 0 && (
                <div className="bg-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 font-poppins">
                            Warranty Notifications
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            You have <span className="font-medium text-red-600">{notificationCount}</span> devices with warranty expiring soon
                          </p>
                        </div>
                        <button
                          onClick={() => setSidebarTab('notifications')}
                          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                        >
                          View All
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      
                    </div>
                  </div>
                </div>
              )}

              <AnalyticsGraphs userRole={'shopowner'} duration={selectedDuration}/>

              {/* Recent Invoices Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 font-poppins">Recent Invoices</h3>
                      <p className="text-sm text-gray-500 mt-1">Latest transactions from your shop</p>
                    </div>
                    <button
                      onClick={fetchRecentInvoices}
                      disabled={loadingRecent}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loadingRecent ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {loadingRecent ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading...</span>
                    </div>
                  ) : (
                    <InvoiceTable invoices={recentInvoices} onInvoiceClick={setSelectedInvoice} isRecent={true} />
                  )}
                </div>
              </div>
            </div>
          ) : sidebarTab === 'warranties' ? (
            <ShopWarrantyManagement />
          ) : sidebarTab === 'notifications' ? (
            <NotificationsPage 
              notifications={notifications}
              onInvoiceClick={setSelectedInvoice}
            />
          ) : (
            <div className="space-y-6">
              {/* All Invoices Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 font-poppins">All Invoices</h2>
                      <p className="text-sm text-gray-500 mt-1">Complete list of all transactions</p>
                    </div>
                    <button
                      onClick={fetchAllInvoices}
                      disabled={loadingAll}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loadingAll ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search invoices by ID, customer name, model..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-150"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {loadingAll ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading...</span>
                    </div>
                  ) : (
                    <InvoiceTable 
                      invoices={allInvoices.filter(invoice => 
                        searchTerm === '' ||
                        invoice.invoice_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        invoice.device_model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        invoice.customer_contact_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (invoice.device_price?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase())
                      )} 
                      onInvoiceClick={setSelectedInvoice} 
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Invoice Details Modal */}
          {selectedInvoice && (
            <InvoiceDetailsModal 
              invoice={selectedInvoice} 
              onClose={() => setSelectedInvoice(null)} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
