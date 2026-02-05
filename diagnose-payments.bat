@echo off
echo ========================================
echo   DIAGNOSTICO DE PAGOS Y WALLETS
echo ========================================
echo.
echo Este script revisara el estado de:
echo - Pedidos entregados
echo - Wallets y balances
echo - Transacciones
echo.
pause

echo.
echo Ejecutando diagnostico...
echo.

npx tsx scripts/diagnose-payments.ts

echo.
pause
