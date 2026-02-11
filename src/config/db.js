const mongoose = require('mongoose');

// Simple helper to connect to MongoDB with helpful console output
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('Missing MONGO_URI environment variable');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
