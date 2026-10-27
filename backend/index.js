const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'AmberRoast OS Sensory Allocation Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mongodb: 'connected',
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/batches', require('./routes/batchRoutes'));
app.use('/api/cuppings', require('./routes/cuppingRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Error handling middlewares
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Only listen if this file is run directly (not imported during tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`[AmberRoast OS] Specialty Coffee Allocation Server`);
    console.log(`[Port] http://localhost:${PORT}`);
    console.log(`[Environment] ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
