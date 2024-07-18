const express = require("express");
const router = express.Router();
const numberModel = require("../database/models/number");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { Op, literal } = require("sequelize");
const today = new Date();

router.get("/", (req, res) => {
  res.send("Number endpoint");
});

router.post("/add/", (req, res) => {
  // Header names in Express are auto-converted to lowercase
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  // Remove Bearer from string
  token = token.replace(/^Bearer\s+/, "");

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: "Token is not valid",
        });
      } else {
        var tokenDecrypted = parseJwt(token);

        // Obtener la fecha de hoy en formato adecuado para comparación en Sequelize
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const [number, created] = await numberModel.findOrCreate({
          where: {
            user_id: tokenDecrypted.userId,
            created_at: {
              [Op.between]: [startOfDay, endOfDay], // Busca registros con created_at dentro del rango de hoy
            },
          },
          defaults: {
            number: req.query.number,
            created_at: new Date(), // Asegura que created_at se establezca con la fecha actual si se crea
          },
        });

        if (created) {
          return res.json({
            message: "Number added correctly",
            number: number.number,
          });
        }
      }
    });
  } else {
    return res.json({
      success: false,
      message: "Token not provided",
    });
  }
});

router.get("/usernNumbers", (req, res) => {

 // Header names in Express are auto-converted to lowercase
 let token = req.headers["x-access-token"] || req.headers["authorization"];

 // Remove Bearer from string
 token = token.replace(/^Bearer\s+/, "");

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
    if (err) {
      return res.json({
        success: false,
        message: "Token is not valid",
      });
    }else{

  
    var tokenDecrypted = parseJwt(token);

    numberModel
      .findAll({
        where: {
          user_id: tokenDecrypted.userId,
        },
      })
      .then((data) => {
        res.status(200).send(data);
      });
    }
  });
});

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

module.exports = router;
