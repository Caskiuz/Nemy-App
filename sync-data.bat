@echo off
echo ========================================
echo    NEMY - Sincronizando Datos
echo ========================================
echo.
echo Este script sincronizará todos los datos financieros
echo para asegurar consistencia entre cliente y admin.
echo.
echo Presiona cualquier tecla para continuar...
pause > nul
echo.
echo Sincronizando datos...
echo.

REM Ejecutar sincronización de datos
curl -X POST http://localhost:5000/api/admin/sync-data ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ ¡Datos sincronizados exitosamente!
    echo.
    echo 📊 Ahora todos los números deberían ser consistentes:
    echo    - Panel Admin mostrará los mismos datos que la app
    echo    - Pedidos activos sincronizados
    echo    - Ingresos calculados correctamente
    echo    - Usuarios contados correctamente
    echo.
    echo 🔄 Reinicia la app para ver los cambios.
    echo.
) else (
    echo.
    echo ❌ Error al sincronizar datos.
    echo Verifica que el servidor esté corriendo.
    echo.
)

echo Presiona cualquier tecla para continuar...
pause > nul