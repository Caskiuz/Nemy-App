# Comandos para Replit (sin drizzle-kit)

## 🚀 Setup Inicial en Replit

```bash
# 1. Descartar archivos de Replit
git restore .agent_state_main.bin .latest.json repl_state.bin

# 2. Traer cambios de GitHub
git pull origin main

# 3. Instalar dependencias
npm install
```

## 📊 Importar Base de Datos (desde tu PC local)

### Opción A: Exportar desde Local
En tu PC ejecuta:
```bash
export-local-to-aiven.bat
```

### Opción B: Manual desde Local
```bash
# 1. Crear backup
mysqldump -u root -p137920 nemy_db_local > export.sql

# 2. Importar a Aiven
mysql -h mysql-nemy-caskiuz.h.aivencloud.com -P 13xxx -u avnadmin -p --ssl-mode=REQUIRED defaultdb < export.sql
```

## ⚙️ Configurar Secrets en Replit

Ve a **Tools > Secrets** y agrega:

```
DATABASE_URL=mysql://avnadmin:PASSWORD@mysql-nemy-caskiuz.h.aivencloud.com:13xxx/defaultdb?ssl-mode=REQUIRED
DB_HOST=mysql-nemy-caskiuz.h.aivencloud.com
DB_PORT=13xxx
DB_USER=avnadmin
DB_PASSWORD=tu_password
DB_NAME=defaultdb

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
TWILIO_VERIFY_SERVICE_SID=VA...
OPENAI_API_KEY=sk-proj-...
RESEND_API_KEY=re_...

NODE_ENV=production
PORT=5000
FRONTEND_URL=https://nemy-app.replit.app
BACKEND_URL=https://nemy-app.replit.app
```

## 🏃 Iniciar Servidor

```bash
npm run production:start
```

## ✅ Verificar

```bash
# Desde Replit Shell
curl http://localhost:5000/api/health

# Desde navegador
https://nemy-app.replit.app/api/health
```

## 🔧 Troubleshooting

### Error: "Cannot connect to database"
```bash
# Verificar conexión
mysql -h mysql-nemy-caskiuz.h.aivencloud.com -P 13xxx -u avnadmin -p --ssl-mode=REQUIRED
```

### Error: "Module not found"
```bash
npm install
```

### Ver logs
Los logs aparecen automáticamente en la consola de Replit

---

**Nota**: NO uses `npm run db:push` en Replit, la base de datos ya debe estar importada desde local.
