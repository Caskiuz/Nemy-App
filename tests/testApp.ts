import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Reuse real routes
import apiRoutes from '../server/apiRoutes';
import walletRoutesV2 from '../server/routes/walletRoutes';
import favoritesRoutes from '../server/favoritesRoutes';
import securePaymentRoutes from '../server/securePaymentIntegration';
import financialTestRoute from '../server/financialTestRoute';
import devRoutes from '../server/devRoutes';

export function createTestApp() {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';

  app.set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors({ origin: true, credentials: true }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 100 : 10000,
    message: 'Too many requests from this IP',
  });
  app.use('/api/', limiter);

  app.use((req, res, next) => {
    console.log(`[TEST] ${req.method} ${req.originalUrl}`);
    next();
  });

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Static assets (not critical for API tests, but keep parity)
  const staticBuildPath = path.join(process.cwd(), 'static-build');
  app.use('/ios', express.static(path.join(staticBuildPath, 'ios')));
  app.use('/android', express.static(path.join(staticBuildPath, 'android')));
  app.use(express.static(staticBuildPath));

  // Core routes
  app.use('/api', apiRoutes);
  app.use('/api/wallet', walletRoutesV2);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api', securePaymentRoutes);
  app.use('/api/financial', financialTestRoute);

  if (!isProduction) {
    app.use('/api', devRoutes);
  }

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), test: true });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  // Error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('[TEST] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

export default createTestApp;
