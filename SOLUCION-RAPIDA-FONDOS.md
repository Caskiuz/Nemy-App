# 🚨 SOLUCIÓN RÁPIDA - FONDOS EN $0

## OPCIÓN 1: Usar el Endpoint de Admin (MÁS FÁCIL)

### Paso 1: Iniciar sesión como Admin
```
Usuario: admin@nemy.com
Password: password
```

### Paso 2: Ejecutar sincronización
Desde Postman o curl:

```bash
curl -X POST http://localhost:5000/api/admin/sync-data \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -H "Content-Type: application/json"
```

O desde el navegador (si tienes sesión de admin):
```
POST http://localhost:5000/api/admin/sync-data
```

### Resultado:
```json
{
  "success": true,
  "message": "Sincronización completada",
  "processed": 5,
  "errors": 0,
  "total": 5
}
```

---

## OPCIÓN 2: Ejecutar Script SQL

### Paso 1: Abrir MySQL
```bash
mysql -u root -p nemy_db_local
```

### Paso 2: Ejecutar estos comandos:

```sql
-- 1. Calcular comisiones
UPDATE orders 
SET 
  platformFee = FLOOR(total * 0.15),
  businessEarnings = total - FLOOR(total * 0.15) - FLOOR(total * 0.15),
  deliveryEarnings = FLOOR(total * 0.15)
WHERE status = 'delivered' 
  AND (platformFee IS NULL OR businessEarnings IS NULL);

-- 2. Crear/actualizar wallet del repartidor
-- Reemplaza 'TU_USER_ID' con tu ID real
INSERT INTO wallets (userId, balance, pendingBalance, totalEarned, totalWithdrawn)
SELECT 
  'TU_USER_ID',
  COALESCE(SUM(deliveryEarnings), 0),
  0,
  COALESCE(SUM(deliveryEarnings), 0),
  0
FROM orders
WHERE deliveryPersonId = 'TU_USER_ID' 
  AND status = 'delivered'
ON DUPLICATE KEY UPDATE
  balance = balance + VALUES(balance),
  totalEarned = totalEarned + VALUES(balance);

-- 3. Verificar
SELECT * FROM wallets WHERE userId = 'TU_USER_ID';
```

---

## OPCIÓN 3: Desde el Panel de Admin

### Paso 1: Ir al panel de admin
```
http://localhost:8081/admin
```

### Paso 2: Buscar "Sincronizar Datos"

### Paso 3: Click en "Sincronizar Fondos"

---

## 🔍 VERIFICAR QUE FUNCIONÓ

### Ver tu wallet:
```sql
SELECT 
  w.balance,
  w.totalEarned,
  COUNT(o.id) as pedidos_entregados,
  SUM(o.deliveryEarnings) as total_deberia_tener
FROM wallets w
LEFT JOIN orders o ON o.deliveryPersonId = w.userId AND o.status = 'delivered'
WHERE w.userId = 'TU_USER_ID'
GROUP BY w.id;
```

### Ver transacciones:
```sql
SELECT * FROM transactions 
WHERE userId = 'TU_USER_ID' 
ORDER BY createdAt DESC;
```

---

## ❓ SI AÚN NO FUNCIONA

### Verifica:
1. ¿Los pedidos están en status "delivered"?
   ```sql
   SELECT id, status, deliveryPersonId FROM orders WHERE deliveryPersonId = 'TU_USER_ID';
   ```

2. ¿Tienes deliveryPersonId asignado?
   ```sql
   SELECT COUNT(*) FROM orders WHERE deliveryPersonId = 'TU_USER_ID' AND status = 'delivered';
   ```

3. ¿Existe tu wallet?
   ```sql
   SELECT * FROM wallets WHERE userId = 'TU_USER_ID';
   ```

---

## 📞 ÚLTIMA OPCIÓN

Si nada funciona, ejecuta esto para crear fondos manualmente:

```sql
-- Reemplaza 'TU_USER_ID' y el monto
INSERT INTO wallets (userId, balance, pendingBalance, totalEarned, totalWithdrawn)
VALUES ('TU_USER_ID', 8100, 0, 8100, 0)
ON DUPLICATE KEY UPDATE
  balance = 8100,
  totalEarned = 8100;
```

---

**IMPORTANTE:** La forma más fácil es usar el endpoint `/admin/sync-data` desde Postman o el panel de admin.
