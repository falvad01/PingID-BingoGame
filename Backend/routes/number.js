const express = require("express");
const router = express.Router();
const numberModel = require("../database/models/number");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { Op, literal } = require("sequelize");

const tokenUtils = require("../utils/TokenUtils");
const adminTokenUtils = require("../utils/AdminTokenUtils");

router.get("/", (req, res) => {
  res.send("Number endpoint");
});

/**
 * Add a new number to the list
 */
router.post("/add", tokenUtils.verifyToken, async (req, res) => {
  const today = new Date();
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

router.get("/getAllNumbers", tokenUtils.verifyToken, (req, res) => {
  try {
    numberModel
      .findAll({
        attributes: ["number", "created_at"],
      })
      .then((data) => {
        res.status(200).send(data);
      });
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * retunr stadistics
 */
router.get("/getStadistics", tokenUtils.verifyToken, async (req, res) => {
  try {
    // Fetch all numbers and their creation dates
    const data = await numberModel.findAll({
      attributes: ["number", "created_at"],
    });

    // Initialize a map to count occurrences
    const numberCount = new Map();

    // Count occurrences of each number
    data.forEach((entry) => {
      const number = entry.number;
      numberCount.set(number, (numberCount.get(number) || 0) + 1);
    });

    // Variables for storing statistics
    let mostFrequentNumber = 0; // Number that appears the most
    let allNumbersIntroduced = 0; // Number that appears the least
    let totalNumbers = 0; // Total numbers that have appeared
    let missingNumbers = 0; // Total numbers that have not appeared
    let onceAppearedCount = 0; // Count of numbers that have appeared only once
    let moreThanOnceCount = 0; // Count of numbers that have appeared more than once
    let maxCount = 0; // Maximum count for the most frequent number
    let minCount = Infinity; // Minimum count for the least frequent number


    allNumbersIntroduced = data.length

    // Loop over possible numbers (1-99)
    for (let i = 1; i <= 99; i++) {
      const count = numberCount.get(i) || 0;

      // Update most frequent number
      if (count > maxCount) {
        maxCount = count;
        mostFrequentNumber = i;
      }

      // Update least frequent number
      if (count < minCount) {
        minCount = count;
       
      }

      // Count unique, missing, single appearance, and multiple appearance numbers
      if (count > 0) {
        totalNumbers++;
        if (count === 1) {
          onceAppearedCount++;
        } else {
          moreThanOnceCount++;
        }
      } else {
        missingNumbers++;
      }
    }

    // If no numbers have repetitions, least frequent number should be handled
    if (minCount === Infinity) {
      minCount = 0;
      allNumbersIntroduced = null; // If no numbers are present, set it to null
    }

    // Send the statistics as a response
    res.json({
      mostFrequentNumber,
      allNumbersIntroduced,
      totalNumbers,
      missingNumbers,
      onceAppearedCount,
      moreThanOnceCount,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching statistics." });
  }
});

module.exports = router;
