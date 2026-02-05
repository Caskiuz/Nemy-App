@echo off
echo ========================================
echo   SINCRONIZAR FONDOS DE PEDIDOS
echo ========================================
echo.
echo Este script liberara los fondos de pedidos
echo entregados que no fueron procesados.
echo.
pause

echo.
echo Ejecutando sincronizacion...
echo.

npx tsx scripts/sync-delivered-orders.ts

echo.
echo ========================================
echo   SINCRONIZACION COMPLETADA
echo ========================================
echo.
pause
