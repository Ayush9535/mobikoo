import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './InvoiceManagement.css';

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

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="invoice-mgmt-root">
      <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
        <h2 style={{margin:0}}>Invoice Management</h2>
        <button onClick={fetchInvoices} title="Refresh" style={{padding:'6px 14px',borderRadius:6,border:'1px solid #d1d5db',background:'#f3f4f6',cursor:'pointer',fontWeight:600}}>
          &#x21bb; Refresh
        </button>
      </div>
      {loading ? <div>Loading...</div> : (
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Date</th>
              <th>Customer Name</th>
              <th>Customer Contact</th>
              <th>Shop Name</th>
              <th>Shop Code</th>
              <th>Device Model</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>
                  <a href="#" className="invoice-link" onClick={e => { e.preventDefault(); setSelectedInvoice(inv); }}>
                    {inv.invoice_id}
                  </a>
                </td>
                <td>{inv.date ? inv.date.slice(0,10) : ''}</td>
                <td>{inv.customer_name}</td>
                <td>{inv.customer_contact_number}</td>
                <td>{inv.shop_name}</td>
                <td>{inv.shop_code}</td>
                <td>{inv.device_model_name}</td>
                <td>{inv.device_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selectedInvoice && (
        <InvoiceDetailsModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
}
