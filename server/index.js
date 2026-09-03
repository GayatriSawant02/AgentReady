import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import settingsRouter from './routes/settings.js';
import catalogRouter from './routes/catalog.js';
import aiRouter from './routes/ai.js';
import policyRouter from './routes/policy.js';
import ordersRouter from './routes/orders.js';
import auditRouter from './routes/audit.js';
import paymentsRouter from './routes/payments.js';
import { isSupabaseConfigured } from './db/supabaseClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for API calls
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AgentReady Backend',
    version: '1.0.0',
    database: isSupabaseConfigured ? 'Supabase PostgreSQL' : 'Local Seeded Store',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/products', productsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/ai', aiRouter);
app.use('/api/policy', policyRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/audit', auditRouter);
app.use('/api/payments', paymentsRouter);

// Fallback 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 AgentReady Backend running on http://localhost:${PORT}`);
  console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`🛍️ Products API: http://localhost:${PORT}/api/products`);
  console.log(`⚙️ Settings API: http://localhost:${PORT}/api/settings`);
  console.log(`📦 Database Mode: ${isSupabaseConfigured ? 'Supabase' : 'Local In-Memory Seeded Store'}`);
  console.log(`======================================================\n`);
});
