// Importar módulos necesarios
const express = require("express");
const app = express();
const sequelize = require("./DAO/connection/DBConnection");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const sec = require("./utils/Securitation");
const logger = require("./utils/logger.controller");

logger.initLogger();

// Especificar el puerto y la dirección en la que escuchar
const port = process.env.API_HTTP_PORT || 80;
const sport = process.env.API_HTTPS_PORT || 443;

if (
  fs.existsSync(process.env.SSL_CONFIG_KEY) &&
  fs.existsSync(process.env.SSL_CONFIG_CERT)
) {
  privateKey = fs.readFileSync(process.env.SSL_CONFIG_KEY).toString();
  certificate = fs.readFileSync(process.env.SSL_CONFIG_CERT).toString();
  credentials = { key: privateKey, cert: certificate };
}

// Aplicar la securización del backend
sec.securization(app);

// Importar las rutas
const userRoutes = require("./routes/user");
const numberRoutes = require("./routes/number");

// Usar las rutas
app.use(express.static(path.join(__dirname, "../dist/ng-app")));
app.use(express.json({ limit: "50mb" }));

app.use("/user", userRoutes);
app.use("/number", numberRoutes);



// Configuración para servir el frontend en producción
app.use(express.static(path.join(__dirname, "../dist/frontend")));

// Redirigir todas las rutas no manejadas por las API al index.html del frontend
app.get("*", (req, res) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css; script-src 'self' 'unsafe-inline'; font-src * data:; img-src * data: blob:; connect-src 'self' https://cdn.datatables.net"
  );  
  res.sendFile(path.resolve(__dirname, "../dist/frontend", "index.html"));
});

// Sincronizar con la base de datos y arrancar el servidor
sequelize
  .authenticate()
  .then(() => {
    console.log(
      "Connection to the database has been established successfully."
    );
    return sequelize.sync();
  })
  .then(() => {
    http.createServer(app).listen(port);
    console.info("Push Scan client server listening on port " + port);
    if (process.env.USE_HTTPS && certificate && privateKey) {
      https.createServer(credentials, app).listen(sport);
      console.info("Push Scan client secure server listening on port " + sport);
    }
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });


  
