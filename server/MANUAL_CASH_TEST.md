## Crear Pedidos de Efectivo Manualmente

### Paso 1: Crear pedido como cliente
1. Abre la app como cliente
2. Selecciona un negocio
3. Agrega productos al carrito
4. En checkout, selecciona **"Efectivo"** como método de pago
5. Confirma el pedido

### Paso 2: Aceptar como negocio
1. Cambia a rol "business" 
2. Ve a "Pedidos" 
3. Acepta el pedido
4. Marca como "Listo para recoger"

### Paso 3: Aceptar como repartidor
1. Cambia a rol "driver"
2. Ve a "Pedidos Disponibles"
3. Acepta el pedido
4. Marca como "Recogido"
5. Marca como "Entregado" ← **AQUÍ SE PRUEBA EL ERROR**

### Usuarios existentes:
- **Drivers**: `driver-1`, `test-driver-1`
- **Businesses**: Revisa en la tabla `businesses`
- **Customers**: Cualquier usuario con role "customer"

### Para probar el error:
El error `recordCashCollection is not a function` debería aparecer en el paso 3.5 cuando marques como "Entregado" un pedido de efectivo.