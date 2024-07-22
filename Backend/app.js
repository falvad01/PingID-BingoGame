// Importar módulos necesarios
const express = require("express");
const app = express();
const sequelize = require("./database/DBConnection");
require('dotenv').config()
var cors = require('cors')

app.use(cors()) 

// Especificar el puerto y la dirección en la que escuchar
const port = process.env.PORT || 4000;
const hostname = "127.0.0.1";

// Importar las rutas
const userRoutes = require("./routes/user");
const numberRoutes = require("./routes/number");

// Usar las rutas
app.use(express.json());
app.use("/user", userRoutes);
app.use("/number", numberRoutes);

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
    app.listen(port, hostname, () => {
      console.log(
        `El servidor se está ejecutando en http://${hostname}:${port}/`
      );
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
