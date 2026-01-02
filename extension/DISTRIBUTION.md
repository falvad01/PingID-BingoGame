# Guía de Distribución de la Extensión

Este documento explica cómo empaquetar y distribuir la extensión PingID Bingo desde tu aplicación web.

## 📦 Empaquetado

### Opción 1: Script Automático (Recomendado)

Ejecuta el script PowerShell incluido:

```powershell
cd extension
.\package-extension.ps1
```

Esto creará:
- `extension/dist/pingid-bingo-extension.zip` - Archivo listo para distribución

### Opción 2: Manual

1. Selecciona todos los archivos de la carpeta `extension` (excepto `dist/` y `.ps1`)
2. Comprímelos en un archivo ZIP
3. Asegúrate de incluir:
   - `manifest.json`
   - `config.js`
   - `background.js`
   - `content.js`
   - `popup.html`
   - `popup.js`
   - `README.md`
   - `INSTALL.md`
   - `icons/` (carpeta completa)

## 🌐 Distribución desde tu Web

### Opción A: Página HTML Standalone

Usa el archivo `download.html` incluido:

1. **Copia los archivos necesarios:**
   ```
   Tu servidor web/
   ├── download.html
   └── dist/
       └── pingid-bingo-extension.zip
   ```

2. **Sirve desde tu servidor:**
   - Coloca `download.html` en tu servidor web
   - Asegúrate de que `dist/pingid-bingo-extension.zip` esté accesible
   - Accede a: `http://tu-dominio.com/download.html`

### Opción B: Integración en Angular

Ya creamos un componente Angular completo. Para usarlo:

1. **El componente ya está creado en:**
   ```
   FrontEnd/src/app/extension-download/
   ├── extension-download.component.ts
   ├── extension-download.component.html
   └── extension-download.component.scss
   ```

2. **Copia el ZIP empaquetado a assets:**
   ```
   FrontEnd/src/assets/extension/
   └── pingid-bingo-extension.zip
   ```

3. **Registra el componente en tu módulo:**
   ```typescript
   // app.module.ts o el módulo correspondiente
   import { ExtensionDownloadComponent } from './extension-download/extension-download.component';
   
   @NgModule({
     declarations: [
       // ... otros componentes
       ExtensionDownloadComponent
     ],
     // ...
   })
   ```

4. **Añade una ruta (opcional):**
   ```typescript
   // app-routing.module.ts
   {
     path: 'extension',
     component: ExtensionDownloadComponent
   }
   ```

5. **Usa el componente:**
   ```html
   <!-- Donde quieras mostrarlo -->
   <app-extension-download></app-extension-download>
   ```

## 🔄 Proceso de Actualización

Cuando actualices la extensión:

1. **Modifica los archivos** de la extensión
2. **Actualiza la versión** en `manifest.json`:
   ```json
   "version": "1.1"
   ```
3. **Empaqueta nuevamente:**
   ```powershell
   .\package-extension.ps1
   ```
4. **Reemplaza el ZIP** en tu servidor
5. **Notifica a los usuarios** que recarguen la extensión

## 📋 Checklist antes de Distribuir

- [ ] Verificar que `config.js` tenga las URLs correctas (producción, no localhost)
- [ ] Probar la extensión localmente
- [ ] Ejecutar `package-extension.ps1`
- [ ] Verificar que el ZIP se creó correctamente
- [ ] Subir el ZIP a tu servidor
- [ ] Probar el enlace de descarga
- [ ] Verificar las instrucciones de instalación

## 🔒 Seguridad

### URLs de Producción

Antes de distribuir, asegúrate de que `config.js` tenga las URLs correctas:

```javascript
const CONFIG = {
  API_URL: 'https://tu-dominio.com/api/',  // No localhost
  BINGO_APP_URL: 'https://tu-dominio.com/', // No localhost
  // ...
};
```

### Permisos

La extensión solicita:
- `activeTab` - Para leer la página de PingID
- `storage` - Para guardar sesión
- `tabs` - Para abrir el Bingo automáticamente

Estos permisos son necesarios y seguros para el funcionamiento.

## 💡 Recomendaciones

### Para Pocos Usuarios (< 20)
✅ Usa la página HTML standalone (`download.html`)  
✅ Distribuye el enlace directo  
✅ Proporciona soporte 1-a-1

### Para Muchos Usuarios (> 20)
✅ Integra el componente Angular en tu app  
✅ Añade sección en el menú/dashboard  
✅ Considera publicar en Chrome Web Store (más profesional)

### Actualización Automática
⚠️ Con distribución manual, los usuarios deben:
1. Descargar la nueva versión
2. Recargar la extensión en `chrome://extensions/`

🎯 Para actualizaciones automáticas, considera Chrome Web Store

## 🚀 Chrome Web Store (Opcional)

Si quieres distribución profesional con un clic:

1. **Crea cuenta de desarrollador** ($5 USD única vez)
2. **Sube el ZIP** a [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. **Completa la información:**
   - Nombre: PingID Bingo Extension
   - Descripción: (usa el README.md como base)
   - Capturas de pantalla
   - Categoría: Productivity
4. **Publica como "No listado"** (solo con enlace directo)
5. **Compartir el enlace** directo con tus usuarios

**Ventajas:**
- Instalación con un clic
- Actualizaciones automáticas
- Más confiable para usuarios

## 📞 Soporte

### Problemas Comunes

**"No se puede descargar el ZIP"**
- Verifica que el archivo esté en la ruta correcta
- Comprueba los permisos del servidor
- Prueba la URL directamente en el navegador

**"No se puede instalar"**
- Asegúrate de que el usuario extrajo el ZIP
- Verifica que seleccionen la carpeta (no el ZIP)
- Confirma que tengan activado el Modo Desarrollador

**"La extensión no funciona"**
- Verifica las URLs en `config.js`
- Asegúrate de que el backend esté corriendo
- Revisa la consola del navegador

---

**¿Necesitas ayuda?** Contacta al equipo de desarrollo.
