# Scripts de Sincronización y Build

## Problema
Windows tiene límite de 260 caracteres en rutas. La carpeta original tiene rutas muy largas:
```
C:\Users\rijar\Proyectos\NEMY-APP\NEMY-APP\...
```

## Solución
Trabajar desde `C:\NEMY` (ruta corta) pero mantener el código fuente en la carpeta original con Git.

## Scripts Disponibles

### 1. `sync-build-fast.bat` ⚡ (RECOMENDADO)
**Uso más común** - Sincroniza y construye APK
```bash
# Doble clic en el archivo o ejecutar:
sync-build-fast.bat
```

**Qué hace:**
1. Obtiene últimos cambios de GitHub
2. Sincroniza solo archivos modificados a C:\NEMY (rápido)
3. Instala dependencias
4. Construye APK con `cd android && gradlew assembleRelease`
5. Abre carpeta con el APK en `android\app\build\outputs\apk\release\`

**Cuándo usar:** Cada vez que quieras hacer un build con los últimos cambios

---

### 2. `sync-only.bat` 📁
Solo sincroniza archivos (sin build)
```bash
sync-only.bat
```

**Qué hace:**
1. Obtiene últimos cambios de GitHub
2. Sincroniza a C:\NEMY

**Cuándo usar:** Cuando solo quieres actualizar C:\NEMY para trabajar desde ahí

---

### 3. `sync-and-build.bat` 🐢
Sincronización completa (más lento pero más seguro)
```bash
sync-and-build.bat
```

**Qué hace:**
1. Obtiene últimos cambios
2. Elimina C:\NEMY completamente
3. Copia todo de nuevo
4. Instala dependencias
5. Construye APK

**Cuándo usar:** Si tienes problemas con la sincronización rápida

---

### 4. `check-status.bat` 🔍
Verifica estado del proyecto
```bash
check-status.bat
```

**Qué hace:**
- Muestra archivos modificados sin subir
- Verifica si estás en la última versión

**Cuándo usar:** Antes de hacer cambios, para ver el estado

---

## Flujo de Trabajo Recomendado

### Para Desarrollo:
1. Trabaja en: `C:\Users\rijar\Proyectos\NEMY-APP\NEMY-APP`
2. Haz commits y push normalmente
3. Cuando necesites build: ejecuta `sync-build-fast.bat`

### Para Build Rápido:
```bash
# Desde cualquier lugar, ejecuta:
C:\Users\rijar\Proyectos\NEMY-APP\NEMY-APP\sync-build-fast.bat
```

### Si Hiciste Cambios en C:\NEMY:
```bash
# 1. Copia los cambios de vuelta
robocopy C:\NEMY C:\Users\rijar\Proyectos\NEMY-APP\NEMY-APP /MIR /XD node_modules .git dist

# 2. Haz commit desde la carpeta original
cd C:\Users\rijar\Proyectos\NEMY-APP\NEMY-APP
git add .
git commit -m "tus cambios"
git push origin main
```

---

## Notas Importantes

✅ **Carpeta de origen (con Git):**
```
C:\Users\rijar\Proyectos\NEMY-APP\NEMY-APP
```

✅ **Carpeta de trabajo (builds):**
```
C:\NEMY
```

⚠️ **NUNCA hagas commits desde C:\NEMY** - No tiene el repositorio Git configurado

⚠️ **Los scripts excluyen automáticamente:**
- `node_modules/` (se reinstala)
- `.git/` (solo en carpeta original)
- `dist/` (se regenera en build)
- `.expo/` (caché)
- `android/build/` y `ios/build/` (builds temporales)

---

## Solución de Problemas

### "ERROR: No se pudieron obtener los cambios"
- Verifica tu conexión a internet
- Asegúrate de no tener cambios sin commit en la carpeta original

### "ERROR: Fallo al instalar dependencias"
- Elimina `C:\NEMY\node_modules` manualmente
- Ejecuta el script de nuevo

### "ERROR: Fallo al construir APK"
- Verifica que tengas Android SDK instalado
- Revisa los logs en la consola

### El APK no tiene los últimos cambios
- Asegúrate de ejecutar `sync-build-fast.bat` (no solo `npm run build:android`)
- Verifica que hiciste `git push` de tus cambios

---

## Acceso Directo (Opcional)

Puedes crear un acceso directo en el escritorio:
1. Clic derecho en `sync-build-fast.bat`
2. "Enviar a" > "Escritorio (crear acceso directo)"
3. Renombrar a "NEMY - Build APK"
