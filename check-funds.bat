@echo off
echo ========================================
echo   DIAGNOSTICO DE FONDOS
echo ========================================
echo.
echo Revisando estado de pedidos y wallets...
echo.

mysql -u root -p137920 nemy_db_local < check-funds.sql

echo.
echo ========================================
echo   DIAGNOSTICO COMPLETADO
echo ========================================
echo.
pause
