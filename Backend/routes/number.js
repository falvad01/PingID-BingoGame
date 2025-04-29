const express = require("express");
const router = express.Router();
const numberModel = require("../database/models/number");
const userModel = require("../database/models/user");
const { Op } = require("sequelize");
const tokenUtils = require("../utils/TokenUtils");
const utils = require("../utils/utils");
const moment = require('moment');

require("dotenv").config();

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

  const newNumber = parseInt(req.query.number, 10);

  console.log("Adding number %d", newNumber);

  // Validación para permitir solo números enteros entre 1 y 99
  if (Number.isInteger(newNumber) && newNumber > 0 && newNumber < 100) {
    const [number, created] = await numberModel.findOrCreate({
      where: {
        user_id: tokenDecrypted.userId,
        season_id: 2,
        created_at: {
          [Op.between]: [startOfDay, endOfDay], // Busca registros con created_at dentro del rango de hoy
        },
      },
      defaults: {
        number: newNumber,
        created_at: new Date(), // Asegura que created_at se establezca con la fecha actual si se crea
      },
    });

    if (created) {
      console.log(
        "Number %s created for user %s",
        number,
        tokenDecrypted.userId
      );
      return res.status(201).json({
        message: "Number added correctly",
        number: number,
      });
    } else {
      console.log(
        "Number %s already created for user %s",
        number,
        tokenDecrypted.userId
      );

      return res.status(400).json({
        message: "Number already created",
        number: number,
      });
    }
  } else {
    console.log(
      " Fail creating Nmber %s for user %s",
      number,
      tokenDecrypted.userId
    );
    return res.status(569).json({
      message: "Fail creating number",
      number: number,
    });
  }
});

/**
 * Return a list of the numbers 1-99 geting the number
 * of times that the number is repeated and the date of the number
 */
router.get("/getUserNumbers", tokenUtils.verifyToken, async (req, res) => {
  try {
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    const tokenDecrypted = tokenUtils.parseJwt(token);

    // Inicializar un objeto para contar las ocurrencias de cada número y para almacenar las fechas
    const numberCounts = {};
    const numberDates = {};
    for (let i = 1; i <= 99; i++) {
      numberCounts[i] = 0;
      numberDates[i] = [];
    }

    // Obtener los números del usuario
    const data = await numberModel.findAll({
      attributes: ["number", "created_at"],
      where: {
        user_id: tokenDecrypted.userId,
      },
    });

    // Contar las ocurrencias y almacenar las fechas
    data.forEach((record) => {
      const num = record.number;
      numberCounts[num]++;
      numberDates[num].push(record.created_at);
    });

    // Convertir el objeto de conteos a un array de objetos
    const result = Object.keys(numberCounts).map((number) => ({
      number: parseInt(number, 10),
      count: numberCounts[number],
      dates: numberDates[number],
    }));

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/getAllNumbers", tokenUtils.verifyToken, async (req, res) => {
  try {
    // Inicializar un objeto para contar las repeticiones de cada número y almacenar los usuarios
    const numberData = {};

    // Obtener todos los números almacenados
    const data = await numberModel.findAll({
      attributes: ["number"],
      include: [
        {
          model: userModel,
          attributes: ["username"],
        },
      ],
    });

    // Contar las repeticiones y almacenar los usuarios
    data.forEach((record) => {
      const num = record.number;
      const username = record.User.username;

      if (!numberData[num]) {
        numberData[num] = {
          number: num,
          repetitions: 0,
          users: {},
        };
      }

      numberData[num].repetitions++;
      if (!numberData[num].users[username]) {
        numberData[num].users[username] = 0;
      }
      numberData[num].users[username]++;
    });

    // Convertir el objeto de usuarios a un array de objetos
    const result = Object.values(numberData).map(
      ({ number, repetitions, users }) => ({
        number,
        repetitions,
        users: Object.keys(users).map((username) => ({
          username,
          count: users[username],
        })),
      })
    );

    res.status(200).send(result);
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

    allNumbersIntroduced = data.length;

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

/**
 * Obtain the actual day records
 */
router.get("/getTodayNumbers", tokenUtils.verifyToken, async (req, res) => {
  const startOfDay = new Date(); // Crea un nuevo objeto Date para hoy
  startOfDay.setHours(0, 0, 0, 0); // Establece el tiempo al inicio del día

  const endOfDay = new Date(); // Crea un nuevo objeto Date para hoy
  endOfDay.setHours(23, 59, 59, 999); // Establece el tiempo al final del día

  const todayRecords = await numberModel.findAll({
    attributes: ["number", "created_at"],
    where: {
      created_at: {
        [Op.between]: [startOfDay.getTime(), endOfDay.getTime()], // Filtra entre el inicio y el final del día
      },
    },

    include: [
      {
        model: userModel,
        attributes: ["username", "profile_image", "id"], // "id" es el user_id
      },
    ],
  });

  console.silly("Today records: " + todayRecords);
  // Añadir campo booleano 'alreadyExists' para cada registro, verificando si el número existe para ese usuario en cualquier otro día
  const enrichedRecords = await Promise.all(
    todayRecords.map(async (record) => {
      const userId = record.User.id;
      const number = record.number;

      // Obtener el inicio del día actual (00:00:00)
      const startOfToday = moment().startOf("day").toDate();

      // Verificar si el número ya existe para el usuario en días diferentes
      const numberExistsForUser = await numberModel.findOne({
        where: {
          user_id: userId,
          number: number,
          created_at: { [Op.lt]: startOfToday }, // Excluir registros creados hoy
        },
        raw: true,
      });

      // Añadir el campo 'alreadyExists' al objeto de registro
      return {
        ...record.toJSON(),
        alreadyExists: !!numberExistsForUser, // true si el número ya existe para este usuario en otros días, false si no
      };
    })
  );

  // Enviar los registros enriquecidos
  res.status(200).send(enrichedRecords);
});

module.exports = router;
