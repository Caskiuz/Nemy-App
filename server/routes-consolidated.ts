import { Router } from 'express';
import { authenticateToken } from './authMiddleware';

// Importar rutas modulares existentes
import authRoutes from './routes/authRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import deliveryRoutes from './deliveryRoutes';
import supportRoutes from './supportRoutes';
import favoritesRoutes from './favoritesRoutes';
import walletRoutes from './walletRoutes';
import stripePaymentRoutes from './routes/stripePaymentRoutes';
import deliveryConfigRoutes from './routes/deliveryConfigRoutes';
import businessVerificationRoutes from './routes/businessVerificationRoutes';

const router = Router();

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// MÓDULOS DE RUTAS
// ============================================

// Auth (público)
router.use('/auth', authRoutes);

// Orders (requiere auth)
router.use('/orders', orderRoutes);

// Admin (requiere auth + rol admin)
router.use('/admin', adminRoutes);

// Delivery (requiere auth + rol repartidor)
router.use('/delivery', deliveryRoutes);

// Support (requiere auth)
router.use('/support', supportRoutes);

// Favorites (requiere auth)
router.use('/favorites', favoritesRoutes);

// Wallet (requiere auth)
router.use('/wallet', walletRoutes);

// Stripe payments (requiere auth)
router.use('/stripe', stripePaymentRoutes);

// Delivery config (requiere auth + rol admin)
router.use('/delivery-config', deliveryConfigRoutes);

// Business verification (requiere auth)
router.use('/business-verification', businessVerificationRoutes);

// ============================================
// RUTAS LEGACY (mantener por compatibilidad)
// ============================================

// Importar rutas legacy de apiRoutes si es necesario
// TODO: Migrar gradualmente a los módulos arriba

export default router;
