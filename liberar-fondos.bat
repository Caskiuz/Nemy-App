@echo off
echo ========================================
echo LIBERAR FONDOS DE PEDIDOS ENTREGADOS
echo ========================================
echo.
echo Procesando...
echo.

mysql -u root -p137920 nemy_db_local < liberar-fondos.sql

echo.
echo ========================================
echo COMPLETADO
echo ========================================
echo.
echo Fondos liberados. Verifica tu wallet en la app.
echo.
pause
