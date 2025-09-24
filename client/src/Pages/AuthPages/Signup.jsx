import React, { useState } from 'react';
import './Signup.css';

const roles = [
  { value: '', label: 'Select Role' },
  { value: 'admin', label: 'Admin' },
  { value: 'shopowner', label: 'Shop Owner' },
  { value: 'manager', label: 'Manager' }
];

export default function Signup() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    shop_name: '',
    shop_address: '',
    contact_number: '',
    manager_name: '',
    admin_name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = e => {
    setForm({ ...form, role: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      let body = {
        email: form.email,
        role: form.role,
        admin_name: form.role === 'admin' ? form.admin_name : undefined,
        shop_name: form.role === 'shopowner' ? form.shop_name : undefined,
        shop_address: form.role === 'shopowner' ? form.shop_address : undefined,
        contact_number: form.role !== 'admin' ? form.contact_number : undefined,
        manager_name: form.role === 'manager' ? form.manager_name : undefined
      };
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setSuccess('User created successfully!');
      setForm({
        firstName: '', lastName: '', email: '', role: '', shop_name: '', shop_address: '', contact_number: '', manager_name: '', admin_name: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create an account</h2>
        <p>Sign up to get started</p>
        <label>First Name</label>
        <input name="firstName" type="text" placeholder="Enter your first name" value={form.firstName} onChange={handleChange} required />
        <label>Last Name</label>
        <input name="lastName" type="text" placeholder="Enter your last name" value={form.lastName} onChange={handleChange} required />
        <label>Email address</label>
        <input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
        <label>Select Role</label>
        <select name="role" value={form.role} onChange={handleRoleChange} required>
          {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        {form.role === 'admin' && (
          <>
            <label>Admin Name</label>
            <input name="admin_name" type="text" placeholder="Enter admin name" value={form.admin_name} onChange={handleChange} required />
          </>
        )}
        {form.role === 'shopowner' && (
          <>
            <label>Shop Name</label>
            <input name="shop_name" type="text" placeholder="Enter shop name" value={form.shop_name} onChange={handleChange} required />
            <label>Shop Address</label>
            <input name="shop_address" type="text" placeholder="Enter shop address" value={form.shop_address} onChange={handleChange} required />
            <label>Contact Number</label>
            <input name="contact_number" type="text" placeholder="Enter contact number" value={form.contact_number} onChange={handleChange} required />
          </>
        )}
        {form.role === 'manager' && (
          <>
            <label>Manager Name</label>
            <input name="manager_name" type="text" placeholder="Enter manager name" value={form.manager_name} onChange={handleChange} required />
            <label>Contact Number</label>
            <input name="contact_number" type="text" placeholder="Enter contact number" value={form.contact_number} onChange={handleChange} required />
          </>
        )}
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Sign up'}</button>
      </form>
    </div>
  );
}
