import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import apiRoutes from './apiRoutes';

const app = express();
const PORT = process.env.PORT || 5000;
const DIST_PATH = path.join(__dirname, '..', 'dist');

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

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from Expo web build or landing page
const landingPagePath = path.join(__dirname, 'templates', 'landing-page.html');
const distIndexPath = path.join(DIST_PATH, 'index.html');

// Check if we have a complete frontend build
const hasDistBuild = fs.existsSync(DIST_PATH) && fs.existsSync(distIndexPath);

if (hasDistBuild) {
  app.use(express.static(DIST_PATH));
  
  // SPA fallback - serve index.html for non-API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(distIndexPath);
  });
} else {
  // Serve static assets from dist if they exist
  if (fs.existsSync(DIST_PATH)) {
    app.use(express.static(DIST_PATH));
  }
  
  // Serve landing page
  if (fs.existsSync(landingPagePath)) {
    app.get('/', (req, res) => {
      res.sendFile(landingPagePath);
    });
  } else {
    app.get('/', (req, res) => {
      res.status(200).json({ status: 'ok', service: 'NEMY API' });
    });
  }
}

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
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