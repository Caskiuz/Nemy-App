# Guía de Despliegue en Replit y Construcción de APK

## 📋 Paso 1: Preparar Replit

### 1.1 Sincronizar con GitHub
```bash
# En Replit, ir a la pestaña "Version Control" o ejecutar:
git pull origin main
```

### 1.2 Configurar Variables de Entorno en Replit
En Replit > Tools > Secrets, agregar:

```env
# Base de Datos (Aiven MySQL)
DATABASE_URL=mysql://avnadmin:YOUR_PASSWORD@mysql-nemy-caskiuz.h.aivencloud.com:13yyy/defaultdb?ssl-mode=REQUIRED
DB_HOST=mysql-nemy-caskiuz.h.aivencloud.com
DB_PORT=13yyy
DB_USER=avnadmin
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=defaultdb

# Stripe
STRIPE_SECRET_KEY=sk_live_tu_key_aqui
STRIPE_PUBLISHABLE_KEY=pk_live_tu_key_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_secret_aqui

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_token_aqui
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxx

# OpenAI
OPENAI_API_KEY=sk-proj-tu_key_aqui

# Resend (Email)
RESEND_API_KEY=re_tu_key_aqui

# Aplicación
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://nemy-app.replit.app
BACKEND_URL=https://nemy-app.replit.app
```

### 1.3 Instalar Dependencias
```bash
npm install
```

### 1.4 Aplicar Schema a Base de Datos
```bash
npm run db:push
```

### 1.5 Iniciar Backend en Replit
```bash
npm run production:start
```

O configurar en `.replit`:
```toml
run = "npm run production:start"
```

---

## 📱 Paso 2: Construir APK desde Local

### 2.1 Actualizar URLs de Producción
Editar `.env.production`:
```env
EXPO_PUBLIC_API_URL=https://nemy-app.replit.app
EXPO_PUBLIC_BACKEND_URL=https://nemy-app.replit.app
EXPO_PUBLIC_FRONTEND_URL=https://nemy-app.replit.app
EXPO_PUBLIC_NODE_ENV=production
EXPO_PUBLIC_APP_NAME=NEMY
EXPO_PUBLIC_APP_VERSION=1.0.1
```

### 2.2 Verificar Configuración EAS
Revisar `eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "env": {
          "EXPO_PUBLIC_API_URL": "https://nemy-app.replit.app"
        }
      }
    }
  }
}
```

### 2.3 Construir APK (Opción A: Automática)
```bash
# Ejecutar el script
build-apk-production.bat
```

### 2.4 Construir APK (Opción B: Manual)
```bash
# 1. Login a EAS
npx eas-cli login

# 2. Configurar proyecto
npx eas-cli build:configure

# 3. Construir APK
npx eas-cli build --platform android --profile production --local

# O en la nube:
npx eas-cli build --platform android --profile production
```

---

## 🔧 Paso 3: Verificar Conexión Backend-App

### 3.1 Probar Endpoints desde Local
```bash
# Ejecutar script de prueba
node test-prod-login.js
```

O manualmente:
```bash
curl https://nemy-app.replit.app/api/health
```

### 3.2 Verificar CORS
El backend debe tener configurado:
```typescript
// server/server.ts
app.use(cors({
  origin: [
    'https://nemy-app.replit.app',
    'exp://192.168.1.*',
    /^exp:\/\/.*/,
    /^https?:\/\/localhost/
  ],
  credentials: true
}));
```

### 3.3 Probar desde la App
1. Instalar APK en dispositivo Android
2. Abrir app
3. Intentar login con: `+523171234567`
4. Verificar que llegue SMS de Twilio

---

## 🚀 Paso 4: Despliegue Completo

### 4.1 Checklist Pre-Despliegue
- [ ] Backend corriendo en Replit
- [ ] Base de datos Aiven conectada
- [ ] Variables de entorno configuradas
- [ ] Stripe en modo live
- [ ] Twilio configurado
- [ ] URLs actualizadas en `.env.production`
- [ ] APK construida y probada

### 4.2 Monitoreo
```bash
# Ver logs en Replit
# O desde local:
curl https://nemy-app.replit.app/api/admin/metrics
```

### 4.3 Rollback si hay problemas
```bash
# En Replit
git reset --hard HEAD~1
git push -f origin main
```

---

## 📦 Archivos Importantes

### Excluir de Git (ya están en .gitignore)
```
.env.local
.env.production.local
backups/
server/uploads/
node_modules/
```

### Mantener en Git
```
.env.production (sin secretos)
eas.json
package.json
server/
client/
shared/
```

---

## 🔐 Seguridad

### Variables Sensibles (NUNCA subir a Git)
- Contraseñas de base de datos
- API keys de Stripe, Twilio, OpenAI
- Tokens de autenticación
- Archivos de backup con datos reales

### Usar Secrets en Replit
Todas las variables sensibles deben estar en Replit Secrets, NO en archivos.

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"
```bash
# Verificar conexión a Aiven
node verify-aiven.js
# O manualmente:
mysql -h mysql-nemy-caskiuz.h.aivencloud.com -P 13xxx -u avnadmin -p --ssl-mode=REQUIRED
```

### Error: "CORS policy"
- Verificar que `FRONTEND_URL` esté en la lista de CORS
- Revisar `server/server.ts` configuración de CORS

### Error: "APK no conecta"
- Verificar URLs en `.env.production`
- Reconstruir APK con `build-apk-production.bat`
- Verificar que Replit esté corriendo

### Error: "Twilio SMS no llega"
- Verificar créditos en Twilio
- Verificar número verificado
- Revisar logs en Twilio Console

---

## 📊 Comandos Útiles

```bash
# Ver estado de Git
git status

# Actualizar desde GitHub
git pull origin main

# Subir cambios
git add .
git commit -m "descripción"
git push origin main

# Construir APK local
npx eas-cli build --platform android --profile production --local

# Construir APK en nube
npx eas-cli build --platform android --profile production

# Ver logs de build
npx eas-cli build:list

# Descargar APK
npx eas-cli build:download --id BUILD_ID
```

---

## ✅ Verificación Final

1. ✅ Backend en Replit responde: `https://nemy-app.replit.app/api/health`
2. ✅ APK instalada en Android
3. ✅ Login funciona con SMS
4. ✅ Pedidos se crean correctamente
5. ✅ Pagos con Stripe funcionan
6. ✅ Notificaciones push llegan

---

**¡Listo para producción! 🎉**
