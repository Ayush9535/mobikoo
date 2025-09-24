import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

export default function BulkUploadPage() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

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

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setError('');
    setSuccess('');
    setRows([]);
    setResult(null);
  };

  const handleReadExcel = async () => {
    if (!file) return setError('Please select an Excel file.');
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      let parsedRows = XLSX.utils.sheet_to_json(sheet, { defval: null });
      parsedRows = parsedRows.map(row => {
        const newRow = {};
        for (const key in row) {
          let normKey = normalizeKey(key);
          let value = row[key];
          // Date conversion
          if (normKey === 'date' && value) {
            if (typeof value === 'number') {
              const jsDate = new Date((value - 25569) * 86400 * 1000);
              value = jsDate.toISOString().slice(0, 10);
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
          // IMEI as string
          if (normKey === 'imei_number' && value != null) {
            if (typeof value === 'number') {
              value = value.toLocaleString('fullwide', {useGrouping:false});
            } else if (typeof value === 'string' && /e\+/.test(value)) {
              let num = Number(value);
              if (!isNaN(num)) value = num.toLocaleString('fullwide', {useGrouping:false});
            }
            value = String(value);
          }
          newRow[normKey] = value;
        }
        return newRow;
      });
      setRows(parsedRows);
      setError('');
    } catch (err) {
      setRows([]);
      setError('Failed to read Excel file.');
    }
  };

  const handleSubmit = async () => {
    setUploading(true);
    setError('');
    setSuccess('');
    setResult(null);
    try {
      const resp = await axios.post('/api/invoices/bulk', { invoices: rows }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const { success: succCount, failed: failCount, failed_ids } = resp.data || {};
      if (succCount > 0 && failCount === 0) {
        setSuccess(`Bulk upload successful! (${succCount} invoices uploaded)`);
        setError('');
      } else if (succCount > 0 && failCount > 0) {
        setSuccess(`Partial success: ${succCount} uploaded, ${failCount} failed.`);
        setError('Some invoices failed to upload. See below.');
      } else if (succCount === 0 && failCount > 0) {
        setSuccess('');
        setError('Bulk upload failed. No invoices uploaded. See below.');
      } else {
        setSuccess('');
        setError('Unexpected response from server.');
      }
      setResult(failed_ids || []);
    } catch (err) {
      setSuccess('');
      setResult(null);
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
    <div style={{padding:'2rem'}}>
      <h2>Bulk Invoice Upload (Approval)</h2>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
      <button type="button" onClick={handleReadExcel} disabled={!file} style={{marginLeft:12}}>Read Excel</button>
      {error && <div style={{color:'red',marginTop:8}}>{error}</div>}
      {rows.length > 0 && (
        <>
          <div style={{margin:'18px 0'}}>
            <b>Preview Invoices:</b>
            <div style={{overflowX:'auto',marginTop:8}}>
              <table border="1" cellPadding="6" style={{borderCollapse:'collapse',minWidth:700}}>
                <thead>
                  <tr>
                    {Object.keys(rows[0]).map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      {Object.keys(rows[0]).map(h => <td key={h}>{row[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <button type="button" onClick={handleSubmit} disabled={uploading} style={{padding:'8px 24px',borderRadius:6,background:'#2563eb',color:'#fff',fontWeight:600}}>
            {uploading ? 'Submitting...' : 'Submit/Add All'}
          </button>
        </>
      )}
      {success && <div style={{color:'green',marginTop:16}}>{success}</div>}
      {error && rows.length > 0 && <div style={{color:'red',marginTop:16}}>{error}</div>}
      {result && result.length > 0 && (
        <div style={{marginTop:12}}>
          <b>Failed Invoice IDs:</b>
          <div style={{color:'red'}}>{result.join(', ')}</div>
        </div>
      )}
    </div>
  );
}
