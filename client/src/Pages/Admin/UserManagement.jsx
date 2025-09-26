
import React, { useState, useEffect } from 'react';
import Signup from '../AuthPages/Signup';
import { RefreshCw, UserPlus, Users } from 'lucide-react';

const UserManagement = () => {
  const [tab, setTab] = useState('shopowners');
  const [shopOwners, setShopOwners] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSignup, setShowSignup] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    if (tab === 'shopowners') {
      fetch('/api/admin/shopowners')
        .then(res => res.json())
        .then(data => setShopOwners(data))
        .finally(() => setLoading(false));
    } else {
      fetch('/api/admin/managers')
        .then(res => res.json())
        .then(data => setManagers(data))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [tab]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-poppins">Users Management</h2>
              <p className="text-sm text-gray-500 mt-1">Manage shop owners and manager accounts</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowSignup(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors duration-150"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create User
              </button>
            </div>
          </div>
          <div className="relative mt-4">
            <input
              type="text"
              placeholder={tab === 'shopowners' ? "Search shop owners by name, email, shop name..." : "Search managers by name, email, ID..."}
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
        <div className="px-6 py-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setTab('shopowners')}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                tab === 'shopowners'
                  ? 'text-blue-700 bg-blue-50 border-2 border-blue-200'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 border-2 border-transparent'
              }`}
            >
              <Users className={`w-4 h-4 mr-2 ${tab === 'shopowners' ? 'text-blue-600' : 'text-gray-400'}`} />
              Shop Owners
            </button>
            <button
              onClick={() => setTab('managers')}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                tab === 'managers'
                  ? 'text-blue-700 bg-blue-50 border-2 border-blue-200'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 border-2 border-transparent'
              }`}
            >
              <Users className={`w-4 h-4 mr-2 ${tab === 'managers' ? 'text-blue-600' : 'text-gray-400'}`} />
              Managers
            </button>
          </div>
        </div>
      </div>
      {showSignup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
              <button
                onClick={() => setShowSignup(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-150"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <Signup />
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {tab === 'shopowners' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Shop Owner Id</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Name</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Email</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Phone</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Shop Name</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Address</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shopOwners.filter(owner => 
                    searchTerm === '' ||
                    owner.shop_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    owner.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    owner.contact_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    owner.shop_address?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((owner, idx) => (
                    <tr key={owner.shop_code || idx} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3 text-sm text-gray-900">{owner.shop_code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{owner.shop_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{owner.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{owner.contact_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{owner.shop_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{owner.shop_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'managers' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Manager Id</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Name</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Email</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Phone</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {managers.filter(manager => 
                    searchTerm === '' ||
                    manager.manager_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    manager.manager_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    manager.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    manager.contact_number?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((manager, idx) => (
                    <tr key={manager.manager_code || idx} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3 text-sm text-gray-900">{manager.manager_code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{manager.manager_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{manager.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{manager.contact_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(UserManagement);
