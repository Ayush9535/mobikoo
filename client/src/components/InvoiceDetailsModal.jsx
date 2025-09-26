import React from 'react';
import { X, Calendar, DollarSign, User, Phone, MapPin, Package, Hash, Clock, CheckCircle } from 'lucide-react';

const InvoiceDetailsModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  // Helper function to format field names
  const formatFieldName = (key) => {
    const fieldMappings = {
      'invoice_id': 'Invoice ID',
      'device_price': 'Amount',
      'device_name': 'Device/Product',
      'customer_name': 'Customer Name',
      'customer_phone': 'Phone Number',
      'customer_email': 'Email Address',
      'customer_address': 'Address',
      'shop_code': 'Shop Code',
      'shop_name': 'Shop Name',
      'created_at': 'Created Date',
      'updated_at': 'Last Updated',
      'payment_status': 'Payment Status',
      'payment_method': 'Payment Method',
      'invoice_status': 'Status',
      'tax_amount': 'Tax Amount',
      'discount': 'Discount',
      'total_amount': 'Total Amount'
    };
    
    return fieldMappings[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to get appropriate icon for field
  const getFieldIcon = (key) => {
    const iconMap = {
      'invoice_id': Hash,
      'device_price': DollarSign,
      'total_amount': DollarSign,
      'tax_amount': DollarSign,
      'discount': DollarSign,
      'customer_name': User,
      'customer_phone': Phone,
      'customer_address': MapPin,
      'device_name': Package,
      'created_at': Calendar,
      'updated_at': Clock,
      'payment_status': CheckCircle,
      'invoice_status': CheckCircle
    };
    
    return iconMap[key] || null;
  };

  // Helper function to format values
  const formatValue = (key, value) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Not specified</span>;
    }
    
    // Format currency fields
    if (['device_price', 'total_amount', 'tax_amount', 'discount'].includes(key)) {
      const numValue = parseFloat(value);
      return isNaN(numValue) ? value : `₹${numValue.toLocaleString()}`;
    }
    
    // Format dates
    if (['created_at', 'updated_at'].includes(key) && value) {
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return value;
      }
    }
    
    // Format status fields
    if (['payment_status', 'invoice_status'].includes(key)) {
      const status = String(value).toLowerCase();
      const statusConfig = {
        'paid': { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
        'completed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
        'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
        'cancelled': { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
        'draft': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' }
      };
      
      const config = statusConfig[status] || { bg: 'bg-blue-100', text: 'text-blue-700', label: value };
      
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      );
    }
    
    return String(value);
  };

  // Filter and organize fields
  const importantFields = ['invoice_id', 'device_name', 'device_price', 'total_amount', 'payment_status', 'invoice_status', 'date'];
  const customerFields = ['customer_name', 'customer_contact_number', 'customer_alt_contact_number'];
  const otherFields = Object.keys(invoice).filter(key => 
    !importantFields.includes(key) && 
    !customerFields.includes(key) &&
    !['id', 'date'].includes(key) // Exclude redundant fields
  );

  return (
    <div className="fixed inset-0 bg-[#0000006e] bg-opacity-50 flex items-center justify-center z-50 p-4">
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
      
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold font-poppins">Invoice Details</h3>
              <p className="text-blue-100 text-sm mt-1">
                {invoice.invoice_id ? `#${invoice.invoice_id}` : `#${invoice.id || 'N/A'}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors duration-150"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Important Information */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {importantFields.map(key => {
                if (!(key in invoice)) return null;
                const Icon = getFieldIcon(key);
                return (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      {Icon && <Icon className="w-4 h-4 text-gray-500 mr-2" />}
                      <span className="text-sm font-medium text-gray-500">
                        {formatFieldName(key)}
                      </span>
                    </div>
                    <div className="text-base font-semibold text-gray-900">
                      {key === 'date' ? formatValue(key, invoice[key].split('T')[0]) : formatValue(key, invoice[key])}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Information */}
          {customerFields.some(field => invoice[field]) && (
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 font-poppins mb-4">Customer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customerFields.map(key => {
                  if (!(key in invoice) || !invoice[key]) return null;
                  const Icon = getFieldIcon(key);
                  return (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        {Icon && <Icon className="w-4 h-4 text-gray-500 mr-2" />}
                        <span className="text-sm font-medium text-gray-500">
                          {formatFieldName(key)}
                        </span>
                      </div>
                      <div className="text-base font-semibold text-gray-900">
                        {formatValue(key, invoice[key])}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Details */}
          {otherFields.length > 0 && (
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 font-poppins mb-4">Additional Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0, 1].map((colIndex) => (
                  <div key={colIndex} className="overflow-x-auto">
                    <table className="w-full">
                      <tbody className="divide-y divide-gray-200">
                        {otherFields
                          .filter((_, index) => Math.floor(index / Math.ceil(otherFields.length / 2)) === colIndex)
                          .map(key => {
                            if (!(key in invoice)) return null;
                            const Icon = getFieldIcon(key);
                            return (
                              <tr key={key} className="hover:bg-blue-50 transition-colors duration-150">
                                <td className="py-3 pr-4 text-sm font-medium text-gray-500 w-1/3">
                                  <div className="flex items-center">
                                    {formatFieldName(key)}
                                  </div>
                                </td>
                                <td className="py-3 text-sm text-gray-900">
                                  {formatValue(key, invoice[key])}
                                </td>
                              </tr>
                            );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>        
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;