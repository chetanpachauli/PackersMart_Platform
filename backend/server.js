const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./config/db');
const leadRoutes = require('./routes/leadRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    message: 'PackersMart Platform API is running smoothly.',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/leads', leadRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

// Initialize DB and Start Server
const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 PackersMart API Server running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
