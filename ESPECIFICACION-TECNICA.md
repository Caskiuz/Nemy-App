# NEMY – Especificación Técnica para Producción

## 1. Resumen Ejecutivo

NEMY (del náhuatl "vivir") es una Progressive Web App (PWA) de entrega de comida y productos de mercado para Autlán, México.

Es una plataforma multi-rol que conecta negocios locales, clientes y repartidores mediante:
- Sistema de pagos automáticos
- Verificación por teléfono
- Logística inteligente en tiempo real

El sistema ya se encuentra avanzado a nivel funcional. El objetivo actual es llevar la plataforma a producción real, robustecer pagos, seguridad y estabilidad general.

## 2. Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React Native + Expo (PWA) |
| Backend | Express.js + TypeScript |
| Base de datos | **MySQL + Drizzle ORM** |
| Autenticación | Phone-only (Twilio Verify SMS) + Biométrico |
| Pagos | Stripe (PaymentIntents, SetupIntents, Connect) |
| SMS | Twilio Verify API (códigos de 4 dígitos) |
| Llamadas automáticas | Twilio Studio Flows |
| Emails | Resend |
| Chat IA | OpenAI GPT para soporte |

## 3. Modelo de Datos (MySQL)

El sistema cuenta con 26 tablas organizadas en módulos:

### Usuarios y Autenticación
- Autenticación por teléfono
- Soporte biométrico
- Roles múltiples
- Integración con Stripe

### Negocios
- Control de carga
- Modo saturado
- Zonas de entrega
- Estado operativo
- Destacados

### Productos
- Soporte para productos por peso
- Control rápido de agotado (Menú 86)

### Pedidos (tabla central)
Incluye:
- Sustituciones
- Cancelaciones con penalización
- Pago en efectivo con cálculo de cambio
- Cronómetro de arrepentimiento (60s)
- Llamadas automáticas a negocios

### Sistema Financiero
- Wallets internas
- Comisiones automáticas
- Retiros
- Retención anti-fraude de fondos

### Repartidores
- Ubicación en tiempo real
- Asignación automática
- Sistema de strikes

### Disputas y Problemas
- Reportes con fotos
- Reembolsos
- Resoluciones administrativas

### Otros módulos
- Cupones
- Soporte
- Reseñas
- Pedidos programados
- Carnaval 2026
- Logs de seguridad

## 4. Flujos Críticos

### Autenticación
- Phone-only con Twilio Verify
- Login biométrico opcional

### Flujo de Pedido
```
Creación → Confirmación → Preparación → Asignación → Entrega → Cobro automático → Liberación de fondos
```

### Sistema de Comisiones
Distribución por defecto:
- Plataforma: 15%
- Negocio: 70%
- Repartidor: 15%

### Cancelaciones
- Reglas dinámicas según etapa del pedido

### Logística Inteligente
- Asignación automática por cercanía
- Modo saturado
- Menú 86
- Llamadas automáticas

## 5. APIs Críticas

- Autenticación
- Pedidos
- Pagos Stripe
- Negocios
- Repartidores
- Panel admin con métricas en tiempo real

## 6. Integraciones Externas

- **Twilio** (SMS + llamadas)
- **Stripe** (pagos + Connect)
- **Resend** (emails)
- **OpenAI** (chat soporte)

## 7. Seguridad Implementada

- Rate limiting
- Bloqueo por IP
- Auditoría de acciones admin
- Retención anti-fraude
- Sistema de strikes
- Cumplimiento PCI mediante Stripe

## 8. Jobs en Segundo Plano

- Monitoreo de pedidos pendientes
- Liberación de fondos retenidos
- Limpieza de strikes
- Desactivación de repartidores inactivos

## 9. Base de Datos MySQL

### Configuración de Producción
```env
DATABASE_URL=mysql://user:password@host:3306/nemy_production
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=nemy_user
DB_PASSWORD=secure_password
DB_NAME=nemy_production
```

### Características
- Motor: InnoDB
- Charset: utf8mb4
- Collation: utf8mb4_unicode_ci
- Timezone: UTC

### Backup
- Backup diario automático
- Retención: 30 días
- Backup antes de cada deploy

## 10. Checklist para Producción

### Infraestructura
- [ ] Servidor backend configurado
- [ ] MySQL en producción configurado
- [ ] HTTPS configurado
- [ ] Dominio configurado
- [ ] CDN para assets estáticos

### Pagos y Finanzas
- [ ] Stripe Connect completamente integrado
- [ ] Webhooks configurados y verificados
- [ ] Comisiones automáticas funcionando
- [ ] Sistema de wallets operativo
- [ ] Liberación de fondos automatizada
- [ ] Pruebas con tarjetas reales

### Seguridad
- [ ] Variables de entorno de producción
- [ ] Rate limiting ajustado
- [ ] Validación de roles en todos los endpoints
- [ ] Logs de auditoría activos
- [ ] Backup automático configurado

### Operaciones
- [ ] Asignación automática de repartidores
- [ ] Llamadas automáticas funcionando
- [ ] Reglas de cancelación validadas
- [ ] Modo saturado/Menú 86 operativo
- [ ] Jobs en background supervisados (PM2)

### Testing
- [ ] Pruebas E2E completadas
- [ ] Pruebas de carga realizadas
- [ ] Validación con usuarios beta
- [ ] Monitoreo y alertas configurados

## 11. Objetivo del Desarrollador

El desarrollador deberá:

### Pagos y Finanzas
- Revisar y completar integración de Stripe Connect
- Asegurar automatización de comisiones
- Garantizar funcionamiento de webhooks
- Validar flujo de pagos en producción
- Verificar sistema de wallets y liberación de fondos

### Seguridad y Backend
- Revisar validaciones de roles y permisos
- Auditar endpoints críticos
- Asegurar protección contra abuso

### Operación General
- Revisar asignación automática de repartidores
- Validar llamadas automáticas a negocios
- Verificar reglas de cancelación
- Revisar manejo de productos agotados y modo saturado

### Calidad y Estabilidad
- Revisar toda la aplicación (frontend y backend)
- Detectar y corregir errores lógicos y de flujo
- Garantizar la ausencia de bugs críticos
- Asegurar que todos los flujos funcionen correctamente en producción

## 12. Perfil Requerido

- Experiencia comprobable en Stripe Connect
- Backend Node.js en producción
- Experiencia con MySQL en producción
- Manejo de webhooks y seguridad de pagos
- Experiencia en plataformas marketplace o delivery

---

**Este documento describe la base del sistema.**

El desarrollador deberá analizar el código actual y asegurar que la aplicación quede lista para operar con usuarios reales, pagos reales y alta estabilidad.

## 13. Comandos Útiles

### Desarrollo
```bash
npm run server:demo      # Servidor demo con CORS dinámico
npm run expo:dev         # Frontend en desarrollo
npm run db:push          # Aplicar cambios de schema a MySQL
```

### Producción
```bash
npm run server:prod      # Servidor en producción
npm run server:build     # Build del servidor
npm run production:start # Iniciar en producción
```

### Base de Datos
```bash
# Backup
mysqldump -u user -p nemy_production > backup.sql

# Restore
mysql -u user -p nemy_production < backup.sql

# Migraciones
npm run db:push
```
