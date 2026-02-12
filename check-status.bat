@echo off
echo ========================================
echo NEMY - Verificar estado del proyecto
echo ========================================
echo.

echo Verificando cambios sin subir...
git status --short
echo.

git diff --stat
echo.

echo Verificando si estas en la ultima version...
git fetch origin
git status
echo.

echo ========================================
echo Si hay cambios sin subir, ejecuta:
echo   git add .
echo   git commit -m "tu mensaje"
echo   git push origin main
echo.
echo Luego ejecuta: build-latest.bat
echo ========================================
pause
