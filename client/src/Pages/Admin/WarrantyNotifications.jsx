import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, User, Store } from 'lucide-react';
import axios from 'axios';
import InvoiceDetailsModal from '../../components/InvoiceDetailsModal';

export default function WarrantyNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_count: 0, shops_affected: 0 });
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleInvoiceClick = async (invoiceId, shopCode) => {
    try {
      const response = await axios.get(`/api/invoices/getByInvoiceId/${invoiceId}/${shopCode}`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      setSelectedInvoice(response.data);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/warranty/admin/notifications', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      setNotifications(response.data.all_notifications);
      setStats({
        total_count: response.data.total_count,
        shops_affected: response.data.shops_affected
      });
    } catch (error) {
      console.error('Error fetching warranty notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-poppins">Warranty Notifications</h2>
          <p className="text-sm text-gray-600">Devices with warranty expiring in the next 30 days</p>
        </div>
        
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 font-poppins">All Notifications</h3>
              <p className="text-sm text-gray-500 mt-1">List of all devices with warranty expiring soon</p>
            </div>
          </div>
        </div>
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
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <button
                            onClick={() => handleInvoiceClick(notification.invoice_id, notification.shop_code)}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            Invoice #{notification.invoice_id}
                          </button>
                          <div className="flex items-center">
                            <Store className="w-4 h-4 mr-1" />
                            <span className="font-medium text-blue-600">{notification.shop_name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
                          Expires {new Date(notification.end_date).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {notification.days_remaining} days remaining
                        </span>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {selectedInvoice && (
        <InvoiceDetailsModal 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}
    </div>
  );
}