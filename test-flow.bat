@echo off
echo.
echo ========================================
echo    NEMY - PRUEBA COMPLETA AUTOMATIZADA
echo ========================================
echo.

echo Verificando que el servidor este corriendo...
curl -s http://localhost:5000/api/health > nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: El servidor no esta corriendo
    echo    Ejecuta primero: npm run server:demo
    pause
    exit /b 1
)

echo ✅ Servidor detectado
echo.
echo 🚀 Ejecutando prueba completa...
echo.

node test-complete-flow.js

echo.
echo ✨ Prueba finalizada. Presiona cualquier tecla para salir...
pause > nul