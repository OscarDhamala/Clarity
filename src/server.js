const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });
const app = express();

// Connect to MongoDB as soon as the app starts
connectDB();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'Clarity API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Handle unknown routes so the client gets a clear message
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Basic error handler to avoid leaking stack traces
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
