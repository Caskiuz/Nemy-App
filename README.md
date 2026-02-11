# NEMY - Plataforma de Delivery

> Del náhuatl "vivir" - Conectando negocios locales con la comunidad de Autlán, Jalisco

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/mysql-8.0%2B-blue.svg)](https://www.mysql.com/)

## 🚀 Stack Tecnológico

- **Frontend**: React Native + Expo (PWA)
- **Backend**: Express.js + TypeScript
- **Base de Datos**: MySQL + Drizzle ORM
- **Pagos**: Stripe + Stripe Connect
- **SMS**: Twilio Verify
- **Emails**: Resend
- **IA**: Google Gemini

## 📋 Requisitos

- Node.js 18+
- MySQL 8.0+
- npm o yarn

## 🛠️ Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/nemy-app.git
cd nemy-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Configurar base de datos
mysql -u root -p
CREATE DATABASE nemy_db_local;
exit

# Aplicar schema
npm run db:push
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
# Base de Datos
DATABASE_URL=mysql://root:password@localhost:3306/nemy_db_local
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nemy_db_local

# JWT
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret

# Aplicación
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:8081
BACKEND_URL=http://localhost:5000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...

# Twilio (Opcional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_VERIFY_SERVICE_SID=

# Google Gemini AI (Opcional)
GEMINI_API_KEY=

# Resend (Opcional)
RESEND_API_KEY=
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

### Iniciar Ambos
```bash
npm run dev
```

## 📊 Base de Datos

### Schema
El schema completo está en `shared/schema-mysql.ts`

### Migraciones
```bash
# Aplicar cambios al schema
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
│   ├── routes/          # Rutas API
│   ├── services/        # Servicios de negocio
│   ├── db.ts           # Conexión MySQL
│   └── server.ts       # Servidor principal
├── shared/              # Código compartido
│   └── schema-mysql.ts # Schema Drizzle
└── scripts/            # Scripts de utilidad
```

## 💳 Sistema de Pagos

### Comisiones
- Plataforma NEMY: 15%
- Negocio: 70%
- Repartidor: 15%

### Flujo de Pago
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

## 🔐 Seguridad

- Autenticación por teléfono (Twilio Verify)
- JWT con refresh tokens
- Rate limiting
- Validación de roles (RBAC)
- Auditoría de acciones críticas
- Cumplimiento PCI (Stripe)
- Sistema de auditoría financiera

## 📦 Producción

### Build Backend
```bash
npm run server:build
```

### Build Frontend (APK Android)
```bash
npm run build:android
```

### Iniciar Producción
```bash
npm run production:start
```

## 🧪 Testing

```bash
# Linting
npm run lint

# Type checking
npm run check:types
```

## 📄 Licencia

Propietario - NEMY © 2026

## 🆘 Soporte

Para soporte técnico, contacta al equipo de desarrollo.

---

**Hecho con ❤️ en Autlán, Jalisco, México**
