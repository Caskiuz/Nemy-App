## 🚨 SOLUCIÓN INMEDIATA - PANEL ADMIN EN CEROS

### **PROBLEMA:**
Panel admin muestra todo en 0 pero la app del cliente muestra pedidos.

### **CAUSA:**
No estás autenticado como admin o el token no se guardó correctamente.

### **SOLUCIÓN EN 3 PASOS:**

#### **1. Cierra sesión y limpia caché**
```javascript
// Abre la consola del navegador (F12) y ejecuta:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

#### **2. Haz login de nuevo como ADMIN**
```
Teléfono: +52 341 456 7890
Código: 1234
```

#### **3. Verifica que estés autenticado**
```javascript
// En consola del navegador (F12):
const user = JSON.parse(localStorage.getItem('@nemy_user'));
console.log('Usuario:', user);
console.log('Token:', user?.token);
console.log('Rol:', user?.role);
```

Deberías ver:
```
Usuario: {id: "user4", name: "Ana López", role: "admin", token: "eyJ..."}
Token: eyJ... (un string largo)
Rol: admin
```

### **SI SIGUE EN CEROS:**

#### **Opción A: Cargar datos de demo**
```bash
fix-admin-panel.bat
```

#### **Opción B: Verificar que el servidor esté corriendo**
```bash
# Verifica en http://localhost:5000/api/health
# Deberías ver: {"status":"ok","timestamp":"..."}
```

#### **Opción C: Verificar la base de datos**
```sql
-- Abre MySQL y ejecuta:
USE nemy_db_local;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM businesses;
```

Si todos muestran 0, ejecuta:
```bash
load-demo-data.bat
```

### **DESPUÉS DE HACER LOGIN CORRECTAMENTE:**

El panel admin debería mostrar:
- ✅ Usuarios: 8
- ✅ Pedidos: 10
- ✅ Ingresos: $345
- ✅ Pedidos activos: 2

### **VERIFICACIÓN FINAL:**

1. **Panel Admin → Tab "Resumen"** debe mostrar números reales
2. **Panel Admin → Tab "Dashboard"** debe mostrar pedidos activos
3. **Panel Admin → Tab "Usuarios"** debe listar 8 usuarios
4. **Panel Admin → Tab "Pedidos"** debe listar 10 pedidos

Si ves esto, ¡el sistema está funcionando correctamente! ✅