# Guía: Reiniciar Datos Financieros

## 🎯 Propósito

Reinicia el sistema económico eliminando pedidos, pagos y transacciones, pero **manteniendo** usuarios, negocios y productos para empezar de cero con el sistema financiero.

---

## ✅ Qué se MANTIENE

- ✅ **Usuarios** (clientes, negocios, repartidores, admins)
- ✅ **Negocios** (con sus configuraciones)
- ✅ **Productos** (catálogo completo)
- ✅ **Direcciones** (de usuarios)
- ✅ **Configuración del sistema**

---

## ❌ Qué se ELIMINA

- ❌ **Pedidos** (todos los orders)
- ❌ **Pagos** (payments de Stripe)
- ❌ **Transacciones** (historial de wallets)
- ❌ **Retiros** (withdrawals)
- ❌ **Reseñas** (reviews)
- 🔄 **Wallets** (se resetean a $0)
- 🔄 **Ratings** (se resetean a 0)

---

## 🚀 Cómo Usar

### Opción 1: Script Batch (Recomendado)

```bash
# Desde la raíz del proyecto
reset-financial-data.bat
```

El script te pedirá confirmación antes de ejecutar.

### Opción 2: Comando Directo

```bash
cd server
npx ts-node resetFinancialData.ts
```

### Opción 3: Desde la API (Super Admin)

```bash
curl -X POST http://localhost:5000/api/admin/reset-financial-data \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN"
```

---

## 📋 Proceso Paso a Paso

1. **Confirmación**: El script pide confirmación
2. **Elimina pedidos**: Borra todos los orders
3. **Elimina pagos**: Borra payments de Stripe
4. **Elimina transacciones**: Borra historial de wallets
5. **Resetea wallets**: Pone todos los balances en $0
6. **Elimina retiros**: Borra withdrawal requests
7. **Elimina reseñas**: Borra reviews
8. **Resetea ratings**: Pone ratings de negocios en 0

---

## 🎯 Casos de Uso

### 1. Testing del Sistema Económico
```bash
# Resetear datos
reset-financial-data.bat

# Hacer primer pedido de prueba
# Verificar que las comisiones se calculan bien
# Verificar que las wallets se actualizan correctamente
```

### 2. Demo para Clientes
```bash
# Resetear antes de la demo
reset-financial-data.bat

# Mostrar flujo completo desde cero
# Cliente hace pedido → Negocio acepta → Repartidor entrega → Dinero se distribuye
```

### 3. Auditoría del Sistema
```bash
# Resetear datos
reset-financial-data.bat

# Ejecutar auditoría inicial
npx ts-node testFinancialAudit.ts

# Hacer pedidos de prueba
# Ejecutar auditoría final
npx ts-node testFinancialAudit.ts
```

---

## ⚠️ ADVERTENCIAS

### 🚨 NO usar en producción
Este script es para **desarrollo y testing únicamente**.

### 🚨 Hacer backup antes
```bash
# Backup de la base de datos
mysqldump -u root -p nemy_db_local > backup_antes_reset.sql
```

### 🚨 Verificar después
```bash
# Ejecutar auditoría después del reset
cd server
npx ts-node testFinancialAudit.ts
```

---

## 🔍 Verificación Post-Reset

### 1. Verificar Wallets
```sql
SELECT userId, balance, totalEarned, totalWithdrawn 
FROM wallets;
-- Todos deben estar en 0
```

### 2. Verificar Pedidos
```sql
SELECT COUNT(*) FROM orders;
-- Debe ser 0
```

### 3. Verificar Transacciones
```sql
SELECT COUNT(*) FROM transactions;
-- Debe ser 0
```

### 4. Verificar Usuarios (deben existir)
```sql
SELECT id, name, role FROM users;
-- Deben estar todos los usuarios
```

### 5. Verificar Negocios (deben existir)
```sql
SELECT id, name, isActive FROM businesses;
-- Deben estar todos los negocios
```

---

## 🎯 Flujo Recomendado para Testing

```bash
# 1. Resetear datos
reset-financial-data.bat

# 2. Verificar estado inicial
cd server
npx ts-node testFinancialAudit.ts

# 3. Iniciar servidor
npm run server:demo

# 4. Hacer primer pedido desde la app
# - Cliente: customer@nemy.com
# - Negocio: Tacos El Güero
# - Método: Tarjeta

# 5. Negocio acepta pedido

# 6. Asignar repartidor

# 7. Repartidor entrega

# 8. Verificar distribución de dinero
npx ts-node testFinancialAudit.ts

# 9. Verificar wallets
curl http://localhost:5000/api/test-wallet/[BUSINESS_ID]
curl http://localhost:5000/api/test-wallet/[DRIVER_ID]
```

---

## 📊 Ejemplo de Salida

```
🔄 Reiniciando datos financieros y pedidos...

📦 Eliminando pedidos...
   ✅ Pedidos eliminados
💳 Eliminando pagos...
   ✅ Pagos eliminados
💰 Eliminando transacciones...
   ✅ Transacciones eliminadas
👛 Reseteando wallets...
   ✅ Wallets reseteados a $0
🏦 Eliminando retiros...
   ✅ Retiros eliminados
⭐ Eliminando reseñas...
   ✅ Reseñas eliminadas
📊 Reseteando ratings de negocios...
   ✅ Ratings reseteados

============================================================
✅ REINICIO COMPLETADO
============================================================

📋 Estado actual:
   ✅ Usuarios: MANTENIDOS
   ✅ Negocios: MANTENIDOS
   ✅ Productos: MANTENIDOS
   ✅ Direcciones: MANTENIDAS
   ❌ Pedidos: ELIMINADOS
   ❌ Pagos: ELIMINADOS
   ❌ Transacciones: ELIMINADAS
   🔄 Wallets: RESETEADOS A $0
   ❌ Retiros: ELIMINADOS
   ❌ Reseñas: ELIMINADAS

🎯 Sistema listo para primeros pedidos y entregas
============================================================
```

---

## 🆘 Troubleshooting

### Error: "Cannot delete orders - foreign key constraint"
```bash
# Desactivar temporalmente las foreign keys
mysql -u root -p nemy_db_local
SET FOREIGN_KEY_CHECKS = 0;
# Ejecutar el script
SET FOREIGN_KEY_CHECKS = 1;
```

### Error: "Wallets not found"
```bash
# Recrear wallets si es necesario
cd server
npx ts-node createWallets.ts
```

### Restaurar desde backup
```bash
mysql -u root -p nemy_db_local < backup_antes_reset.sql
```

---

**Hecho con ❤️ para NEMY**
