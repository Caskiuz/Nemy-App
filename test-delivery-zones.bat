@echo off
echo Probando endpoint de zonas de entrega...
echo.

echo 1. Probando endpoint publico /api/delivery-zones
curl -X GET http://localhost:5000/api/delivery-zones
echo.
echo.

echo 2. Probando endpoint admin /api/admin/delivery-zones (requiere autenticacion)
echo Nota: Este endpoint requiere token de admin
echo.

echo Las zonas de entrega ahora se obtienen dinamicamente de la base de datos MySQL
echo Tabla: delivery_zones
echo Campos: id, name, description, deliveryFee, maxDeliveryTime, centerLatitude, centerLongitude, radiusKm, isActive
echo.

pause