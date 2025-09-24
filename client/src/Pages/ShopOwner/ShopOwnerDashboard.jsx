import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ShopOwnerDashboard.css';

const InvoiceDetailsModal = ({ invoice, onClose }) => {
  if (!invoice) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Invoice Details</h3>
        <table className="details-table">
          <tbody>
            {Object.entries(invoice).map(([key, value]) => (
              <tr key={key}>
                <td className="details-key">{key.replace(/_/g, ' ')}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={onClose} className="close-btn">Close</button>
      </div>
    </div>
  );
};

const InvoiceTable = ({ invoices, onInvoiceClick }) => (
  <table className="invoice-table">
    <thead>
      <tr>
        <th>Invoice ID</th>
        <th>Date</th>
        <th>Customer Name</th>
        <th>Customer Contact</th>
        <th>Device Model</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>
      {invoices.map(inv => (
        <tr key={inv.id}>
          <td>
            <a href="#" className="invoice-link" onClick={e => { e.preventDefault(); onInvoiceClick(inv); }}>
              {inv.invoice_id}
            </a>
          </td>
          <td>{inv.date ? inv.date.slice(0,10) : ''}</td>
          <td>{inv.customer_name}</td>
          <td>{inv.customer_contact_number}</td>
          <td>{inv.device_model_name}</td>
          <td>{inv.device_price}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default function ShopOwnerDashboard({ shopOwner }) {
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [stats, setStats] = useState({ totalSales: 0, totalInvoices: 0 });

  const fetchRecentInvoices = async () => {
    setLoadingRecent(true);
    try {
      const res = await axios.get(`/api/invoices?shop_code=${shopOwner.shop_code}&limit=6`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setRecentInvoices(res.data);
    } catch {
      setRecentInvoices([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  const fetchAllInvoices = async () => {
    setLoadingAll(true);
    try {
      const res = await axios.get(`/api/invoices?shop_code=${shopOwner.shop_code}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setAllInvoices(res.data);
      // Calculate stats
      let totalSales = 0;
      res.data.forEach(inv => {
        const price = parseFloat(inv.device_price) || 0;
        totalSales += price;
      });
      setStats({ totalSales, totalInvoices: res.data.length });
    } catch {
      setAllInvoices([]);
      setStats({ totalSales: 0, totalInvoices: 0 });
    } finally {
      setLoadingAll(false);
    }
  };

  useEffect(() => {
    if (sidebarTab === 'dashboard') fetchRecentInvoices();
    fetchAllInvoices();
    // eslint-disable-next-line
  }, [sidebarTab, shopOwner.shop_code]);

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="shop-title">{shopOwner.shop_name}</div>
          <div className="shop-code">{shopOwner.shop_code}</div>
          <div className="shop-address">{shopOwner.shop_address}</div>
        </div>
        <div className={`sidebar-option${sidebarTab === 'dashboard' ? ' active' : ''}`} onClick={() => setSidebarTab('dashboard')}>Dashboard</div>
        <div className={`sidebar-option${sidebarTab === 'invoices' ? ' active' : ''}`} onClick={() => setSidebarTab('invoices')}>Invoices</div>
      </aside>
      <main className="dashboard-main">
        {sidebarTab === 'dashboard' ? (
          <>
            <h2>Dashboard</h2>
            <div className="stat-boxes">
              <div className="stat-box">
                <div className="stat-label">Total Sales</div>
                <div className="stat-value">₹{stats.totalSales}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Total Invoices</div>
                <div className="stat-value">{stats.totalInvoices}</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'2.5rem',marginBottom:'0.5rem'}}>
              <h3 style={{margin:0}}>Recent Invoices</h3>
              <button onClick={fetchRecentInvoices} title="Refresh" style={{padding:'6px 14px',borderRadius:6,border:'1px solid #d1d5db',background:'#f3f4f6',cursor:'pointer',fontWeight:600}}>
                &#x21bb; Refresh
              </button>
            </div>
            {loadingRecent ? <div>Loading...</div> : (
              <InvoiceTable invoices={recentInvoices} onInvoiceClick={setSelectedInvoice} />
            )}
          </>
        ) : (
          <>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'1.5rem'}}>
              <h2 style={{margin:0}}>All Invoices</h2>
              <button onClick={fetchAllInvoices} title="Refresh" style={{padding:'6px 14px',borderRadius:6,border:'1px solid #d1d5db',background:'#f3f4f6',cursor:'pointer',fontWeight:600}}>
                &#x21bb; Refresh
              </button>
            </div>
            {loadingAll ? <div>Loading...</div> : (
              <InvoiceTable invoices={allInvoices} onInvoiceClick={setSelectedInvoice} />
            )}
          </>
        )}
        {selectedInvoice && (
          <InvoiceDetailsModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
        )}
      </main>
    </div>
  );
}
