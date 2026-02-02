# 🚀 Deployment en Replit

## Pasos para subir a producción

### 1. Configurar Secrets en Replit
Ve a "Tools" → "Secrets" y agrega:

```
DATABASE_URL=mysql://user:pass@host:3306/nemy_prod
DB_HOST=tu-host-mysql
DB_PORT=3306
DB_USER=tu-usuario
DB_PASSWORD=tu-password
DB_NAME=nemy_prod

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
TWILIO_VERIFY_SERVICE_SID=VA...

JWT_SECRET=tu-secret-super-seguro-minimo-32-caracteres

NODE_ENV=production
PORT=5000
```

### 2. Configurar Base de Datos MySQL

Opciones recomendadas:
- **PlanetScale** (gratis, fácil): https://planetscale.com
- **Railway** (fácil): https://railway.app
- **Aiven** (gratis tier): https://aiven.io

#### Ejemplo con PlanetScale:
1. Crear cuenta en planetscale.com
2. Crear base de datos "nemy-prod"
3. Copiar connection string
4. Pegar en SECRET `DATABASE_URL`

### 3. Aplicar Schema a la Base de Datos

En la terminal de Replit:
```bash
npm run db:push
```

### 4. Cargar Datos Iniciales (Opcional)

```bash
# Ejecutar script de datos demo
node scripts/load-demo-data.js
```

### 5. Configurar Stripe Webhooks

1. Ve a Stripe Dashboard → Developers → Webhooks
2. Agrega endpoint: `https://tu-repl.replit.app/api/webhooks/stripe`
3. Selecciona eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copia el webhook secret y agrégalo a Secrets

### 6. Iniciar la Aplicación

Presiona el botón "Run" en Replit o ejecuta:
```bash
npm run production:start
```

### 7. Verificar que Funciona

- Backend: `https://tu-repl.replit.app/api/health`
- Frontend: `https://tu-repl.replit.app`

## 🔧 Troubleshooting

### Error de conexión a MySQL
- Verifica que `DATABASE_URL` esté correcto
- Asegúrate que el host MySQL permita conexiones externas
- Revisa que el puerto sea 3306

### Error 502 Bad Gateway
- Espera 1-2 minutos, Replit está iniciando
- Revisa los logs en la consola

### Stripe webhooks no funcionan
- Verifica que el endpoint sea público
- Usa `stripe listen --forward-to` para testing local
- Revisa que `STRIPE_WEBHOOK_SECRET` sea correcto

### PM2 no inicia
- Ejecuta `pm2 logs` para ver errores
- Verifica que todas las dependencias estén instaladas
- Prueba con `npm run server:dev` primero

## 📱 Acceder desde el móvil

1. Abre la URL de tu Repl en el navegador móvil
2. Agrega a pantalla de inicio para experiencia PWA
3. ¡Listo! Ya puedes usar NEMY desde tu teléfono

## 🔐 Seguridad en Producción

✅ Cambiar todos los secrets a valores de producción
✅ Usar Stripe keys de producción (no test)
✅ JWT_SECRET debe ser aleatorio y seguro
✅ Habilitar HTTPS (Replit lo hace automáticamente)
✅ Configurar CORS solo para tu dominio

## 📊 Monitoreo

- Logs: `pm2 logs`
- Métricas: `pm2 monit`
- Status: `pm2 status`

## 🆘 Soporte

Si tienes problemas, revisa:
1. Logs de PM2: `pm2 logs`
2. Consola de Replit
3. Logs de Stripe Dashboard
4. Logs de Twilio Console
