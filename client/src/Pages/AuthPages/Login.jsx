import React, { useState } from 'react';
import './Login.css';

const roles = [
  { value: '', label: 'Select your role' },
  { value: 'admin', label: 'Admin' },
  { value: 'shopowner', label: 'Shop Owner' },
  { value: 'manager', label: 'Manager' }
];

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', role: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onLogin && onLogin(data.token, form.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <p>Please sign in to your account</p>
        <label>Email address</label>
        <input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
        <label>Select Role</label>
        <select name="role" value={form.role} onChange={handleChange} required>
          {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <label>Password</label>
        <input name="password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
        <div className="login-links">
          <a href="#">Forgot your password?</a>
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  );
}
