import React from 'react';
import { X } from 'lucide-react';

export default function WarrantyDetailsModal({ warranty, onClose }) {
  if (!warranty) return null;

  return (
    <div className="fixed inset-0 bg-[#0000006e] bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 font-poppins">
            Warranty Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Warranty Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Warranty ID</p>
                  <p className="text-sm font-medium text-gray-900">#{warranty.warranty_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    warranty.status === 'active' ? 'bg-green-100 text-green-800' :
                    warranty.status === 'expired' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {warranty.status ? warranty.status.charAt(0).toUpperCase() + warranty.status.slice(1) : 'Unknown'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {warranty.start_date ? new Date(warranty.start_date).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {warranty.end_date ? new Date(warranty.end_date).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Device Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Device Model</p>
                  <p className="text-sm font-medium text-gray-900">{warranty.device_model_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">IMEI Number</p>
                  <p className="text-sm font-medium text-gray-900">{warranty.imei_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purchase Price</p>
                  <p className="text-sm font-medium text-gray-900">
                    {warranty.device_price ? `₹${warranty.device_price.toLocaleString()}` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Shop Name</p>
                  <p className="text-sm font-medium text-gray-900">{warranty.shop_name}</p>
                </div>
              </div>
            </div>
          </div>

          {warranty.extended_warranty && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Extended Warranty Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Extension Period</p>
                  <p className="text-sm font-medium text-gray-900">{warranty.extension_period ? `${warranty.extension_period} months` : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Extension Cost</p>
                  <p className="text-sm font-medium text-gray-900">
                    {warranty.extension_cost ? `₹${warranty.extension_cost.toLocaleString()}` : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}