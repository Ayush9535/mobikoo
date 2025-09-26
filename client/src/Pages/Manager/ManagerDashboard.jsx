import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ManagerInvoiceManagement from './InvoiceManagement';
import BulkUploadPage from './BulkUploadPage';
import { Plus, FileText, Upload, User, Phone, Smartphone, CreditCard, Calendar, Hash, Package, Users } from 'lucide-react';

const ManagerDashboard = () => {
  const [managerDetails, setManagerDetails] = useState(null);
  const [shopOwners, setShopOwners] = useState([]);
  const [form, setForm] = useState({
    invoice_id: '',
    date: '',
    customer_name: '',
    customer_contact_number: '',
    customer_alt_contact_number: '',
    device_model_name: '',
    imei_number: '',
    device_price: '',
    payment_mode: '',
    amount: '',
    shop_code: '',
    created_at: '',
  });
  const [sidebarTab, setSidebarTab] = useState('add');
    const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch manager details
    axios.get('/api/manager/details', {headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }})
      .then(res => setManagerDetails(res.data))
      .catch(err => console.error('Failed to fetch manager details:', err));

    // Fetch all shop owners for dropdown
    axios.get('/api/admin/shopowners')
      .then(res => setShopOwners(res.data))
      .catch(() => setShopOwners([]));
  }, []);

  // No need for filteredShopOwners or shopInput

  const handleChange = e => {
    const { name, value } = e.target;
    
    // Validation rules
    switch (name) {
      case 'customer_name':
        // Only allow letters, spaces, and some special characters for names
        if (/^[A-Za-z\s\-'.]*$/.test(value)) {
          setForm(prev => ({ ...prev, [name]: value }));
        }
        break;
        
      case 'customer_contact_number':
      case 'customer_alt_contact_number':
        // Only allow numbers and limit to 10 digits
        const numberValue = value.replace(/\D/g, '').slice(0, 10);
        setForm(prev => ({ ...prev, [name]: numberValue }));
        break;
        
      case 'imei_number':
        // Only allow numbers for IMEI
        if (/^\d*$/.test(value)) {
          setForm(prev => ({ ...prev, [name]: value }));
        }
        break;
        
      case 'device_price':
        // Only allow positive numbers and decimals
        if (/^\d*\.?\d*$/.test(value)) {
          setForm(prev => ({ ...prev, [name]: value }));
        }
        break;
        
      default:
        setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Remove handleShopSelect

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    // Submit invoice form
    try {
      await axios.post('/api/invoices', form, {headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }});
      alert('Invoice created successfully!');
      setForm({
        invoice_id: '',
        date: '',
        customer_name: '',
        customer_contact_number: '',
        customer_alt_contact_number: '',
        device_model_name: '',
        imei_number: '',
        device_price: '',
        payment_mode: '',
        amount: '',
        shop_code: '',
        created_at: '',
      });
    } catch (err) {
      alert('Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = [
    { name: 'invoice_id', label: 'Invoice ID', type: 'text', required: true, icon: Hash, placeholder: 'Enter invoice ID' },
    { name: 'date', label: 'Date', type: 'date', required: true, icon: Calendar },
    { 
      name: 'customer_name', 
      label: 'Customer Name', 
      type: 'text', 
      required: true, 
      icon: User, 
      placeholder: 'Enter customer name',
      pattern: '[A-Za-z\\s\\-\\.\']+',
      title: 'Name should only contain letters, spaces, and characters like - . \''
    },
    { 
      name: 'customer_contact_number', 
      label: 'Customer Contact Number', 
      type: 'tel', 
      required: true, 
      icon: Phone, 
      placeholder: 'Enter 10-digit contact number',
      pattern: '[0-9]{10}',
      title: 'Please enter a valid 10-digit phone number',
      inputMode: 'numeric'
    },
    { 
      name: 'customer_alt_contact_number', 
      label: 'Alternative Contact Number', 
      type: 'tel', 
      required: false, 
      icon: Phone, 
      placeholder: 'Enter 10-digit alternative contact (optional)',
      pattern: '[0-9]{10}',
      title: 'Please enter a valid 10-digit phone number',
      inputMode: 'numeric'
    },
    { 
      name: 'device_model_name', 
      label: 'Device Model Name', 
      type: 'text', 
      required: true, 
      icon: Smartphone, 
      placeholder: 'Enter device model'
    },
    { 
      name: 'imei_number', 
      label: 'IMEI Number', 
      type: 'text', 
      required: true, 
      icon: Package, 
      placeholder: 'Enter IMEI number',
      pattern: '[0-9]+',
      title: 'IMEI should only contain numbers',
      inputMode: 'numeric'
    },
    { 
      name: 'device_price', 
      label: 'Device Price', 
      type: 'number', 
      required: true, 
      icon: CreditCard, 
      placeholder: 'Enter price',
      min: "0",
      step: "0.01",
      inputMode: 'decimal'
    },
  ];

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
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
        
        /* Custom scrollbar for sidebar */
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
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 h-full custom-scrollbar flex flex-col flex-shrink-0">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 font-poppins text-sm">
                  {managerDetails ? managerDetails.manager_name : 'Loading...'}
                </h3>
                <p className="text-xs text-blue-600 font-medium">
                  {managerDetails ? managerDetails.manager_code : ''}
                </p>
                <p className="text-xs text-gray-500">
                  {managerDetails ? managerDetails.email : ''}
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setSidebarTab('add')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  sidebarTab === 'add'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <Plus className="w-4 h-4 mr-3" />
                Add Invoice
              </button>
              
              <button
                onClick={() => setSidebarTab('manage')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  sidebarTab === 'manage'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <FileText className="w-4 h-4 mr-3" />
                Invoice Management
              </button>
              
              <button
                onClick={() => setSidebarTab('bulk')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  sidebarTab === 'bulk'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <Upload className="w-4 h-4 mr-3" />
                Bulk Upload
              </button>
            </div>
          </nav>
          
          {/* Logout Button */}
          <div className="mt-auto p-4 border-t border-gray-200">
            <button
              onClick={() => {
                localStorage.removeItem('token');
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
        <main className="flex-1 p-6 overflow-y-auto h-screen">
          {sidebarTab === 'add' ? (
            <div className="max-w-4xl mx-auto">
              {/* Page Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 font-poppins">Add New Invoice</h2>
              </div>

              {/* Invoice Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 font-poppins">Invoice Details</h3>
                  <p className="text-sm text-gray-500 mt-1">Fill in the information below to create a new invoice</p>
                </div>
                
                <div onSubmit={handleSubmit} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formFields.map(field => {
                      const Icon = field.icon;
                      return (
                        <div key={field.name} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Icon className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type={field.type}
                              name={field.name}
                              value={form[field.name]}
                              onChange={handleChange}
                              required={field.required}
                              placeholder={field.placeholder}
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                            />
                          </div>
                        </div>
                      );
                    })}

                    {/* Payment Mode */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Payment Mode <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                        </div>
                        <select
                          name="payment_mode"
                          value={form.payment_mode}
                          onChange={handleChange}
                          required
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        >
                          <option value="">Select Payment Mode</option>
                          <option value="CASH">Cash</option>
                          <option value="UPI">UPI</option>
                          <option value="CARD">Card</option>
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                        </select>
                      </div>
                    </div>

                    {/* Shop Code */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Shop Owner <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Users className="w-4 h-4 text-gray-400" />
                        </div>
                        <select
                          name="shop_code"
                          value={form.shop_code}
                          onChange={handleChange}
                          required
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        >
                          <option value="">Select Shop Owner</option>
                          {shopOwners.map(owner => (
                            <option key={owner.shop_code} value={owner.shop_code}>
                              {owner.shop_code} - {owner.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Are you sure you want to reset the form?')) {
                          setForm({
                            invoice_id: '',
                            date: '',
                            customer_name: '',
                            customer_contact_number: '',
                            customer_alt_contact_number: '',
                            device_model_name: '',
                            imei_number: '',
                            device_price: '',
                            payment_mode: '',
                            amount: '',
                            shop_code: '',
                            created_at: '',
                          });
                        }
                      }}
                      className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Reset Form
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Invoice
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : sidebarTab === 'bulk' ? (
            <BulkUploadPage />
          ) : (
            <ManagerInvoiceManagement />
          )}
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
