@echo off
echo ========================================
echo NEMY - Reinicio de Datos Financieros
echo ========================================
echo.
echo ADVERTENCIA: Esto eliminara pedidos, pagos y transacciones
echo.
set /p confirm="Continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo Cancelado.
    pause
    exit /b
)

echo.
echo Ejecutando...
mysql -u root -p nemy_db_local < reset-financial-data.sql

echo.
echo ========================================
echo Completado
echo ========================================
pause
