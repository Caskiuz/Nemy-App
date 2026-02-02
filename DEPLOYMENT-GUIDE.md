# NEMY - Guía de Deployment a Producción

## 📋 Pre-requisitos

- Servidor con Node.js 18+ y MySQL 8.0+
- Dominio configurado (ej: api.nemy.mx)
- Certificado SSL/HTTPS
- Cuentas de Stripe y Twilio en modo producción

## 🚀 Deployment Paso a Paso

### 1. Preparar Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MySQL
sudo apt install -y mysql-server

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar Nginx (para reverse proxy)
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Configurar MySQL

```bash
# Acceder a MySQL
sudo mysql

# Crear base de datos y usuario
CREATE DATABASE nemy_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'nemy_prod'@'localhost' IDENTIFIED BY 'SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON nemy_production.* TO 'nemy_prod'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Clonar y Configurar Proyecto

```bash
# Crear directorio
sudo mkdir -p /var/www/nemy
cd /var/www/nemy

# Clonar proyecto (o subir archivos)
git clone YOUR_REPO_URL .

# Instalar dependencias
npm install

# Instalar PM2
npm install pm2 -g
```

### 4. Configurar Variables de Entorno

```bash
# Crear archivo .env.production
nano .env.production
```

Contenido del archivo:

```env
# Base de Datos
DATABASE_URL=mysql://nemy_prod:SECURE_PASSWORD@localhost:3306/nemy_production
DB_HOST=localhost
DB_PORT=3306
DB_USER=nemy_prod
DB_PASSWORD=SECURE_PASSWORD
DB_NAME=nemy_production

# Stripe (PRODUCCIÓN)
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Twilio (PRODUCCIÓN)
TWILIO_ACCOUNT_SID=AC_YOUR_PRODUCTION_SID
TWILIO_AUTH_TOKEN=YOUR_PRODUCTION_TOKEN
TWILIO_PHONE_NUMBER=+52_YOUR_MEXICAN_NUMBER
TWILIO_VERIFY_SERVICE_SID=VA_YOUR_SERVICE_SID
TWILIO_STUDIO_FLOW_SID=FW_YOUR_FLOW_SID

# OpenAI
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY

# Resend
RESEND_API_KEY=re_YOUR_RESEND_KEY

# Aplicación
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://app.nemy.mx
BACKEND_URL=https://api.nemy.mx

# Seguridad
JWT_SECRET=GENERATE_SECURE_32_CHAR_SECRET
ENCRYPTION_KEY=GENERATE_SECURE_32_CHAR_KEY

# Comisiones (configurables desde admin)
PLATFORM_COMMISSION_RATE=0.15
BUSINESS_COMMISSION_RATE=0.70
DELIVERY_COMMISSION_RATE=0.15
```

### 5. Aplicar Schema de Base de Datos

```bash
# Aplicar migraciones
npm run db:push

