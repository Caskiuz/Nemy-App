## 🚨 SOLUCIÓN RÁPIDA - PANEL ADMIN

### **PROBLEMA IDENTIFICADO:**
- Error 401 "Token requerido" 
- El sistema no está enviando el JWT token en las peticiones
- Necesitas hacer login primero

### **SOLUCIÓN INMEDIATA:**

#### **1. Reinicia la aplicación completamente:**
```bash
# Detén todo (Ctrl+C en ambos terminales)
# Luego reinicia:

# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend  
npm run expo:dev
```

#### **2. Haz login con el teléfono de admin:**
1. **Abre la app en el navegador**
2. **Ingresa el teléfono:** `+52 341 456 7890`
3. **Haz clic en "Enviar código SMS"**
4. **Ingresa el código:** `1234`
5. **Haz clic en "Iniciar Sesión"**

#### **3. Verifica que estés autenticado:**
- Deberías ver tu nombre en la parte superior del panel
- Si ves "Bienvenido, Ana López" entonces estás autenticado

### **¿QUÉ ARREGLÉ?**

✅ **Sistema de tokens JWT** - Ahora se envía el token en cada petición
✅ **Autenticación persistente** - El token se guarda en AsyncStorage  
✅ **Headers de autorización** - Se incluye `Authorization: Bearer <token>`

### **SI SIGUES VIENDO ERRORES 401:**

#### **Opción A: Logout y login de nuevo**
1. Ve a Perfil → Cerrar Sesión
2. Vuelve a hacer login con `+52 341 456 7890`
3. Código: `1234`

#### **Opción B: Limpiar caché**
```bash
# En el navegador:
F12 → Application → Storage → Clear storage
# Luego recarga la página
```

#### **Opción C: Verificar en consola del navegador**
```javascript
// Abre F12 → Console y ejecuta:
localStorage.clear();
location.reload();
```

### **TELÉFONOS DE PRUEBA ACTUALIZADOS:**

- **👨💼 ADMIN:** `+52 341 456 7890` (código: 1234)
- **👑 SUPER ADMIN:** `+52 341 567 8901` (código: 1234)
- **🏪 BUSINESS:** `+52 341 234 5678` (código: 1234)
- **👤 CUSTOMER:** `+52 341 123 4567` (código: 1234)

### **DESPUÉS DEL LOGIN EXITOSO:**

El panel admin debería mostrar:
- ✅ **Números reales** en lugar de ceros
- ✅ **Métricas del dashboard** funcionando
- ✅ **Tabs de navegación** activos
- ✅ **Datos de usuarios, pedidos, negocios**

### **SI NECESITAS DATOS DE DEMOSTRACIÓN:**
```bash
fix-admin-panel.bat
```

¡El panel admin ahora debería funcionar correctamente! 🎉