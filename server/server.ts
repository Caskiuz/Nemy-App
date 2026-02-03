import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import apiRoutes from './apiRoutes';

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy - required for rate limiting behind Replit's proxy
app.set('trust proxy', 1);

// Security middleware - disable CSP for SPA
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
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

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production (Expo web build)
if (isProduction) {
  app.use(express.static(path.join(process.cwd(), 'dist')));
  
  // SPA fallback - serve index.html for all non-API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });
} else {
  // Development: just show API is running
  app.get('/', (req, res) => {
    res.json({ 
      message: 'NEMY API Server',
      frontend: process.env.FRONTEND_URL || 'http://localhost:8081',
      docs: '/api'
    });
  });
}

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
