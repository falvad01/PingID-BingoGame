# PingID Bingo - Extensión de Navegador

Extensión de navegador para detectar automáticamente números de PingID y enviarlos a la aplicación de Bingo.

## Características

✅ **Login integrado**: Autenticación con tus credenciales de usuario  
✅ **Detección automática**: Encuentra el número PingID en la página de autenticación  
✅ **Envío inteligente**: Solo envía el primer número del día automáticamente  
✅ **Apertura automática**: Abre el Bingo en una nueva pestaña sin interrumpir tu trabajo  
✅ **Feedback visual**: Muestra el estado de cada acción en la extensión  

## Instalación

### Paso 1: Carga la Extensión

1. Abre Chrome (o cualquier navegador basado en Chromium)
2. Ve a `chrome://extensions/`
3. Activa el **Modo de desarrollador** (esquina superior derecha)
4. Haz clic en **"Cargar extensión sin empaquetar"**
5. Selecciona la carpeta `extension`
6. La extensión aparecerá en tu lista de extensiones

### Paso 2: Ancla la Extensión (Opcional pero Recomendado)

1. Haz clic en el icono de extensiones (pieza de puzzle) en la barra de herramientas
2. Encuentra "Ping ID Extension"
3. Haz clic en el icono de pin para anclarla

## Uso

### Primera Vez: Iniciar Sesión

1. Haz clic en el icono de la extensión
2. Ingresa tu **usuario** y **contraseña** (las mismas del Bingo)
3. Haz clic en **"Iniciar Sesión"**
4. ¡Listo! La extensión está configurada

### Uso Normal

**¡Es completamente automático!** Solo necesitas:

1. **Estar autenticado** en la extensión (solo una vez)
2. **Navegar** a la página de PingID: `https://authenticator.pingone.com/pingid/ppm/auth`
3. La extensión hará todo lo demás:
   - 🔍 Detecta el número automáticamente
   - ✅ Verifica si ya añadiste un número hoy
   - 📤 Si es tu primer número del día, lo envía automáticamente
   - 🎲 Abre el Bingo en una nueva pestaña (sin interrumpirte)

### Ver el Estado

Haz clic en el icono de la extensión en cualquier momento para ver:
- Si estás autenticado
- La última acción realizada
- El número detectado y enviado
- Mensajes de error (si los hay)

## Comportamiento

### ✅ Enviará el número automáticamente cuando:
- Has iniciado sesión en la extensión
- Es el **primer número del día**
- El número está entre 10-99

### ⚠️ NO enviará el número cuando:
- No has iniciado sesión
- Ya añadiste un número hoy
- No puede detectar el número en la página

### 🎯 Apertura del Bingo
- Abre en una **nueva pestaña**
- **Sin hacer foco** (no interrumpe tu trabajo)
- Solo cuando el número se envía exitosamente

## Configuración

Si necesitas cambiar las URLs del backend o frontend, edita el archivo `config.js`:

```javascript
const CONFIG = {
  API_URL: 'http://15.20.140.64:3000/',      // URL del backend
  BINGO_APP_URL: 'http://15.20.140.64:4200/' // URL del frontend
};
```

## Solución de Problemas

### "Error de autenticación"
- Verifica que tu usuario y contraseña sean correctos
- Asegúrate de que el backend esté funcionando

### "No se detecta el número"
- Espera unos segundos a que la página cargue completamente
- Verifica que estés en la URL correcta de PingID
- Refresca la página

### "Ya has añadido un número hoy"
- Esto es normal si ya enviaste un número anteriormente
- La extensión solo envía el primer número del día

### La extensión no funciona
1. Recarga la extensión en `chrome://extensions/`
2. Verifica que tengas conexión a internet
3. Comprueba que el backend esté corriendo
4. Revisa la consola del navegador (F12) para ver errores

## Cerrar Sesión

1. Haz clic en el icono de la extensión
2. Haz clic en **"Cerrar Sesión"**
3. Tus credenciales se eliminarán del navegador

## Permisos

La extensión solicita los siguientes permisos:

- **activeTab**: Para leer el contenido de la página de PingID
- **storage**: Para guardar tu sesión de forma segura
- **tabs**: Para abrir el Bingo en una nueva pestaña

## Soporte

Si encuentras algún problema o tienes sugerencias, contacta al equipo de desarrollo.

---

**Versión**: 1.0  
**Compatible con**: Chrome, Edge, Brave, y otros navegadores basados en Chromium