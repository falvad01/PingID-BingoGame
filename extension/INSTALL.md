# Instalación y Configuración de la Extensión PingID Bingo

## Requisitos Previos

- Navegador basado en Chromium (Chrome, Edge, Brave, etc.)
- Cuenta de usuario en el sistema Bingo
- Backend y Frontend del Bingo ejecutándose

## Paso 1: Cargar la Extensión en el Navegador

### Chrome / Edge / Brave

1. Abre tu navegador
2. Navega a:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`

3. **Activa el Modo de Desarrollador**
   - Busca el toggle "Developer mode" / "Modo de desarrollador" en la esquina superior derecha
   - Actívalo

4. **Carga la extensión**
   - Haz clic en el botón **"Load unpacked"** / **"Cargar extensión sin empaquetar"**
   - Navega a la carpeta: `PingID-BingoGame/extension`
   - Selecciona la carpeta completa
   - Haz clic en **"Seleccionar carpeta"**

5. **Verifica la instalación**
   - La extensión "Ping ID Extension" debería aparecer en tu lista
   - Verifica que esté habilitada (toggle en azul/verde)

## Paso 2: Anclar la Extensión (Recomendado)

1. Haz clic en el **icono de extensiones** (🧩 pieza de puzzle) en la barra de herramientas
2. Busca **"Ping ID Extension"**
3. Haz clic en el **icono de pin** (📌) para anclarla a la barra
4. Ahora el icono de la extensión será visible permanentemente

## Paso 3: Configurar URLs (Solo si es necesario)

Si estás usando URLs diferentes para desarrollo o producción:

1. Abre el archivo: `extension/config.js`
2. Modifica las URLs según tus necesidades:

```javascript
const CONFIG = {
  API_URL: 'http://TU_BACKEND_URL:3000/',
  BINGO_APP_URL: 'http://TU_FRONTEND_URL:4200/'
};
```

3. Guarda el archivo
4. **Recarga la extensión**:
   - Ve a `chrome://extensions/`
   - Haz clic en el botón de recargar (🔄) en la tarjeta de la extensión

## Paso 4: Primer Uso - Iniciar Sesión

### Proceso de Login

1. **Abre la extensión**
   - Haz clic en el icono de la extensión en la barra de herramientas

2. **Ingresa tus credenciales**
   - Usuario: Tu nombre de usuario del Bingo
   - Contraseña: Tu contraseña del Bingo

3. **Inicia sesión**
   - Haz clic en el botón **"Iniciar Sesión"**
   - Espera la confirmación de éxito

4. **¡Listo!**
   - Tu sesión quedará guardada
   - No necesitarás volver a iniciar sesión (a menos que cierres sesión manualmente)

### Vista de Usuario Autenticado

Una vez autenticado, verás:
- ✅ Tu nombre de usuario
- 🟢 Estado de conexión
- 📊 Última acción realizada
- 🚪 Botón para cerrar sesión

## Paso 5: Uso Automático

### ¡No necesitas hacer nada más!

La extensión trabaja automáticamente cuando:

1. **Navegas a PingID**
   ```
   https://authenticator.pingone.com/pingid/ppm/auth
   ```

2. **La extensión detecta el número**
   - Busca automáticamente el elemento con clase `.numbermatching`
   - Extrae el número de 2 dígitos (10-99)

3. **Verifica si es el primer número del día**
   - Consulta al backend si ya añadiste un número hoy
   - Solo procede si no has añadido ningún número

4. **Envía el número automáticamente**
   - Llama a la API: `POST /number/add?number={número}`
   - Con tu token de autenticación

5. **Abre el Bingo en segundo plano**
   - Nueva pestaña sin hacer foco
   - No interrumpe tu trabajo actual

## Iconos de la Extensión

### Configurar Iconos Personalizados (Opcional)

Si quieres personalizar los iconos:

1. Crea o descarga imágenes PNG en estos tamaños:
   - `icon16.png` (16x16 píxeles)
   - `icon48.png` (48x48 píxeles)
   - `icon128.png` (128x128 píxeles)

2. Colócalas en la carpeta: `extension/icons/`

3. Recarga la extensión en `chrome://extensions/`

## Solución de Problemas

### La extensión no aparece después de cargarla

- ✅ Verifica que seleccionaste la carpeta `extension` completa
- ✅ Asegúrate de que el "Modo de desarrollador" esté activado
- ✅ Revisa que no haya errores en la tarjeta de la extensión

### "Error de autenticación" al hacer login

- ✅ Verifica que las credenciales sean correctas
- ✅ Asegúrate de que el backend esté corriendo
- ✅ Comprueba la URL en `config.js`
- ✅ Revisa la consola del navegador (F12 → Console)

### El número no se detecta automáticamente

- ✅ Espera unos segundos a que la página cargue
- ✅ Verifica que estés en la URL correcta de PingID
- ✅ Refresca la página (F5)
- ✅ Abre la consola del navegador para ver logs

### Ya tengo un número hoy pero quiero añadir otro

- ⚠️ La extensión solo permite **un número por día** (por diseño)
- ℹ️ Esto evita duplicados y sigue las reglas del juego
- ℹ️ Espera hasta mañana para añadir un nuevo número

### La extensión se desconecta sola

- ✅ Esto ocurre si el token expira
- ✅ Simplemente vuelve a iniciar sesión
- ✅ Tu sesión se mantendrá mientras el navegador esté abierto

## Actualizar la Extensión

Si se hacen cambios en el código:

1. Ve a `chrome://extensions/`
2. Busca "Ping ID Extension"
3. Haz clic en el botón **"Reload"** / **"Recargar"** (🔄)
4. Los cambios se aplicarán inmediatamente

## Desinstalar la Extensión

1. Ve a `chrome://extensions/`
2. Busca "Ping ID Extension"
3. Haz clic en **"Remove"** / **"Eliminar"**
4. Confirma la eliminación

⚠️ **Nota**: Esto eliminará también tu sesión guardada

## Seguridad y Privacidad

- 🔒 Tu contraseña **nunca** se almacena en la extensión
- 🔑 Solo se guarda el token de autenticación (JWT)
- 💾 Los datos se almacenan localmente en tu navegador
- 🚫 No se envían datos a terceros
- 🗑️ Al cerrar sesión, todos los datos se eliminan

## Permisos Solicitados

La extensión necesita estos permisos:

| Permiso | Uso | Razón |
|---------|-----|-------|
| `activeTab` | Leer contenido de la pestaña activa | Para detectar el número PingID en la página |
| `storage` | Almacenar datos localmente | Para guardar tu sesión y configuración |
| `tabs` | Crear nuevas pestañas | Para abrir el Bingo automáticamente |

---

**¿Necesitas ayuda?** Contacta al equipo de desarrollo o abre un issue en el repositorio.