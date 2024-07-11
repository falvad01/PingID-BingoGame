// Importar módulos necesarios
const http = require('http');

// Definir el servidor
const server = http.createServer((req, res) => {
  // Manejar las peticiones
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('¡Hola, mundo!\n');
});

// Especificar el puerto y la dirección en la que escuchar
const port = 3000;
const hostname = '127.0.0.1';

// Iniciar el servidor
server.listen(port, hostname, () => {
  console.log(`El servidor se está ejecutando en http://${hostname}:${port}/`);
});