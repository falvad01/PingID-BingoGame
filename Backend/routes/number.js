const express = require("express");
const router = express.Router();
const numberModel = require("../database/models/number");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { Op, literal } = require("sequelize");
const today = new Date();
const tokenUtils = require("../utils/TokenUtils");
const adminTokenUtils = require("../utils/AdminTokenUtils");

router.get("/", (req, res) => {
  res.send("Number endpoint");
});

router.post("/add", tokenUtils.verifyToken, async (req, res) => {
  // Obtener la fecha de hoy en formato adecuado para comparación en Sequelize
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  // Try to decode token from headers
  let token = req.headers["x-access-token"] || req.headers["authorization"];
  // Remove Bearer from string
  token = token.replace(/^Bearer\s+/, "");
  var tokenDecrypted = tokenUtils.parseJwt(token);

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
    return res.status(201).json({
      message: "Number added correctly",
      number: number.number,
    });
  } else {
    return res.status(469).json({
      message: "Number already created",
      number: number.number,
    });
  }
});

router.get("/getUserNumbers", tokenUtils.verifyToken, (req, res) => {
  try {
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    var tokenDecrypted = tokenUtils.parseJwt(token);
    numberModel
      .findAll({
        attributes: ["number", "created_at"],
        where: {
          user_id: tokenDecrypted.userId,
        },
      })
      .then((data) => {
        res.status(200).send(data);
      });
  } catch (errror) {
    res.status(500).send(errror);
  }
});

router.get("/getAllNumbers", adminTokenUtils.verifyToken, (req, res) => {
  try {
    numberModel
      .findAll({
        attributes: ["number", "created_at"],
      })
      .then((data) => {
        res.status(200).send(data);
      });
  } catch (errror) {
    res.status(500).send(errror);
  }
});

module.exports = router;
