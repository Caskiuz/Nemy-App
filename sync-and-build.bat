@echo off
echo ========================================
echo NEMY - Sincronizar y Build
echo ========================================
echo.

set SOURCE=C:\Users\rijar\Proyectos\NEMY-APP\NEMY-APP
set DEST=C:\NEMY

echo [1/6] Verificando carpeta de origen...
if not exist "%SOURCE%" (
    echo ERROR: No existe la carpeta de origen: %SOURCE%
    pause
    exit /b 1
)
echo OK - Carpeta de origen encontrada
echo.

echo [2/6] Obteniendo ultimos cambios de GitHub en carpeta de origen...
cd /d "%SOURCE%"
git pull origin main
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron obtener los cambios
    pause
    exit /b 1
)
echo.

echo [3/6] Sincronizando a C:\NEMY...
echo Esto puede tardar unos minutos...
if exist "%DEST%" (
    echo Eliminando carpeta anterior...
    rmdir /s /q "%DEST%"
)

echo Copiando archivos...
xcopy "%SOURCE%" "%DEST%\" /E /I /H /Y /Q
if %errorlevel% neq 0 (
    echo ERROR: Fallo al copiar archivos
    pause
    exit /b 1
)
echo OK - Archivos sincronizados
echo.

echo [4/6] Cambiando a C:\NEMY...
cd /d C:\NEMY
echo.

echo [5/6] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias
    pause
    exit /b 1
)
echo.

echo [6/6] Construyendo APK para Android con Gradle...
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

echo ========================================
echo Build completado exitosamente!
echo APK: C:\NEMY\android\app\build\outputs\apk\release\app-release.apk
echo ========================================
echo.
echo Presiona cualquier tecla para abrir la carpeta del APK...
pause >nul
explorer C:\NEMY\android\app\build\outputs\apk\release
