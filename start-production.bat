@echo off
echo ========================================
echo NEMY - Servidor Completo de Produccion
echo ========================================
echo.

echo Funcionalidades incluidas:
echo ✅ Autenticacion por telefono (Twilio)
echo ✅ Stripe Connect (negocios y repartidores)
echo ✅ Wallets y retiros automaticos
echo ✅ Panel de administracion completo
echo ✅ Sistema de configuracion
echo ✅ Auditoria y logs
echo ✅ Endpoints de pedidos y negocios
echo ✅ Webhooks de Stripe
echo.

echo [1/2] Iniciando servidor completo...
start "NEMY Production Server" cmd /k "npm run server:dev"

echo Esperando que el servidor se inicie...
timeout /t 8 /nobreak >nul

echo [2/2] Iniciando frontend...
start "NEMY Frontend" cmd /k "npm run expo:dev"

echo.
echo ========================================
echo SERVIDOR COMPLETO INICIADO!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:8081
echo.
echo Endpoints disponibles:
echo - POST /api/auth/phone-login
echo - POST /api/auth/verify-phone
echo - GET  /api/businesses/featured
echo - GET  /api/businesses
echo - POST /api/orders
echo - GET  /api/admin/metrics
echo - POST /api/connect/create
echo - POST /api/wallet/withdraw
echo - GET  /api/admin/settings
echo.
echo Para tunnels publicos, ejecuta:
echo cloudflared tunnel --url http://localhost:5000
echo cloudflared tunnel --url http://localhost:8081
echo.
pause