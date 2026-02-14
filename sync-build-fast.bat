@echo off
echo ========================================
echo NEMY - Sincronizacion Rapida y Build
echo ========================================
echo.

set SOURCE=C:\Users\rijar\Proyectos\NEMY-APP\NEMY-APP
set DEST=C:\NEMY

echo [1/5] Obteniendo ultimos cambios de GitHub...
cd /d "%SOURCE%"
git pull origin main
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron obtener los cambios
    pause
    exit /b 1
)
echo.

echo [2/5] Sincronizando archivos a C:\NEMY (solo cambios)...
robocopy "%SOURCE%" "%DEST%" /MIR /XD node_modules .git dist .expo android\build ios\build /XF *.log /NFL /NDL /NJH /NJS /nc /ns /np
echo OK - Sincronizacion completada
echo.

echo [3/5] Cambiando a C:\NEMY...
cd /d C:\NEMY
echo.

echo [4/5] Instalando dependencias...
call npm install --prefer-offline
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias
    pause
    exit /b 1
)
echo.

echo [5/6] Construyendo APK para Android con Gradle...
cd android
call gradlew assembleRelease
if %errorlevel% neq 0 (
    cd ..
    echo ERROR: Fallo al construir APK
    pause
    exit /b 1
)
cd ..
echo.

echo [6/6] Reinstalando APK en dispositivo...
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe install -r C:\NEMY\android\app\build\outputs\apk\release\app-release.apk
if %errorlevel% neq 0 (
    echo ADVERTENCIA: No se pudo instalar el APK (verifica que el dispositivo este conectado)
) else (
    echo APK instalado exitosamente
    timeout /t 2 /nobreak >nul
    echo Reiniciando app...
    %LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe shell am force-stop com.nemyapp
    %LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe shell am start -n com.nemyapp/.MainActivity
)
echo.

echo ========================================
echo Proceso completado!
echo APK: C:\NEMY\android\app\build\outputs\apk\release\app-release.apk
echo ========================================
pause
