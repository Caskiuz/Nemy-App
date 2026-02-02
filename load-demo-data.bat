@echo off
echo ========================================
echo    NEMY - Cargando Datos de Ejemplo
echo ========================================
echo.
echo Este script cargará datos de ejemplo en la base de datos.
echo Asegúrate de que MySQL esté corriendo y que tengas la base de datos 'nemy_db_local' creada.
echo.
echo Presiona cualquier tecla para continuar o Ctrl+C para cancelar...
pause > nul
echo.
echo Cargando datos...
echo.

REM Cargar datos usando el archivo SQL simple
mysql -u root -p nemy_db_local < load-demo-simple.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ ¡Datos cargados exitosamente!
    echo.
    echo 📱 Ahora puedes hacer login con estos teléfonos de prueba:
    echo.
    echo 👤 CLIENTE:           +52 341 123 4567 (código: 1234)
    echo 🏪 DUEÑO DE NEGOCIO:   +52 341 234 5678 (código: 1234)
    echo 🚗 REPARTIDOR:        +52 341 345 6789 (código: 1234)
    echo 👨‍💼 ADMIN:             +52 341 456 7890 (código: 1234)
    echo 👑 SUPER ADMIN:       +52 341 567 8901 (código: 1234)
    echo.
    echo 🎯 El panel admin ahora mostrará números reales en lugar de ceros.
    echo.
) else (
    echo.
    echo ❌ Error al cargar los datos.
    echo Verifica que MySQL esté corriendo y que tengas permisos.
    echo.
)

echo Presiona cualquier tecla para continuar...
pause > nul