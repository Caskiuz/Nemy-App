# Corrección: Datos Reales en Frontend y Admin Panel

## Problema
- El frontend mostraba datos mock en lugar de datos reales de la base de datos
- El panel admin mostraba 0 en todas las métricas aunque había pedidos en la BD

## Solución Implementada

### 1. Datos Reales en Base de Datos
**Archivo**: `load-real-data.sql`
- Insertados 2 pedidos: 1 entregado y 1 en tránsito
- Insertados 2 negocios: Tacos El Güero y Super Mercado Central
- Insertados 5 usuarios: 2 clientes, 2 dueños de negocio, 1 repartidor
- Insertados 3 productos
- Insertadas wallets con saldos

**Ejecutar**:
```bash
cargar-datos.bat
```

### 2. HomeScreen - Datos del Backend
**Archivo**: `client/screens/HomeScreen.tsx`

**Cambios**:
- Eliminada importación de `mockBusinesses`
- Modificada función `loadData()` para llamar a `/api/businesses`
- Agregado adaptador para convertir datos del backend al formato del frontend
- Conversión de centavos a pesos (dividir por 100)
- Conversión de rating de centavos a decimal

**Antes**:
```typescript
setBusinesses(mockBusinesses);
```

**Después**:
```typescript
const data = await apiRequest<{ businesses: any[] }>('/api/businesses');
const businessList: Business[] = rawBusinesses.map((b) => ({
  id: b.id,
  name: b.name,
  rating: (b.rating || 0) / 100, // Convertir de centavos
  deliveryFee: (b.delivery_fee || 2500) / 100, // Convertir a pesos
  // ... más campos adaptados
}));
```

### 3. FinanceService - Corrección de Columnas
**Archivo**: `server/financeService.ts`

**Cambios**:
- Corregido `customerId` a `userId` en `getUserOrders()`
- Simplificada la consulta para usar directamente la tabla orders

**Antes**:
```typescript
.where(eq(orders.customerId, userId))
```

**Después**:
```typescript
.where(eq(orders.userId, userId))
```

## Estructura de Datos

### Pedidos en BD
```sql
id: order-delivered-1
user_id: customer-1
business_id: business-1
status: delivered
total: 14500 (centavos) = $145.00 pesos
```

### Negocios en BD
```sql
id: business-1
name: Tacos El Güero
rating: 480 (centavos) = 4.80 estrellas
delivery_fee: 2500 (centavos) = $25.00 pesos
```

## Conversiones Importantes

### Centavos a Pesos
Todos los valores monetarios en la BD están en centavos:
- `total: 14500` → `$145.00`
- `delivery_fee: 2500` → `$25.00`
- `price: 6000` → `$60.00`

### Rating
El rating también está en centavos:
- `rating: 480` → `4.80 estrellas`

## Verificación

### 1. Verificar datos en BD
```bash
mysql -u root -p137920 -e "USE nemy_db_local; SELECT * FROM orders;"
mysql -u root -p137920 -e "USE nemy_db_local; SELECT * FROM businesses;"
```

### 2. Probar API
```bash
# Iniciar servidor
npm run server:demo

# En otra terminal, probar endpoints
curl http://localhost:5000/api/businesses
curl http://localhost:5000/api/admin/stats
```

### 3. Verificar Frontend
1. Iniciar app: `npm run expo:dev`
2. Abrir HomeScreen - debe mostrar "Tacos El Güero" y "Super Mercado Central"
3. Login como admin: `+52 341 456 7890` con código `1234`
4. Ver AdminScreen - debe mostrar:
   - Total Pedidos: 2
   - Pedidos Pendientes: 1 (in_transit)
   - Ingresos: $145 (del pedido entregado)

## Archivos Modificados

1. `load-real-data.sql` - Datos reales para la BD
2. `cargar-datos.bat` - Script para cargar datos
3. `client/screens/HomeScreen.tsx` - Usar API en lugar de mock
4. `server/financeService.ts` - Corregir nombres de columnas
5. `DATOS-REALES-FIX.md` - Esta documentación

## Próximos Pasos

1. Ejecutar `cargar-datos.bat` para cargar datos
2. Reiniciar servidor: `npm run server:demo`
3. Reiniciar app: `npm run expo:dev`
4. Verificar que HomeScreen muestre negocios reales
5. Verificar que AdminScreen muestre métricas correctas

## Notas Importantes

- **NO eliminar** `mockData.ts` todavía - puede ser útil para desarrollo
- Los datos mock solo se usan si la API falla
- Todos los valores monetarios deben dividirse por 100 al mostrar
- El rating debe dividirse por 100 para mostrar estrellas
