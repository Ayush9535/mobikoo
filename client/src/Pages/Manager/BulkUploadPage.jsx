import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { Upload, FileText, Download, CheckCircle, XCircle, AlertCircle, Eye, FileSpreadsheet } from 'lucide-react';

export default function BulkUploadPage() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [reading, setReading] = useState(false);

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
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
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
    } finally {
      setReading(false);
    }
  };

  const handleSubmit = async () => {
    setUploading(true);
    setError('');
    setSuccess('');
    setResult(null);
    try {
      const resp = await axios.post('/api/invoices/bulk', { invoices: rows }, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      const { success: succCount, failed: failCount, failed_ids } = resp.data || {};
      if (succCount > 0 && failCount === 0) {
        setSuccess(`Bulk upload successful! (${succCount} invoices uploaded)`);
        setError('');
      } else if (succCount > 0 && failCount > 0) {
        setSuccess(`Partial success: ${succCount} uploaded, ${failCount} failed.`);
        setError('Some invoices failed to upload. See details below.');
      } else if (succCount === 0 && failCount > 0) {
        setSuccess('');
        setError('Bulk upload failed. No invoices uploaded. See details below.');
      } else {
        setSuccess('');
        setError('Unexpected response from server.');
      }
      setResult(failed_ids || []);
    } catch (err) {
      setSuccess('');
      setResult(null);
      setError('Bulk upload failed. Please check your file and try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFieldName = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="max-w-6xl mx-auto">
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

      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 font-poppins">Bulk Invoice Upload</h2>
        <p className="text-gray-600 mt-1">Upload multiple invoices at once using Excel files</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 font-poppins flex items-center">
            <Upload className="w-5 h-5 mr-2 text-blue-600" />
            File Upload
          </h3>
          <p className="text-sm text-gray-500 mt-1">Select an Excel file (.xlsx, .xls) containing invoice data</p>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* File Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Excel File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {file && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                  Selected: {file.name}
                </div>
              )}
            </div>
            
            {/* Read Button */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2 sm:invisible">
                Action
              </label>
              <button
                type="button"
                onClick={handleReadExcel}
                disabled={!file || reading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {reading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Reading...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Read Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <XCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-900">Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-900">Success</h4>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {rows.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-poppins flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Preview Invoices
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {rows.length} invoice{rows.length > 1 ? 's' : ''} found in the file
                </p>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={uploading}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit All ({rows.length})
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {Object.keys(rows[0]).map(header => (
                      <th key={header} className="text-left py-3 px-4 font-medium text-gray-700 text-sm border-r border-gray-200 last:border-r-0">
                        {formatFieldName(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rows.map((row, index) => (
                    <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                      {Object.keys(rows[0]).map(key => (
                        <td key={key} className="py-3 px-4 text-sm text-gray-900 border-r border-gray-100 last:border-r-0">
                          {row[key] || <span className="text-gray-400 italic">-</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Failed Results */}
      {result && result.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 font-poppins flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
              Failed Invoices
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              The following invoice IDs failed to upload
            </p>
          </div>
          
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {result.map(id => (
                  <span key={id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    {id}
                  </span>
                ))}
              </div>
              <p className="text-sm text-red-700 mt-3">
                Please check these invoices for errors and try uploading them again individually.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}