import React, { useEffect, useState } from 'react';
import './ManagerDashboard.css';
import axios from 'axios';
import ManagerInvoiceManagement from './InvoiceManagement';
import BulkInvoiceUpload from './BulkInvoiceUpload';
import BulkUploadPage from './BulkUploadPage';

const ManagerDashboard = () => {
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

  useEffect(() => {
    // Fetch all shop owners for dropdown
    axios.get('/api/admin/shopowners')
      .then(res => setShopOwners(res.data))
      .catch(() => setShopOwners([]));
  }, []);

  // No need for filteredShopOwners or shopInput

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Remove handleShopSelect

  const handleSubmit = async e => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div
          className={`sidebar-option${sidebarTab === 'add' ? ' active' : ''}`}
          onClick={() => setSidebarTab('add')}
        >
          Add Invoice
        </div>
        <div
          className={`sidebar-option${sidebarTab === 'manage' ? ' active' : ''}`}
          onClick={() => setSidebarTab('manage')}
        >
          Invoice Management
        </div>
        <div
          className={`sidebar-option${sidebarTab === 'bulk' ? ' active' : ''}`}
          onClick={() => setSidebarTab('bulk')}
        >
          Bulk Upload
        </div>
      </aside>
      <main className="dashboard-main">
        {sidebarTab === 'add' ? (
          <>
            <h2>Add Invoice</h2>
            <form className="invoice-form" onSubmit={handleSubmit}>
              <label>
                Invoice ID
                <input type="text" name="invoice_id" value={form.invoice_id} onChange={handleChange} required />
              </label>
              <label>
                Date
                <input type="date" name="date" value={form.date} onChange={handleChange} required />
              </label>
              <label>
                Customer Name
                <input type="text" name="customer_name" value={form.customer_name} onChange={handleChange} required />
              </label>
              <label>
                Customer Contact Number
                <input type="text" name="customer_contact_number" value={form.customer_contact_number} onChange={handleChange} required />
              </label>
              <label>
                Customer Alt Contact Number
                <input type="text" name="customer_alt_contact_number" value={form.customer_alt_contact_number} onChange={handleChange} />
              </label>
              <label>
                Device Model Name
                <input type="text" name="device_model_name" value={form.device_model_name} onChange={handleChange} required />
              </label>
              <label>
                IMEI Number
                <input type="text" name="imei_number" value={form.imei_number} onChange={handleChange} required />
              </label>
              <label>
                Device Price
                <input type="text" name="device_price" value={form.device_price} onChange={handleChange} required />
              </label>
              <label>
                Payment Mode
                <select name="payment_mode" value={form.payment_mode} onChange={handleChange} required>
                  <option value="">Select Payment Mode</option>
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI</option>
                </select>
              </label>
              <label>
                Shop Code
                <select name="shop_code" value={form.shop_code} onChange={handleChange} required>
                  <option value="">Select Shop Owner</option>
                  {shopOwners.map(owner => (
                    <option key={owner.shop_code} value={owner.shop_code}>
                      {owner.shop_code} - {owner.name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit">Create Invoice</button>
            </form>
          </>
        ) : sidebarTab === 'bulk' ? (
          <BulkUploadPage />
        ) : (
          <ManagerInvoiceManagement />
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard;
