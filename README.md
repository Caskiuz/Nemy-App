# NEMY - Plataforma de Delivery para Autlán

> Del náhuatl "vivir" - Conectando negocios locales con la comunidad

## 🚀 Stack Tecnológico

- **Frontend**: React Native + Expo (PWA)
- **Backend**: Express.js + TypeScript
- **Base de Datos**: MySQL + Drizzle ORM
- **Pagos**: Stripe + Stripe Connect
- **SMS/Llamadas**: Twilio
- **Emails**: Resend
- **IA**: OpenAI GPT

## 📋 Requisitos

- Node.js 18+
- MySQL 8.0+
- npm o yarn

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Configurar base de datos MySQL
mysql -u root -p
CREATE DATABASE nemy_db_local;

# Aplicar schema
npm run db:push
```

## 🔧 Configuración

### Variables de Entorno (.env.local)

```env
# Base de Datos MySQL
DATABASE_URL=mysql://root:password@localhost:3306/nemy_db_local
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nemy_db_local

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
TWILIO_VERIFY_SERVICE_SID=VA...

# Aplicación
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:8081
BACKEND_URL=http://localhost:5000
```

## 🚀 Desarrollo

### Iniciar Backend
```bash
npm run server:start
```

### Iniciar Frontend
```bash
npm run expo:dev
```

## 📊 Base de Datos

### Schema
El schema completo está en `shared/schema-mysql.ts`

### Migraciones
```bash
# Aplicar cambios
npm run db:push

# Backup
mysqldump -u root -p nemy_db_local > backup.sql

# Restore
mysql -u root -p nemy_db_local < backup.sql
```

## 🏗️ Estructura del Proyecto

```
NEMY-APP/
├── client/              # Frontend React Native
│   ├── components/      # Componentes reutilizables
│   ├── screens/         # Pantallas de la app
│   ├── contexts/        # Context API
│   ├── navigation/      # Navegación
│   └── constants/       # Configuración
├── server/              # Backend Express
│   ├── routes.ts        # Rutas API
│   ├── db.ts           # Conexión MySQL
│   ├── server.ts       # Servidor principal
│   └── *.ts            # Servicios
├── shared/              # Código compartido
│   └── schema-mysql.ts # Schema Drizzle
└── scripts/            # Scripts de utilidad
```

## 🔐 Seguridad

- Autenticación por teléfono (Twilio Verify)
- Rate limiting
- Validación de roles
- Auditoría de acciones
- Cumplimiento PCI (Stripe)
- **Sistema de Auditoría Financiera** (Nivel bancario)

## 🔒 Sistema de Auditoría Financiera

NEMY incluye un sistema de auditoría financiera de nivel bancario que valida 6 reglas críticas:

1. ✅ **Comisiones suman 100%** - Las tasas siempre cuadran
2. ✅ **Totales de pedidos correctos** - Subtotal + Fee + Tax = Total
3. ✅ **Distribución exacta** - Comisiones distribuidas = Total pedido
4. ✅ **Balances consistentes** - Balance wallet = Suma transacciones
5. ✅ **Cadena de transacciones** - Cada tx mantiene integridad contable
6. ✅ **Sincronización Stripe** - Pagos = Totales de pedidos

### Ejecutar Auditoría
```bash
# Auditoría completa (requiere admin)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:5000/api/audit/full

# Prueba local
cd server
npx ts-node testFinancialAudit.ts
```

Ver documentación completa en [FINANCIAL-AUDIT-SYSTEM.md](./FINANCIAL-AUDIT-SYSTEM.md)

## 💳 Sistema de Pagos

### Comisiones
- Plataforma: 15%
- Negocio: 70%
- Repartidor: 15%

### Flujo
1. Cliente realiza pedido
2. Pago capturado con Stripe
3. Fondos retenidos hasta entrega
4. Distribución automática de comisiones
5. Liberación a wallets

## 📱 Funcionalidades

### Para Clientes
- Explorar negocios y productos
- Realizar pedidos
- Seguimiento en tiempo real
- Pagos con tarjeta o efectivo
- Sistema de reseñas

### Para Negocios
- Panel de gestión
- Control de productos
- Modo saturado / Menú 86
- Estadísticas de ventas
- Gestión de pedidos

### Para Repartidores
- Asignación automática
- Navegación integrada
- Historial de entregas
- Sistema de ganancias

### Para Administradores
- Panel de control completo
- Métricas en tiempo real
- Gestión de usuarios
- Resolución de disputas
- Configuración de comisiones

## 🧪 Testing

### Testing Manual
```bash
# Linting
npm run lint

# Type checking
npm run check:types
```

## 📦 Producción

```bash
# Build
npm run server:build

# Iniciar
npm run production:start
```

## 📚 Documentación

- [Especificación Técnica](./ESPECIFICACION-TECNICA.md)
- [Guía de Testing](./TESTING_GUIDE.md)
- [Checklist de Producción](./PRODUCTION_CHECKLIST.md)
- [Sistema de Pagos](./COMO_FUNCIONA_PAGOS.md)
- [Sistema de Auditoría Financiera](./FINANCIAL-AUDIT-SYSTEM.md) 🆕
- [Resumen de Implementación](./AUDIT-IMPLEMENTATION-SUMMARY.md) 🆕

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Propietario - NEMY © 2026

## 🆘 Soporte

Para soporte técnico, contacta al equipo de desarrollo.

---

**Hecho con ❤️ en Autlán, Jalisco, México**