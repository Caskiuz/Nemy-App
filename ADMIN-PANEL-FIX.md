# 🔧 SOLUCIÓN: Panel Admin Mostrando Ceros

## 🚨 Problema
El panel admin muestra todos los números en 0 aunque haya datos de ejemplo.

## ✅ Solución
Necesitas cargar datos de ejemplo en la base de datos MySQL.

## 📋 Pasos para Solucionarlo

### Opción 1: Script Automático (Recomendado)
```bash
# Ejecuta el script de carga de datos
load-demo-data.bat
```

### Opción 2: Manual en MySQL
1. Abre MySQL Workbench o tu cliente MySQL preferido
2. Conéctate a tu base de datos local
3. Ejecuta el archivo: `load-demo-simple.sql`

```sql
-- En MySQL Workbench o línea de comandos:
SOURCE load-demo-simple.sql;
```

### Opción 3: Línea de Comandos
```bash
# Desde la carpeta del proyecto
mysql -u root -p nemy_db_local < load-demo-simple.sql
```

## 🎯 Datos que se Cargarán

### 👥 Usuarios (8 usuarios)
- **Clientes**: 2 usuarios
- **Dueños de Negocio**: 2 usuarios  
- **Repartidores**: 2 usuarios
- **Administradores**: 2 usuarios

### 🏪 Negocios (5 negocios)
- Tacos El Güero
- Pizza Napoli
- Café Central
- Mercado San Juan
- Sushi Zen (pausado)

### 🍕 Productos (12 productos)
- Variedad de comida mexicana, pizza, café y mercado

### 📦 Pedidos (10 pedidos)
- Estados: entregados, pendientes, en camino, confirmados, cancelados
- Ingresos totales: ~$650 pesos

### 💰 Billeteras
- Saldos realistas para negocios y repartidores

## 📱 Teléfonos de Prueba

Después de cargar los datos, usa estos teléfonos para hacer login:

| Rol | Teléfono | Código SMS |
|-----|----------|------------|
| 👤 Cliente | +52 341 123 4567 | 1234 |
| 🏪 Dueño de Negocio | +52 341 234 5678 | 1234 |
| 🚗 Repartidor | +52 341 345 6789 | 1234 |
| 👨‍💼 Admin | +52 341 456 7890 | 1234 |
| 👑 Super Admin | +52 341 567 8901 | 1234 |

## 🔍 Verificar que Funcionó

1. Inicia el servidor: `npm run server:dev`
2. Inicia la app: `npm run expo:dev`
3. Haz login como Admin: `+52 341 456 7890` (código: 1234)
4. Ve al panel admin y verifica que muestre números reales

### Números que Deberías Ver:
- **Total Usuarios**: 8
- **Total Pedidos**: 10
- **Ingresos Totales**: ~$650
- **Pedidos Pendientes**: 1
- **Pedidos Completados**: 5
- **Negocios Activos**: 4
- **Repartidores**: 2

## 🚨 Si Aún Muestra Ceros

1. Verifica que la base de datos `nemy_db_local` existe
2. Verifica que las tablas se crearon correctamente
3. Ejecuta el script de nuevo
4. Reinicia el servidor backend
5. Revisa los logs del servidor para errores

## 🔧 Comandos de Verificación

```sql
-- Verificar datos en MySQL
USE nemy_db_local;
SELECT COUNT(*) as usuarios FROM users;
SELECT COUNT(*) as negocios FROM businesses;
SELECT COUNT(*) as productos FROM products;
SELECT COUNT(*) as pedidos FROM orders;
SELECT SUM(total)/100 as ingresos_pesos FROM orders WHERE status = 'delivered';
```

## 📞 Soporte

Si sigues teniendo problemas:
1. Verifica que MySQL esté corriendo
2. Verifica las variables de entorno en `.env.local`
3. Revisa los logs del servidor backend
4. Asegúrate de que las rutas de admin estén funcionando

¡Ahora tu panel admin debería mostrar números reales! 🎉