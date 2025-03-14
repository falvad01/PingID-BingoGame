// Importar módulos necesarios
const express = require("express");
const app = express();
const sequelize = require("./database/DBConnection");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const sec = require("./utils/Securitation");
const logger = require("./utils/logger.controller");
const bodyParser = require("body-parser");
const dbCreation = require("./database/DBCreation");
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
app.use(express.json({ limit: "1gb" }));
app.use(bodyParser.json({ limit: "1gb" }));
app.use(bodyParser.urlencoded({ limit: "1gb", extended: true }));

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

sequelize
  .authenticate()
  .then(() => {
    startServer();
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Función para iniciar el servidor
function startServer() {

  console.info("Connection to the database has been established successfully.");
  dbCreation.createDB().then(async () => {
    // Iniciar el servidor HTTP
    http.createServer(app).listen(port, "0.0.0.0", () => {
      console.info(`Padel BOOM client server listening on port ${port}`);
    });

    // Iniciar el servidor HTTPS (si está habilitado)
    // console.log("Https:" + process.env.USE_HTTPS);
    // console.log("Private:" + privateKey);
    // console.log("Certificate:" + certificate);

    if (process.env.USE_HTTPS && certificate && privateKey) {
      https.createServer(credentials, app).listen(sport, "0.0.0.0", () => {
        console.info(`Padel BOOM secure server listening on port ${sport}`);
      });
    }
  });
}
