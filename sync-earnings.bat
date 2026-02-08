@echo off
echo ========================================
echo Sincronizando Ganancias de Drivers (SQL)
echo ========================================
echo.

mysql -u root -p137920 < sync-driver-earnings.sql

echo.
echo ========================================
echo Sincronizacion completada
echo ========================================
echo.
echo Verifica tu wallet en la app.
echo.
pause
