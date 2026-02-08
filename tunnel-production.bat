@echo off
echo ========================================
echo   NEMY - Tunnel para APK Produccion
echo ========================================
echo.

echo [1/2] Iniciando backend en puerto 5000...
start "NEMY Backend" cmd /k "npm run server:demo"

timeout /t 5 /nobreak >nul

echo.
echo [2/2] Creando tunnel publico...
echo.
cloudflared tunnel --url http://localhost:5000

pause
