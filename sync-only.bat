@echo off
echo ========================================
echo NEMY - Solo Sincronizar
echo ========================================
echo.

set SOURCE=C:\Users\rijar\Proyectos\NEMY-APP\NEMY-APP
set DEST=C:\NEMY

echo Obteniendo ultimos cambios de GitHub...
cd /d "%SOURCE%"
git pull origin main
echo.

echo Sincronizando a C:\NEMY...
robocopy "%SOURCE%" "%DEST%" /MIR /XD node_modules .git dist .expo android\build ios\build /XF *.log /NFL /NDL /NJH /NJS /nc /ns /np
echo.

echo ========================================
echo Sincronizacion completada!
echo Ahora puedes trabajar desde: C:\NEMY
echo ========================================
pause
