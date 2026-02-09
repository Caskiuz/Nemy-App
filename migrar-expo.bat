@echo off
setlocal

set "SRC=%~dp0"
set "DEST=%~1"

if "%DEST%"=="" set "DEST=%SRC%NemyApp"

if exist "%DEST%" (
  echo.
  echo [ERROR] La carpeta destino ya existe: "%DEST%"
  echo Cambia el nombre o borra esa carpeta antes de migrar.
  exit /b 1
)

mkdir "%DEST%" || exit /b 1

rem Archivos base del proyecto Expo
for %%F in (
  package.json
  package-lock.json
  app.json
  eas.json
  babel.config.js
  metro.config.js
  tsconfig.json
  .gitignore
) do (
  if exist "%SRC%%%F" copy /y "%SRC%%%F" "%DEST%\" >nul
)

rem Archivos de entorno (si existen)
for %%F in (
  .env
  .env.local
  .env.production
) do (
  if exist "%SRC%%%F" copy /y "%SRC%%%F" "%DEST%\" >nul
)

rem Carpetas esenciales
if exist "%SRC%client" robocopy "%SRC%client" "%DEST%\client" /E /NFL /NDL /NJH /NJS /NC /NS >nul
if exist "%SRC%assets" robocopy "%SRC%assets" "%DEST%\assets" /E /NFL /NDL /NJH /NJS /NC /NS >nul
if exist "%SRC%shared" robocopy "%SRC%shared" "%DEST%\shared" /E /NFL /NDL /NJH /NJS /NC /NS >nul

echo.
echo Migracion completada en: "%DEST%"
echo.
echo Siguiente: entra a la carpeta y ejecuta:
echo   npm install
echo   npx expo start
echo   npx eas build --platform android --profile preview
echo.
endlocal
