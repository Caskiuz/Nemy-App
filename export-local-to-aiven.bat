@echo off
echo ========================================
echo   NEMY - Exportar Local a Aiven
echo ========================================
echo.
echo Este script exportará tu base de datos local
echo a la base de datos de producción en Aiven.
echo.
echo Destino: nemydb-rijarwow-c949.l.aivencloud.com
echo.
echo ⚠️  ADVERTENCIA: Esto sobrescribirá los datos en Aiven
echo.

REM Cargar variables desde archivos .env si existen
for %%F in (.env .env.local .env.production .env.replit) do (
    if exist %%F (
        for /f "usebackq tokens=1,* delims==" %%A in ("%%F") do (
            if not "%%A"=="" if not "%%A:~0,1"=="#" set "%%A=%%B"
        )
    )
)

set /p CONFIRM="¿Estás seguro? (S/N): "
if /i not "%CONFIRM%"=="S" (
    echo Operación cancelada.
    pause
    exit /b 0
)

REM Configuración de Aiven (usar variables de entorno si existen)
if not defined AIVEN_HOST SET AIVEN_HOST=nemydb-rijarwow-c949.l.aivencloud.com
if not defined AIVEN_PORT SET AIVEN_PORT=21209
if not defined AIVEN_USER SET AIVEN_USER=avnadmin
if not defined AIVEN_PASSWORD SET AIVEN_PASSWORD=
if not defined AIVEN_DB SET AIVEN_DB=defaultdb

echo.
echo [1/4] Creando backup de base de datos local...
SET DATE=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%
SET TIME=%time:~0,2%-%time:~3,2%-%time:~6,2%
SET TIME=%TIME: =0%
SET FILENAME=export_to_aiven_%DATE%_%TIME%.sql

if not defined LOCAL_DB_PASSWORD (
    echo.
    echo ❌ Falta LOCAL_DB_PASSWORD. Agregalo en .env.local o como variable de entorno.
    pause
    exit /b 1
)
mysqldump -u root -p%LOCAL_DB_PASSWORD% nemy_db > %FILENAME%

if errorlevel 1 (
    echo ❌ Error al crear backup
    pause
    exit /b 1
)

echo ✅ Backup creado: %FILENAME%
echo.

echo [2/4] Conectando a Aiven...
echo Host: %AIVEN_HOST%
echo Puerto: %AIVEN_PORT%
echo.

echo [3/4] Importando datos a Aiven...
echo Esto puede tomar varios minutos...
echo.

if not defined AIVEN_PASSWORD (
    echo.
    echo ❌ Falta AIVEN_PASSWORD. Agregalo en .env.local o como variable de entorno.
    pause
    exit /b 1
)
mysql -h %AIVEN_HOST% -P %AIVEN_PORT% -u %AIVEN_USER% -p%AIVEN_PASSWORD% --ssl-mode=REQUIRED %AIVEN_DB% < %FILENAME%

if errorlevel 1 (
    echo.
    echo ❌ Error al importar a Aiven
    echo.
    echo Posibles causas:
    echo - MySQL client no instalado
    echo - Firewall bloqueando conexión
    echo - SSL no configurado
    echo.
    pause
    exit /b 1
)

echo.
echo [4/4] Verificando importación...
mysql -h %AIVEN_HOST% -P %AIVEN_PORT% -u %AIVEN_USER% -p%AIVEN_PASSWORD% --ssl-mode=REQUIRED %AIVEN_DB% -e "SELECT COUNT(*) as total_users FROM users; SELECT COUNT(*) as total_businesses FROM businesses; SELECT COUNT(*) as total_orders FROM orders;"

echo.
echo ========================================
echo   ✅ Exportación completada!
echo ========================================
echo.
echo Archivo de backup: %FILENAME%
echo.
echo Siguiente paso:
echo 1. Ve a Replit
echo 2. Ejecuta: npm run production:start
echo 3. Verifica: https://nemy-app.replit.app/api/health
echo.
pause
