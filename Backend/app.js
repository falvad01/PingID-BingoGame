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
const bodyParser = require("body-parser");
const dbCreation = require("./DAO/connection/DBCreation");
logger.initLogger();

// Especificar el puerto y la dirección en la que escuchar
const port = process.env.API_HTTP_PORT || 80;
const sport = process.env.API_HTTPS_PORT || 443;

// if (
//   fs.existsSync(process.env.SSL_CONFIG_KEY) &&
//   fs.existsSync(process.env.SSL_CONFIG_CERT)
// ) {
//   privateKey = fs.readFileSync(process.env.SSL_CONFIG_KEY).toString();
//   certificate = fs.readFileSync(process.env.SSL_CONFIG_CERT).toString();
//   credentials = { key: privateKey, cert: certificate };
// }

// Aplicar la securización del backend
sec.securization(app);

// Importar las rutas
const userRoutes = require("./routes/user");
const numberRoutes = require("./routes/number");
const adminRoutes = require("./routes/admin");
const extensionRoutes = require("./routes/extension");
const { console } = require("inspector");

// Usar las rutas
app.use(express.json({ limit: "1gb" }));
app.use(bodyParser.json({ limit: "1gb" }));
app.use(bodyParser.urlencoded({ limit: "1gb", extended: true }));

app.use("/user", userRoutes);
app.use("/number", numberRoutes);
app.use("/admin", adminRoutes);
app.use("/extension", extensionRoutes);

// Serve uploads directory as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

console.log("Starting application...");
console.log("Attempting to connect to database...");

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection successful!");
    startServer();
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
    process.exit(1);
  });

// Función para iniciar el servidor
function startServer() {

  console.info("Connection to the database has been established successfully.");
  console.log("Creating database tables...");

  dbCreation.createDB().then(async () => {
    console.log("Database tables created successfully!");
    console.log(`Starting HTTP server on port ${port}...`);

    // Iniciar el servidor HTTP
    http.createServer(app).listen(port, "0.0.0.0", () => {
      console.info(`Padel BOOM client server listening on port ${port}`);
    });

    // Iniciar el servidor HTTPS (si está habilitado)
    // console.info("Https:" + process.env.USE_HTTPS);
    // console.info("Private:" + privateKey);
    // console.info("Certificate:" + certificate);

    // if (process.env.USE_HTTPS && certificate && privateKey) {
    //   https.createServer(credentials, app).listen(sport, "0.0.0.0", () => {
    //     console.info(`Padel BOOM secure server listening on port ${sport}`);
    //   });
    // }
  }).catch((err) => {
    console.error("Error creating database:", err);
    process.exit(1);
  });
}
