const { createInvoice, getAllInvoices, getInvoiceById, updateInvoice, deleteInvoice } = require('../models/invoice');
const { getUserByEmail } = require('../models/user');

// Helper: check if user can edit (manager only)
function canEdit(role) {
  return role === 'manager';
}
// Helper: check if user can read (admin, manager, shopowner)
function canRead(role) {
  return ['admin', 'manager', 'shopowner'].includes(role);
}

// Create invoice (manager only)
exports.createInvoice = async (req, res) => {
  const user = req.user;
  if (!canEdit(user.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const data = req.body;
    data.created_by = user.id;
    data.warranty_duration = '2 years';
    if (!data.created_at) data.created_at = new Date();
    // invoice_id and shop_code come from frontend
    const id = await createInvoice(data);
    res.json({ id, invoice_id: data.invoice_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create invoice', details: err.message });
  }
};

// Get all invoices (admin, manager, shopowner)
exports.getAllInvoices = async (req, res) => {
  const user = req.user;
  if (!canRead(user.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const invoices = await getAllInvoices();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices', details: err.message });
  }
};

// Get invoice by id
exports.getInvoiceById = async (req, res) => {
  const user = req.user;
  if (!canRead(user.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoice', details: err.message });
  }
};

// Update invoice (manager only)
exports.updateInvoice = async (req, res) => {
  const user = req.user;
  if (!canEdit(user.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    await updateInvoice(req.params.id, req.body);
    res.json({ message: 'Invoice updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update invoice', details: err.message });
  }
};

// Delete invoice (manager only)
exports.deleteInvoice = async (req, res) => {
  const user = req.user;
  if (!canEdit(user.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    await deleteInvoice(req.params.id);
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete invoice', details: err.message });
  }
};
