import React, { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import WarrantyDetailsModal from '../../components/WarrantyDetailsModal';

export default function ShopWarrantyManagement() {
  const { userInfo } = useAuth();
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarranty, setSelectedWarranty] = useState(null);

  const fetchWarranties = async () => {
    console.log('Fetching warranties for shop owner:', userInfo?.email);
    setLoading(true);
    try {
      const res = await axios.get('/api/warranty/shop/warranties', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      setWarranties(res.data.warranties || []);
    } catch (error) {
      console.error('Error fetching warranties:', error);
      setWarranties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('User info changed:', userInfo);
    if (userInfo?.email) {
      fetchWarranties();
    }
  }, [userInfo?.email]);

  const handleViewWarranty = (warranty) => {
    setSelectedWarranty(warranty);
  };

  const formatStatus = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-poppins">Shop Warranties</h2>
              <p className="text-sm text-gray-500 mt-1">View warranty information for your shop</p>
            </div>
            <button
              onClick={fetchWarranties}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <div className="relative mt-4">
            <input
              type="text"
              placeholder="Search warranties by device model or IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-150"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Device Model</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">IMEI</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {warranties.filter(warranty => 
                    searchTerm === '' ||
                    warranty.device_model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    warranty.imei_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    warranty.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(warranty => (
                    <tr key={warranty.id || warranty.warranty_id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3 text-sm text-gray-900">{warranty.device_model_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{warranty.imei_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{warranty.customer_name}</td>
                      <td className="px-4 py-3">
                        {formatStatus(warranty.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {warranty.start_date ? new Date(warranty.start_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {warranty.end_date ? new Date(warranty.end_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <button
                          onClick={() => handleViewWarranty(warranty)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {warranties.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-3 text-sm text-gray-500 text-center">
                        No warranties found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Warranty Details Modal */}
      {selectedWarranty && (
        <WarrantyDetailsModal 
          warranty={selectedWarranty} 
          onClose={() => setSelectedWarranty(null)} 
        />
      )}
    </div>
  );
}