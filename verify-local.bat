@echo off
echo ========================================
echo   VERIFICACION COMPLETA - LOCAL
echo ========================================
echo.

echo [1/5] Verificando backend...
curl http://localhost:5000/api/health
echo.

echo.
echo [2/5] Verificando pedidos ready...
mysql -u root -p137920 nemy_db_local -e "SELECT id, status, delivery_person_id, business_name FROM orders WHERE status = 'ready' AND delivery_person_id IS NULL LIMIT 5;"

echo.
echo [3/5] Verificando repartidor online...
mysql -u root -p137920 nemy_db_local -e "SELECT user_id, is_available, current_latitude, current_longitude FROM delivery_drivers WHERE user_id = 'driver-1';"

echo.
echo [4/5] Verificando endpoint de pedidos disponibles...
echo (Necesitas token de repartidor para probar)

echo.
echo [5/5] RESUMEN:
echo ✓ Backend debe estar en http://localhost:5000
echo ✓ Debe haber pedidos en status 'ready'
echo ✓ Repartidor debe estar is_available = 1
echo ✓ Repartidor debe tener ubicación
echo.
pause
