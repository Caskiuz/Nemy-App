@echo off
echo ========================================
echo   SINCRONIZAR FONDOS - SQL DIRECTO
echo ========================================
echo.
echo Este script ejecutara SQL directo en MySQL
echo para liberar fondos de pedidos entregados.
echo.
echo Credenciales: root / 137920
echo Base de datos: nemy_db_local
echo.
pause

echo.
echo Ejecutando script SQL...
echo.

mysql -u root -p137920 nemy_db_local < sync-funds.sql

echo.
echo ========================================
echo   SINCRONIZACION COMPLETADA
echo ========================================
echo.
echo Revisa los resultados arriba.
echo.
pause
