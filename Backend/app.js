// Importar módulos necesarios
const express = require("express");
const app = express();
const sequelize = require("./database/DBConnection");
const sec = require("./utils/Securitation");
require("dotenv").config();
var cors = require("cors");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require('path');

app.use(cors());

// Especificar el puerto y la dirección en la que escuchar
const port = process.env.API_HTTP_PORT || 80;
const sport = process.env.API_HTTPS_PORT || 443;

if (fs.existsSync(process.env.SSL_CONFIG_KEY) && fs.existsSync(process.env.SSL_CONFIG_CERT)) {
  privateKey = fs.readFileSync(process.env.SSL_CONFIG_KEY).toString();
  certificate = fs.readFileSync(process.env.SSL_CONFIG_CERT).toString();
  credentials = { key: privateKey, cert: certificate };
}

// Importar las rutas
const userRoutes = require("./routes/user");
const numberRoutes = require("./routes/number");

// Usar las rutas
app.use(express.static(path.join(__dirname, '../dist/ng-app')));app.use(express.json({limit: '50mb'}));

app.use("/user", userRoutes);
app.use("/number", numberRoutes);
sec.securize(app, process.env.ALLOWED_IPS);


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
