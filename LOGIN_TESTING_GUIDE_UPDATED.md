# 🔐 GUÍA DE LOGIN - TELÉFONOS ESPECÍFICOS POR ROL

## 📱 **TELÉFONOS DE PRUEBA POR ROL**

### 👤 **CUSTOMER** (Cliente)
```
Teléfono: 3411234567 (ingresa solo los 10 dígitos)
Nombre: Juan Pérez
Rol: CUSTOMER
```

### 🏪 **BUSINESS_OWNER** (Dueño de Negocio)
```
Teléfono: 3412345678 (ingresa solo los 10 dígitos)
Nombre: María González
Rol: BUSINESS_OWNER
Negocio: Tacos El Güero
```

### 🚗 **DELIVERY_DRIVER** (Repartidor)
```
Teléfono: 3413456789 (ingresa solo los 10 dígitos)
Nombre: Carlos Ramírez
Rol: DELIVERY_DRIVER
Estado: Activo
```

### 👨💼 **ADMIN** (Administrador)
```
Teléfono: 3414567890 (ingresa solo los 10 dígitos)
Nombre: Ana López
Rol: ADMIN
Permisos: Gestión operativa
```

### 👑 **SUPER_ADMIN** (Super Administrador)
```
Teléfono: 3415678901 (ingresa solo los 10 dígitos)
Nombre: Roberto Silva
Rol: SUPER_ADMIN
Permisos: Control total del sistema
```

---

## 🚀 **CÓMO PROBAR CADA ROL**

### 1. **Iniciar la aplicación**
```bash
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend
npm run expo:dev
```

### 2. **Login con teléfonos específicos**
1. Abre la app en tu dispositivo/emulador
2. En la pantalla de login, ingresa uno de los teléfonos de arriba (solo los 10 dígitos, ej: 3411234567)
3. **Haz clic en "Enviar código SMS"**
4. **Ingresa el código: `1234`**
5. **Haz clic en "Iniciar Sesión"**
6. La app automáticamente te llevará al panel correspondiente a tu rol

### 3. **Si el backend no inicia**
```bash
# Asegúrate de tener las dependencias
npm install

# Verifica que el archivo .env.local existe
# Configura tus variables de entorno reales

# Inicia el servidor manualmente
npx tsx -r dotenv/config server/server.ts dotenv_config_path=.env.local
```

---

## 🎯 **QUÉ VERÁS EN CADA ROL**

### 👤 **CUSTOMER** (3411234567)
**Pantallas disponibles**:
- 🏠 HomeScreen - Explorar restaurantes
- 🛒 CartScreen - Carrito de compras
- 📦 OrdersScreen - Historial de pedidos
- 📍 OrderTrackingScreen - Seguimiento
- 👤 ProfileScreen - Perfil personal
- ⭐ FavoritesScreen - Favoritos
- 💬 SupportChatScreen - Chat soporte
- 🌟 **LoyaltyScreen** - Programa de lealtad 🆕
- 🏪 **SuperAppScreen** - Super app completa 🆕
- 💳 **FinTechScreen** - Servicios financieros 🆕
- 👥 **SocialFeaturesScreen** - Funciones sociales 🆕

### 🏪 **BUSINESS_OWNER** (3412345678)
**Pantallas disponibles**:
- 📊 BusinessDashboardScreen - Panel principal
- ⚙️ BusinessManageScreen - Gestión del negocio
- 📈 BusinessStatsScreen - Estadísticas
- 💰 WalletScreen - Billetera y retiros
- 🍕 **BusinessProductsScreen** - Gestión de productos 🆕
- 🕐 **BusinessHoursScreen** - Configuración de horarios 🆕
- 🛒 **AdvancedMarketplaceScreen** - Marketplace avanzado 🆕
- 💰 **DynamicPricingScreen** - Precios dinámicos 🆕

### 🚗 **DELIVERY_DRIVER** (3413456789)
**Pantallas disponibles**:
- 🚚 DeliveryDashboardScreen - Panel de entregas
- 💵 DeliveryEarningsScreen - Ganancias
- 💰 WalletScreen - Billetera
- 🗺️ **RouteOptimizationScreen** - Optimización de rutas 🆕

### 👨💼 **ADMIN** (3414567890)
**Pantallas disponibles**:
- 🎛️ AdminScreen - Panel completo de administración
- 💰 **AdminFinanceScreen** - Módulo financiero completo 🆕
- ⚙️ **SystemConfigScreen** - Configuración del sistema 🆕
- 🧠 **BusinessIntelligenceScreen** - IA y analytics 🆕

### 👑 **SUPER_ADMIN** (3415678901)
**Pantallas disponibles**:
- 🎛️ AdminScreen - Panel completo de administración
- 💰 **AdminFinanceScreen** - Acceso completo a finanzas 🆕
- ⚙️ **SystemConfigScreen** - Control total del sistema 🆕
- 🧠 **BusinessIntelligenceScreen** - IA y analytics 🆕
- 🔧 Configuración de comisiones y precios
- 👥 Gestión de administradores

---

## 🔧 **CONFIGURACIÓN DE DESARROLLO**

### Variables de entorno necesarias:
```env
# En tu .env.local
NODE_ENV=development
JWT_SECRET=production-secret-key
DB_HOST=localhost
DB_PASSWORD=your_mysql_password
```

### Código SMS universal para testing:
```
Código: 1234
```

---

## 🎮 **FUNCIONALIDADES NUEVAS A PROBAR**

### 🌟 **Para CUSTOMER**:
1. **Programa de Lealtad**: Puntos, niveles, recompensas
2. **Super App**: Farmacia, supermercado, servicios
3. **FinTech**: Billetera, préstamos, inversiones
4. **Social**: Pedidos grupales, reviews con fotos

### 🏪 **Para BUSINESS_OWNER**:
1. **Gestión de Productos**: Catálogo completo, categorías
2. **Horarios**: Configuración avanzada, horarios especiales
3. **Marketplace**: Tienda virtual, promociones
4. **Precios Dinámicos**: Surge pricing, demanda

### 🚗 **Para DELIVERY_DRIVER**:
1. **Optimización de Rutas**: IA, múltiples pedidos
2. **Mapas Interactivos**: Rutas visuales
3. **Ganancias**: Cálculo neto, costos

### 👨💼 **Para ADMIN/SUPER_ADMIN**:
1. **Finanzas**: Contabilidad completa, reportes
2. **BI**: Analytics avanzados, predicciones
3. **Configuración**: Control total del sistema

---

## 🚨 **TROUBLESHOOTING**

### Si no puedes acceder:
1. Verifica que uses exactamente los teléfonos de arriba (solo 10 dígitos)
2. Usa el código SMS: `1234`
3. Asegúrate de que el backend esté corriendo en puerto 5000
4. Revisa que tengas el archivo .env.local configurado
5. Verifica que la base de datos MySQL esté corriendo

### Si no ves las pantallas nuevas:
1. Reinicia la app completamente
2. Verifica que hayas hecho `git pull` de los últimos cambios
3. Ejecuta `npm install` por si hay nuevas dependencias

### Si hay errores de imágenes:
1. Los errores de `via.placeholder.com` son normales y se han solucionado
2. La app ahora usa imágenes placeholder locales
3. No afecta la funcionalidad del login

---

## 🎯 **PRÓXIMOS PASOS**

1. **Prueba cada rol** con los teléfonos específicos
2. **Explora las nuevas funcionalidades** implementadas
3. **Reporta cualquier bug** que encuentres
4. **Sugiere mejoras** basadas en tu experiencia

¡Disfruta probando las nuevas funcionalidades de nivel mundial! 🚀