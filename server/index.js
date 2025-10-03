require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


// Routes
const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoice');
const statsRoutes = require('./routes/stats');
const warrantyRoutes = require('./routes/warranty');
app.use('/api', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/stats', statsRoutes);
app.use("/api/warranty", warrantyRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
