@echo off
echo ========================================
echo   NEMY - Build APK Production
echo   Backend: Replit
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ERROR: No se encuentra package.json
    echo Ejecuta este script desde la raiz del proyecto
    pause
    exit /b 1
)

echo [1/6] Verificando configuracion de produccion...
if not exist ".env.production" (
    echo ERROR: No se encuentra .env.production
    pause
    exit /b 1
)

echo.
echo Configuracion actual:
type .env.production
echo.

set /p CONFIRM="¿Las URLs apuntan a Replit? (S/N): "
if /i not "%CONFIRM%"=="S" (
    echo.
    echo Por favor actualiza .env.production con:
    echo EXPO_PUBLIC_API_URL=https://nemy-app.replit.app
    echo EXPO_PUBLIC_BACKEND_URL=https://nemy-app.replit.app
    pause
    exit /b 1
)

echo.
echo [2/6] Limpiando cache de Expo...
call npx expo start --clear

echo.
echo [3/6] Verificando EAS CLI...
call npx eas-cli --version
if errorlevel 1 (
    echo Instalando EAS CLI...
    call npm install -g eas-cli
)

echo.
echo [4/6] Login a EAS (si es necesario)...
call npx eas-cli whoami
if errorlevel 1 (
    echo Por favor inicia sesion:
    call npx eas-cli login
)

echo.
echo [5/6] Construyendo APK...
echo.
echo Opciones:
echo 1. Build LOCAL (mas rapido, requiere Android SDK)
echo 2. Build en la NUBE (mas lento, no requiere SDK)
echo.
set /p BUILD_TYPE="Selecciona opcion (1 o 2): "

if "%BUILD_TYPE%"=="1" (
    echo.
    echo Construyendo APK localmente...
    call npx eas-cli build --platform android --profile production --local
) else (
    echo.
    echo Construyendo APK en la nube...
    call npx eas-cli build --platform android --profile production
)

if errorlevel 1 (
    echo.
    echo ERROR: Fallo la construccion de APK
    pause
    exit /b 1
)

echo.
echo [6/6] Build completado!
echo.
echo La APK esta lista para instalar en dispositivos Android
echo.
echo Siguiente paso:
echo 1. Descarga la APK desde EAS
echo 2. Instala en dispositivo Android
echo 3. Verifica que conecte a: https://nemy-app.replit.app
echo.

REM Abrir dashboard de EAS
echo ¿Abrir dashboard de EAS para descargar APK? (S/N)
set /p OPEN_DASHBOARD=""
if /i "%OPEN_DASHBOARD%"=="S" (
    start https://expo.dev/accounts/tu-cuenta/projects/nemy-app/builds
)

echo.
echo ========================================
echo   Build completado exitosamente!
echo ========================================
pause
