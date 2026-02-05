@echo off
echo ========================================
echo DIAGNOSTICO DE FONDOS
echo ========================================
echo.
echo Verificando estado de pedidos y wallets...
echo.

mysql -u root -p nemy_db_local < diagnostico-fondos.sql > diagnostico-resultado.txt

echo.
echo Resultado guardado en: diagnostico-resultado.txt
echo.
type diagnostico-resultado.txt
echo.
pause
