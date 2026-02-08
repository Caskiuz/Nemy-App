# ✅ Checklist Rápido - Despliegue Replit + APK

## 🔧 En Replit

### 1. Sincronizar Código
```bash
git pull origin main
npm install
```

### 2. Configurar Secrets (Tools > Secrets)
- [ ] DATABASE_URL
- [ ] DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- [ ] STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY
- [ ] TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
- [ ] OPENAI_API_KEY
- [ ] RESEND_API_KEY
- [ ] NODE_ENV=production
- [ ] PORT=5000
- [ ] FRONTEND_URL=https://nemy-app.replit.app
- [ ] BACKEND_URL=https://nemy-app.replit.app

### 3. Aplicar Schema
```bash
npm run db:push
```

### 4. Iniciar Backend
```bash
npm run production:start
```

### 5. Verificar
- [ ] Abrir: https://nemy-app.replit.app/api/health
- [ ] Debe responder: `{"status":"ok"}`

---

## 📱 En Local (Construir APK)

### 1. Actualizar .env.production
```env
EXPO_PUBLIC_API_URL=https://nemy-app.replit.app
EXPO_PUBLIC_BACKEND_URL=https://nemy-app.replit.app
EXPO_PUBLIC_FRONTEND_URL=https://nemy-app.replit.app
EXPO_PUBLIC_NODE_ENV=production
EXPO_PUBLIC_APP_NAME=NEMY
EXPO_PUBLIC_APP_VERSION=1.0.1
```

### 2. Verificar Backend
```bash
node verify-replit-backend.js
```

### 3. Construir APK
```bash
build-apk-replit.bat
```

O manualmente:
```bash
npx eas-cli login
npx eas-cli build --platform android --profile production
```

### 4. Descargar e Instalar
- [ ] Descargar APK desde EAS Dashboard
- [ ] Instalar en dispositivo Android
- [ ] Probar login con número real

---

## 🧪 Verificación Final

### Backend
- [ ] https://nemy-app.replit.app/api/health → OK
- [ ] https://nemy-app.replit.app/api/businesses → Lista negocios
- [ ] Logs en Replit sin errores

### APK
- [ ] App abre correctamente
- [ ] Login con SMS funciona
- [ ] Ver negocios funciona
- [ ] Crear pedido funciona
- [ ] Pago con Stripe funciona

---

## 🚨 Si algo falla

### Backend no responde
1. Verificar que Replit esté corriendo
2. Revisar logs en Replit Console
3. Verificar Secrets configurados
4. Probar conexión a Aiven: `node verify-aiven.js`

### APK no conecta
1. Verificar URLs en .env.production
2. Reconstruir APK
3. Verificar CORS en server/server.ts
4. Probar con: `node verify-replit-backend.js`

### SMS no llega
1. Verificar créditos Twilio
2. Verificar número en Twilio Console
3. Revisar logs de Twilio

---

## 📞 Números de Prueba

- Admin: +523171234567
- Cliente: +523171234568
- Repartidor: +523171234569

---

**Tiempo estimado: 30-45 minutos**
