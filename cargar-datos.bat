@echo off
echo Cargando datos reales en la base de datos...
mysql -u root -p137920 nemy_db_local < load-real-data.sql

echo.
echo Datos cargados exitosamente!
echo.
echo Verific ando datos:
mysql -u root -p137920 -e "USE nemy_db_local; SELECT COUNT(*) as pedidos FROM orders; SELECT COUNT(*) as negocios FROM businesses;"

echo.
echo Listo! Ahora reinicia el servidor con: npm run server:demo
pause
