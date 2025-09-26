import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';
import InvoiceDetailsModal from '../../components/InvoiceDetailsModal';

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/invoices', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setInvoices(res.data);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-poppins">Invoice Management</h2>
              <p className="text-sm text-gray-500 mt-1">Complete list of all transactions</p>
            </div>
            <button
              onClick={fetchInvoices}
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
              placeholder="Search invoices by ID, customer name, shop, model..."
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Contact</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Shop Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Shop Code</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Device Model</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.filter(inv => 
                  searchTerm === '' ||
                  inv.invoice_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  inv.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  inv.shop_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  inv.device_model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  inv.customer_contact_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (inv.device_price?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase())
                ).map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-3 text-sm text-blue-600">
                      <a href="#" className="hover:underline" onClick={e => { e.preventDefault(); setSelectedInvoice(inv); }}>
                        {inv.invoice_id}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{inv.date ? inv.date.slice(0,10) : ''}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{inv.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{inv.customer_contact_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{inv.shop_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{inv.shop_code}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{inv.device_model_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{inv.device_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {selectedInvoice && <InvoiceDetailsModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
    </div>
  );
      
}
