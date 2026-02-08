@echo off
echo ========================================
echo Sincronizando Ganancias de Drivers
echo ========================================
echo.
echo Este script sincronizara las ganancias de todos
echo los pedidos completados que no tengan transacciones.
echo.
pause

cd server
npx tsx syncDriverEarnings.ts

echo.
echo ========================================
echo Sincronizacion completada
echo ========================================
echo.
echo Verifica tu wallet en la app para ver las ganancias.
echo.
pause
