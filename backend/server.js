const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// loading of environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

const app = express();

connectDB();

// CORS Update
const allowedOrigins = [
  'http://localhost:3000',           
  'https://clarity-oscar.vercel.app' // Live Vercel Deployment Domain
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy: This origin is not allowed.'));
    }
  },
  credentials: true, //for sending cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Global middleware
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'Clarity API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5050;  // The default port was 5000 but due to MacOS Airplay using the port 5000, I changed it to 5050 to avoid conflicts.
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});