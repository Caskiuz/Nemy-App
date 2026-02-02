import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiRoutes from './apiRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 10000,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRoutes);

// Root endpoint for health checks
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'NEMY API' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8081'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Check optional services
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  Stripe not configured - payments disabled');
  }
  if (!process.env.TWILIO_ACCOUNT_SID) {
    console.warn('⚠️  Twilio not configured - SMS disabled');
  }
});