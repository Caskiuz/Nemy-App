@echo off
echo ========================================
echo    NEMY - Arreglando Panel Admin
echo ========================================
echo.
echo Cargando datos mínimos para el panel admin...
echo.

mysql -u root -p nemy_db_local < fix-admin-data.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ ¡Panel admin arreglado!
    echo.
    echo 📊 Ahora el panel admin mostrará datos reales.
    echo 🔄 Reinicia el servidor si está corriendo.
    echo.
    echo 📱 Usa estos teléfonos para probar:
    echo 👨💼 ADMIN:       +52 341 456 7890 (código: 1234)
    echo 👑 SUPER ADMIN:  +52 341 567 8901 (código: 1234)
    echo.
) else (
    echo.
    echo ❌ Error al cargar los datos.
    echo Verifica que MySQL esté corriendo.
    echo.
)

echo Presiona cualquier tecla para continuar...
pause > nul