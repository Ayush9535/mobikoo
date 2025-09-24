import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function BulkInvoiceUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setError('');
    setSuccess('');
  };

  const handleUpload = async () => {
    if (!file) return setError('Please select an Excel file.');
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      let rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
      // Normalize keys to backend field names
      const fieldMap = {
        invoice_id: ['invoice id', 'invoice_id', 'InvoiceID', 'Invoice Id', 'Invoice_Id', 'Invoiceid'],
        date: ['date', 'Date'],
        customer_name: ['customer name', 'customer_name', 'CustomerName', 'Customer Name', 'Customer_name'],
        customer_contact_number: ['customer contact number', 'customer_contact_number', 'CustomerContactNumber', 'Customer Contact Number', 'Customer_contact_number'],
        customer_alt_contact_number: ['customer alt.contact number', 'customer alt contact number', 'customer_alt_contact_number', 'CustomerAltContactNumber', 'Customer Alt Contact Number', 'Customer_alt_contact_number'],
        device_model_name: ['model name', 'device model name', 'device_model_name', 'DeviceModelName', 'Device Model Name', 'Device_model_name'],
        imei_number: ['imei number', 'imei_number', 'IMEINumber', 'IMEI Number', 'Imei_number'],
        device_price: ['device price', 'device_price', 'DevicePrice', 'Device Price', 'Device_price'],
        payment_mode: ['payment mode', 'payment_mode', 'PaymentMode', 'Payment Mode', 'Payment_mode'],
        shop_code: ['shop code', 'shop_code', 'ShopCode', 'Shop Code', 'Shop_code'],
      };
      function normalizeKey(key) {
        key = key.replace(/\./g, ' ').replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().trim();
        for (const backendKey in fieldMap) {
          if (fieldMap[backendKey].some(alt => key === alt.replace(/\./g, ' ').replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().trim())) {
            return backendKey;
          }
        }
        return key.replace(/ /g, '_'); // fallback
      }
      rows = rows.map(row => {
        const newRow = {};
        for (const key in row) {
          let normKey = normalizeKey(key);
          let value = row[key];
          // Convert date to yyyy-mm-dd if possible
          if (normKey === 'date' && value) {
            // Excel may give date as serial number
            if (typeof value === 'number') {
              // Excel's epoch starts at 1900-01-01, but JS at 1970-01-01
              // Excel date 1 = 1900-01-01, but Excel wrongly treats 1900 as leap year, so offset is 25569
              // See: https://stackoverflow.com/a/16233697
              const jsDate = new Date((value - 25569) * 86400 * 1000);
              value = jsDate.toISOString().slice(0, 10); // yyyy-mm-dd
            } else if (typeof value === 'string') {
              let d = value.replace(/\//g, '-');
              const parts = d.split('-');
              if (parts.length === 3) {
                if (parts[2].length === 4) {
                  value = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
                } else if (parts[0].length === 4) {
                  value = `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`;
                }
              }
            }
          }
          // Ensure IMEI is string and not scientific notation
          if (normKey === 'imei_number' && value != null) {
            if (typeof value === 'number') {
              value = value.toLocaleString('fullwide', {useGrouping:false});
            } else if (typeof value === 'string' && /e\+/.test(value)) {
              // Try to parse scientific notation
              let num = Number(value);
              if (!isNaN(num)) value = num.toLocaleString('fullwide', {useGrouping:false});
            }
            value = String(value);
          }
          newRow[normKey] = value;
        }
        return newRow;
      });
      // Send to backend
      const resp = await axios.post('/api/invoices/bulk', { invoices: rows }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const { success: succCount, failed: failCount } = resp.data || {};
      if (succCount > 0 && failCount === 0) {
        setSuccess(`Bulk upload successful! (${succCount} invoices uploaded)`);
        setError('');
      } else if (succCount > 0 && failCount > 0) {
        setSuccess(`Partial success: ${succCount} uploaded, ${failCount} failed.`);
        setError('Some invoices failed to upload. Please check your data.');
      } else if (succCount === 0 && failCount > 0) {
        setSuccess('');
        setError('Bulk upload failed. No invoices uploaded. Please check your file and try again.');
      } else {
        setSuccess('');
        setError('Unexpected response from server.');
      }
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setSuccess('');
      if (err.response && err.response.data && err.response.data.error) {
        setError('Bulk upload failed: ' + err.response.data.error);
      } else {
        setError('Bulk upload failed. Please check your file and try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{marginBottom:'2rem',background:'#f3f4f6',padding:'18px 24px',borderRadius:8}}>
      <h3>Bulk Invoice Upload (Excel)</h3>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
      <button type="button" onClick={handleUpload} disabled={uploading || !file} style={{marginLeft:12,padding:'7px 18px',borderRadius:6,border:'1px solid #d1d5db',background:'#2563eb',color:'#fff',fontWeight:600,cursor:'pointer'}}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <div style={{color:'red',marginTop:8}}>{error}</div>}
      {success && <div style={{color:'green',marginTop:8}}>{success}</div>}
      <div style={{marginTop:10,fontSize:'0.95rem',color:'#555'}}>Excel columns: invoice_id, date, customer_name, customer_contact_number, customer_alt_contact_number, device_model_name, imei_number, device_price, payment_mode, amount, shop_code</div>
    </div>
  );
}
