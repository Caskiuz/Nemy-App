@echo off
echo ========================================
echo NEMY - Reinicio de Datos Financieros
echo ========================================
echo.
echo ADVERTENCIA: Este script eliminara:
echo   - Todos los pedidos
echo   - Todos los pagos
echo   - Todas las transacciones
echo   - Todos los retiros
echo   - Todas las resenas
echo   - Reseteara wallets a $0
echo.
echo MANTENDRA:
echo   - Usuarios
echo   - Negocios
echo   - Productos
echo   - Direcciones
echo.
set /p confirm="Estas seguro? (S/N): "
if /i not "%confirm%"=="S" (
    echo Operacion cancelada.
    pause
    exit /b
)

echo.
echo Ejecutando reinicio...
cd server
npx tsx resetFinancialDataDirect.ts

echo.
echo ========================================
echo Proceso completado
echo ========================================
pause
