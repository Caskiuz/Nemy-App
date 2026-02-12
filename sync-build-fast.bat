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

echo [5/5] Construyendo APK para Android...
call npm run build:android
if %errorlevel% neq 0 (
    echo ERROR: Fallo al construir APK
    pause
    exit /b 1
)
echo.

echo ========================================
echo Build completado exitosamente!
echo APK: C:\NEMY\dist\
echo ========================================
echo.
echo Presiona cualquier tecla para abrir la carpeta del APK...
pause >nul
explorer C:\NEMY\dist