# Verificar tablas
mysql -u nemy_prod -p nemy_production -e "SHOW TABLES;"
```

### 6. Configurar Nginx

```bash
# Crear configuración
sudo nano /etc/nginx/sites-available/nemy-api
```

Contenido:

```nginx
server {
    listen 80;
    server_name api.nemy.mx;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Webhook endpoint (raw body)
    location /api/webhooks/stripe {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # No buffering for webhooks
        proxy_buffering off;
        proxy_request_buffering off;
    }

    client_max_body_size 10M;
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/nemy-api /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 7. Configurar SSL con Let's Encrypt

```bash
# Obtener certificado
sudo certbot --nginx -d api.nemy.mx

# Verificar renovación automática
sudo certbot renew --dry-run
```

### 8. Iniciar Aplicación con PM2

```bash
# Iniciar con PM2
npm run pm2:start

# Verificar estado
pm2 status

# Ver logs
pm2 logs

# Configurar inicio automático
pm2 startup
pm2 save
```

### 9. Configurar Webhooks de Stripe

1. Ir a Stripe Dashboard → Developers → Webhooks
2. Agregar endpoint: `https://api.nemy.mx/api/webhooks/stripe`
3. Seleccionar eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `account.updated`
   - `charge.refunded`
   - `transfer.created`
   - `transfer.failed`
   - `payout.paid`
   - `payout.failed`
4. Copiar el webhook secret y actualizar `.env.production`

### 10. Configurar Backup Automático

```bash
# Crear script de backup
sudo nano /usr/local/bin/nemy-backup.sh
```

Contenido:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/nemy"
mkdir -p $BACKUP_DIR

# Backup MySQL
mysqldump -u nemy_prod -pSECURE_PASSWORD nemy_production | gzip > $BACKUP_DIR/nemy_$DATE.sql.gz

# Mantener solo últimos 30 días
find $BACKUP_DIR -name "nemy_*.sql.gz" -mtime +30 -delete

echo "Backup completed: nemy_$DATE.sql.gz"
```

```bash
# Dar permisos
sudo chmod +x /usr/local/bin/nemy-backup.sh

# Configurar cron (diario a las 2 AM)
sudo crontab -e
```

Agregar:
```
0 2 * * * /usr/local/bin/nemy-backup.sh >> /var/log/nemy-backup.log 2>&1
```

## 🔧 Comandos Útiles

### PM2
```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs

# Reiniciar
pm2 restart all

# Detener
pm2 stop all

# Monitoreo
pm2 monit
```

### MySQL
```bash
# Backup manual
mysqldump -u nemy_prod -p nemy_production > backup.sql

# Restore
mysql -u nemy_prod -p nemy_production < backup.sql

# Ver tablas
mysql -u nemy_prod -p nemy_production -e "SHOW TABLES;"
```

### Nginx
```bash
# Verificar configuración
sudo nginx -t

# Reiniciar
sudo systemctl restart nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
```

## 📊 Monitoreo

### Logs
```bash
# Logs de PM2
pm2 logs

# Logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs de aplicación
tail -f /var/www/nemy/logs/api-out.log
tail -f /var/www/nemy/logs/api-error.log
```

### Métricas
```bash
# CPU y memoria
pm2 monit

# Espacio en disco
df -h

# Conexiones MySQL
mysql -u nemy_prod -p -e "SHOW PROCESSLIST;"
```

## 🚨 Troubleshooting

### Aplicación no inicia
```bash
# Ver logs
pm2 logs

# Verificar variables de entorno
pm2 env 0

# Reiniciar
pm2 restart all
```

### Error de base de datos
```bash
# Verificar conexión
mysql -u nemy_prod -p nemy_production

# Verificar permisos
mysql -u root -p -e "SHOW GRANTS FOR 'nemy_prod'@'localhost';"
```

### Webhooks no funcionan
1. Verificar URL en Stripe Dashboard
2. Verificar webhook secret en `.env.production`
3. Ver logs: `pm2 logs nemy-api`
4. Probar con Stripe CLI: `stripe listen --forward-to https://api.nemy.mx/api/webhooks/stripe`

## ✅ Checklist Final

- [ ] MySQL configurado y funcionando
- [ ] Variables de entorno de producción configuradas
- [ ] Schema de base de datos aplicado
- [ ] Nginx configurado con SSL
- [ ] PM2 iniciado y configurado para auto-start
- [ ] Webhooks de Stripe configurados
- [ ] Backup automático configurado
- [ ] Logs funcionando correctamente
- [ ] Prueba de pago real exitosa
- [ ] Prueba de retiro exitosa
- [ ] Panel admin accesible

## 🎯 Post-Deployment

1. Crear usuario super admin
2. Configurar comisiones desde admin panel
3. Onboarding de primer negocio
4. Onboarding de primer repartidor
5. Prueba de pedido completo end-to-end
6. Configurar monitoreo de uptime
7. Configurar alertas de errores

---

**¡Listo para producción!** 🚀
