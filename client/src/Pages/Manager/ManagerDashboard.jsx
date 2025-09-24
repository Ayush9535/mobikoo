import React, { useEffect, useState } from 'react';
import './ManagerDashboard.css';
import axios from 'axios';

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
    amount: '', // keep for compatibility if needed
    shop_code: '',
    created_at: '',
  });
  const [filteredShopOwners, setFilteredShopOwners] = useState([]);
  const [shopInput, setShopInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Fetch all shop owners for dropdown
    axios.get('/api/auth/shopowners')
      .then(res => setShopOwners(res.data))
      .catch(() => setShopOwners([]));
  }, []);

  useEffect(() => {
    if (shopInput) {
      setFilteredShopOwners(
        shopOwners.filter(owner =>
          owner.shop_code.toLowerCase().includes(shopInput.toLowerCase()) ||
          owner.name.toLowerCase().includes(shopInput.toLowerCase())
        )
      );
    } else {
      setFilteredShopOwners(shopOwners);
    }
  }, [shopInput, shopOwners]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'shop_code') {
      setShopInput(value);
      setShowDropdown(true);
    }
  };

  const handleShopSelect = (code) => {
    setForm(prev => ({ ...prev, shop_code: code }));
    setShopInput(code);
    setShowDropdown(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Submit invoice form
    try {
      await axios.post('/api/invoice', form);
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
      setShopInput('');
    } catch (err) {
      alert('Failed to create invoice');
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-option active">AddInvoice</div>
      </aside>
      <main className="dashboard-main">
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
            <input type="text" name="payment_mode" value={form.payment_mode} onChange={handleChange} required />
          </label>
          <label>
            Shop Code
            <input
              type="text"
              name="shop_code"
              value={shopInput}
              onChange={handleChange}
              autoComplete="off"
              onFocus={() => setShowDropdown(true)}
              required
            />
            {showDropdown && filteredShopOwners.length > 0 && (
              <ul className="dropdown">
                {filteredShopOwners.map(owner => (
                  <li key={owner.shop_code} onClick={() => handleShopSelect(owner.shop_code)}>
                    {owner.shop_code} - {owner.name}
                  </li>
                ))}
              </ul>
            )}
          </label>
          <label>
            Created At
            <input type="date" name="created_at" value={form.created_at} onChange={handleChange} required />
          </label>
          <button type="submit">Create Invoice</button>
        </form>
      </main>
    </div>
  );
};

export default ManagerDashboard;
