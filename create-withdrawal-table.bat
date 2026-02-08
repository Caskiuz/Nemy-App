@echo off
echo ========================================
echo  NEMY - Crear Tabla de Retiros
echo ========================================
echo.

echo Ejecutando script SQL...
mysql -u root -p nemy_db_local < create-withdrawal-table.sql

echo.
echo ========================================
echo  Tabla creada exitosamente!
echo ========================================
echo.
pause
