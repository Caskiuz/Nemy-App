@echo off
echo ========================================
echo   NEMY - Build APK para Produccion
echo   Backend: https://nemy-app.replit.app
echo ========================================
echo.

REM Configurar variable de entorno para el build
set EXPO_PUBLIC_BACKEND_URL=https://nemy-app.replit.app

echo [1/4] Configurando backend URL...
echo Backend URL: %EXPO_PUBLIC_BACKEND_URL%

echo.
echo [2/2] Iniciando build de APK...
echo Este proceso puede tardar 10-15 minutos...
echo.
call npx eas build --platform android --profile production

echo.
echo [COMPLETADO] Build finalizado!
echo.
echo Descarga el APK desde: https://expo.dev/accounts/rijarwow/projects/nemy-app/builds
echo.
pause
