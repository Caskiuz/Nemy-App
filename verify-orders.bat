@echo off
echo ========================================
echo   NEMY - Verificar Pedidos en BD
echo ========================================
echo.

SET AIVEN_HOST=nemydb-rijarwow-c949.l.aivencloud.com
SET AIVEN_PORT=21209
SET AIVEN_USER=avnadmin
SET AIVEN_PASSWORD=
SET AIVEN_DB=defaultdb

echo [1/5] Verificando pedidos totales...
set /p AIVEN_PASSWORD="Aiven password: "
mysql -h %AIVEN_HOST% -P %AIVEN_PORT% -u %AIVEN_USER% -p%AIVEN_PASSWORD% --ssl-mode=REQUIRED %AIVEN_DB% -e "SELECT COUNT(*) as total_pedidos FROM orders;"

echo.
echo [2/5] Verificando pedidos por estado...
mysql -h %AIVEN_HOST% -P %AIVEN_PORT% -u %AIVEN_USER% -p%AIVEN_PASSWORD% --ssl-mode=REQUIRED %AIVEN_DB% -e "SELECT status, COUNT(*) as cantidad FROM orders GROUP BY status;"

echo.
echo [3/5] Verificando repartidores...
mysql -h %AIVEN_HOST% -P %AIVEN_PORT% -u %AIVEN_USER% -p%AIVEN_PASSWORD% --ssl-mode=REQUIRED %AIVEN_DB% -e "SELECT u.id, u.name, u.phone, u.role FROM users u WHERE u.role = 'delivery_driver';"

echo.
echo [4/5] Verificando pedidos con repartidor asignado...
mysql -h %AIVEN_HOST% -P %AIVEN_PORT% -u %AIVEN_USER% -p%AIVEN_PASSWORD% --ssl-mode=REQUIRED %AIVEN_DB% -e "SELECT o.id, o.status, o.deliveryPersonId, u.name as repartidor, o.businessName, o.total, o.createdAt FROM orders o LEFT JOIN users u ON o.deliveryPersonId = u.id WHERE o.deliveryPersonId IS NOT NULL ORDER BY o.createdAt DESC LIMIT 10;"

echo.
echo [5/5] Verificando pedidos SIN repartidor...
mysql -h %AIVEN_HOST% -P %AIVEN_PORT% -u %AIVEN_USER% -p%AIVEN_PASSWORD% --ssl-mode=REQUIRED %AIVEN_DB% -e "SELECT id, status, businessName, total, createdAt FROM orders WHERE deliveryPersonId IS NULL ORDER BY createdAt DESC LIMIT 10;"

echo.
echo ========================================
echo   Verificacion completada
echo ========================================
echo.
echo Si no hay pedidos con repartidor asignado,
echo ejecuta: assign-test-order.bat
echo.
pause
