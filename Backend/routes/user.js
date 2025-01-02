const express = require("express");
const router = express.Router();
const userModel = require("../database/models/user");
const jwt = require("jsonwebtoken");
const numberModel = require("../database/models/number");
const tokenUtils = require("../utils/TokenUtils");
const utils = require("../utils/utils");
const { Op } = require("sequelize");

const adminTokenUtils = require("../utils/AdminTokenUtils");

const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

require("dotenv").config();

// Define validation rules
const validateLogin = [
  body("username").isString().notEmpty().trim(),
  body("password").isString().notEmpty().trim(),
];

/**
 * Login for normal user, this methos check if the users exist, if icxist,
 * check the hassed password and created a token to allow the login in the rest of endpoints
 */
router.post("/login", validateLogin, async (request, response) => {
  try {
    // Check validation results
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    var { username, password } = request.body;

    console.log(`User ${username} starts the login process`);

    // Find user by username
    const user = await userModel.findOne({ where: { username: username } });

    // If user does not exist, return 400
    if (!user) {
      console.log(`User ${username} does not exist`);
      return response.status(400).json({ msg: "User does not exist" });
    }

    console.log(`User ${user.username} found`);

    if (user.administrator == 0) {
      // Compare the hashed password
      bcrypt.compare(
        password,
        String(user.password).trim(),
        function (err, result) {
          if (result == false) {
            console.log("Autentication failed, 401");
            response.status(401).json({ error: "Authentication failed" });
            return;
          }
          // Generate JWT token
          const token = jwt.sign(
            {
              userId: user.id,
              username: user.username,
              name_surname: user.name_surname,
            },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "1h",
            }
          );
          console.log("Autentication suscess, 200");
          response.status(200).json({ token });
          return;
        }
      );
    } else {
      console.log("Autentication failed, 402");
      response.status(401).json({ error: "Authentication failed" });
    }
  } catch (error) {
    console.error("Error during login process:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Exclusive login for administrators, this methos check if the users exist, if icxist,
 * check the hassed password and created a token to allow the login in the rest of the admin endpoints
 */
router.post("/login/admin", validateLogin, async (request, response) => {
  try {
    // Check validation results
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    var { username, password } = request.body;

    console.log(`User admin ${username} starts the login process`);

    // Find user by username
    const user = await userModel.findOne({ where: { username: username } });

    // If user does not exist, return 400
    if (!user) {
      console.log(`User ${username} does not exist`);
      return response.status(400).json({ msg: "User does not exist" });
    }

    console.log(`User ${user.username} found`);

    if (user.administrator == 1) {
      // Compare the hashed password
      bcrypt.compare(
        password,
        String(user.password).trim(),
        function (err, result) {
          if (result == false) {
            console.log("Autentication failed, 401");
            response.status(401).json({ error: "Authentication failed" });
            return;
          }
          // Generate JWT token
          const token = jwt.sign(
            {
              userId: user.id,
              username: user.username,
              admin: true,
            },
            process.env.JWT_SECRET_KEY_ADMIN, // Exclusive key for admins
            {
              expiresIn: "1h",
            }
          );
          console.log("Autentication suscess, 200");
          response.status(200).json({ token });
          return;
        }
      );
    } else {
      console.log("Autentication failed, 402");
      response.status(401).json({ error: "Authentication failed" });
    }
  } catch (error) {
    console.error("Error during login process:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Register a new User
 */
router.post(
  "/register",
  adminTokenUtils.verifyToken,
  async (request, response) => {
    try {
      var { username, nameSurname, password, admin } = request.body;
      var encrytedPass;

      await bcrypt.hash(password, 10, async function (err, hash) {
        encrytedPass = hash;

        const [user, created] = await userModel.findOrCreate({
          where: { username: username },
          defaults: {
            name_surname: nameSurname,
            password: encrytedPass,
            administrator: admin == true ? 1 : 0,
          },
        });

        if (created) {
          response.status(200).json({ messaege: "User created correctly" });
        } else {
          response.status(416).json({ messaege: "User already exists" });
        }
      });
    } catch (error) {
      console.error("Error during login process:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Get the classification of the users, depending on the number of numbers and repeated numbers of each user
 */
router.get(
  "/getUsersQualify",
  tokenUtils.verifyToken,
  async (request, response) => {
    try {
      // Fetch all users and numbers from the database
      const users = await userModel.findAll({
        attributes: [
          "id",
          "username",
          "name_surname",
          "profile_image",
          "administrator",
        ],
      });
      const numbers = await numberModel.findAll();

      // Map to store user data
      const userData = {};

      // Initialize user data
      users.forEach((user) => {
        if (user.administrator == 0) {
          const userDataValues = user.get({ plain: true });
          const { password, id, ...userWithoutPassword } = userDataValues;
          userData[id] = {
            ...userWithoutPassword, // Spread all user properties except password
            numbers: [], // Initialize empty numbers array
            numberCount: 0, // Initialize count of unique numbers
            repeatedCount: 0, // Initialize repeated count
            totalRepetitions: 0, // Initialize total repetitions count
            lastEntryDate: null, // Initialize last entry date
            daysSinceLastEntry: null, // Initialize days since last entry
          };
        }
      });

      // Organize numbers by user
      numbers.forEach((numberObj) => {
        const userId = numberObj.user_id;
        if (userData[userId]) {
          userData[userId].numbers.push(numberObj.number);

          // Update lastEntryDate if the current number's date is more recent
          if (
            !userData[userId].lastEntryDate ||
            new Date(numberObj.created_at) >
              new Date(userData[userId].lastEntryDate)
          ) {
            userData[userId].lastEntryDate = numberObj.created_at;
          }
        }
      });

      // Calculate counts, repeated numbers, total repetitions, and days since last entry
      Object.values(userData).forEach((data) => {
        const uniqueNumbers = new Set(data.numbers);
        data.numberCount = uniqueNumbers.size; // Count of unique numbers

        const numberFrequency = {};
        let repeatedCount = 0;
        let totalRepetitions = 0;

        data.numbers.forEach((num) => {
          numberFrequency[num] = (numberFrequency[num] || 0) + 1;
        });

        Object.values(numberFrequency).forEach((count) => {
          if (count > 1) {
            repeatedCount++;
            totalRepetitions += count; // Sum the total repetitions
          }
        });

        data.repeatedCount = repeatedCount;
        data.totalRepetitions = totalRepetitions;

        // Calculate days since last entry
        if (data.lastEntryDate) {
          const currentDate = new Date();
          const lastEntryDate = new Date(data.lastEntryDate);
          const diffTime = Math.abs(currentDate - lastEntryDate);
          data.daysSinceLastEntry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      });

      // Convert userData to an array and sort by numberCount and repeatedCount
      const sortedUsers = Object.values(userData)
        .map((data) => {
          // Return desired output format without the numbers array and id
          const { numbers, ...userWithoutNumbers } = data;
          return userWithoutNumbers;
        })
        .sort((a, b) => {
          if (b.numberCount !== a.numberCount) {
            return b.numberCount - a.numberCount;
          }
          return b.repeatedCount - a.repeatedCount;
        });

      // Respond with sorted user data
      response.status(200).json(sortedUsers);
    } catch (error) {
      response.status(500).send(error.message);
    }
  }
);

router.get(
  "/getAllUsers",
  adminTokenUtils.verifyToken,
  async (request, response) => {
    try {
      // Fetch all users and numbers from the database
      const users = await userModel.findAll();
      const numbers = await numberModel.findAll();

      // Map to store user data
      const userData = {};

      // Initialize user data
      users.forEach((user) => {
        const userDataValues = user.get({ plain: true });
        const { password, ...userWithoutPassword } = userDataValues;
        userData[user.id] = {
          ...userWithoutPassword, // Spread all user properties except password
          numbers: [], // Initialize empty numbers array
          numberCount: 0, // Initialize count of unique numbers
          repeatedCount: 0, // Initialize repeated count
        };
      });

      // Organize numbers by user
      numbers.forEach((numberObj) => {
        const userId = numberObj.user_id;
        if (userData[userId]) {
          userData[userId].numbers.push(numberObj.number);
        }
      });

      // Calculate counts and repeated numbers
      Object.values(userData).forEach((data) => {
        // Use a Set to get unique numbers
        const uniqueNumbers = new Set(data.numbers);
        data.numberCount = uniqueNumbers.size; // Count of unique numbers

        const numberFrequency = {};
        let repeatedCount = 0;

        data.numbers.forEach((num) => {
          numberFrequency[num] = (numberFrequency[num] || 0) + 1;
        });

        repeatedCount = Object.values(numberFrequency).filter(
          (count) => count > 1
        ).length;

        data.repeatedCount = repeatedCount;
      });

      // Convert userData to an array, maintaining the order by user id
      const sortedUsers = Object.values(userData).map((data) => {
        // Return desired output format without the numbers array
        const { numbers, ...userWithoutNumbers } = data;
        return userWithoutNumbers;
      });

      // Respond with sorted user data
      response.status(200).json(sortedUsers);
    } catch (error) {
      response.status(500).send(error.message);
    }
  }
);

/**
 * Obtain the actual day records
 */
router.get("/getProfile", tokenUtils.verifyToken, async (req, res) => {
  try {
    // Try to decode token from headers
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    // Remove Bearer from string
    token = token.replace(/^Bearer\s+/, "");
    var tokenDecrypted = tokenUtils.parseJwt(token);
    userModel
      .findOne({
        attributes: ["username", "name_surname", "profile_image"],
        where: {
          id: tokenDecrypted.userId,
        },
      })
      .then((data) => {
        res.status(200).send(data);
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while obtaining the use rporfile." });
  }
});

/**
 * Obtain the actual day records
 */
router.post("/editProfile", tokenUtils.verifyToken, async (req, res) => {
  try {
    // Try to decode token from headers
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    // Remove Bearer from string
    token = token.replace(/^Bearer\s+/, "");
    var tokenDecrypted = tokenUtils.parseJwt(token);
    var { username, name_surname, profile_image } = req.body;

    if (
      username.length <= 15 &&
      name_surname.length <= 25 &&
      utils.isBase64Image(profile_image)
    ) {
      utils
        .compressImage(profile_image, 228, 228)
        .then((resizedBase64) => {
          console.log("Imagen redimensionada en base64:", resizedBase64);

          userModel
            .update(
              {
                username: username,
                name_surname: name_surname,
                profile_image: resizedBase64,
              },
              {
                where: {
                  id: tokenDecrypted.userId,
                },
              }
            )
            .then((data) => {
              res.status(200).send("User data edited correctly");
            });
        })
        .catch((error) =>
          console.error("Error al redimensionar la imagen:", error)
        );
    } else {
      res.status(400).send("Error edititng user data");
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while editting the profile." });
  }
});

// Endpoint para obtener los números faltantes por línea para cada jugador
router.get("/bingoLine", async (req, res) => {
  // Definir los rangos de las líneas de bingo (1-9, 10-19, 20-29, ..., 90-99)
  const bingoLines = [
 
    { name: "10", range: [10, 19] },
    { name: "20", range: [20, 29] },
    { name: "30", range: [30, 39] },
    { name: "40", range: [40, 49] },
    { name: "50", range: [50, 59] },
    { name: "60", range: [60, 69] },
    { name: "70", range: [70, 79] },
    { name: "80", range: [80, 89] },
    { name: "90", range: [90, 99] },
  ];

  try {
    const users = await userModel.findAll({
      where:{
        administrator: 0
      },
      include: [
        {
          model: numberModel,
          attributes: ["number"],
        },
      ],
    });

    const result = users.map((user) => {
      const userNumbers = user.Numbers.map((num) => num.number);
      let fewestMissingLine = null;

      bingoLines.forEach((line) => {
        const { name, range } = line;
        const [start, end] = range;
        const lineNumbers = Array.from(
          { length: end - start + 1 },
          (_, i) => start + i
        );

        const missingNumbers = lineNumbers.filter(
          (num) => !userNumbers.includes(num)
        );

        if (
          !fewestMissingLine ||
          missingNumbers.length < fewestMissingLine.missingCount
        ) {
          fewestMissingLine = {
            line: name,
            missingCount: missingNumbers.length,
          };
        }
      });

      return {
        username: user.username,
        fewestMissingLine,
      };
    });

    // Ordenar el resultado por la cantidad de números faltantes en la línea
    result.sort(
      (a, b) =>
        a.fewestMissingLine.missingCount - b.fewestMissingLine.missingCount
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching missing lines:", error);
    res.status(500).json({ error: "Error fetching missing lines" });
  }
});

router.get("/isDayNumberAdded", tokenUtils.verifyToken, async (req, res) => {
  try {
    if(req.headers){
      // Try to decode token from headers
      let token = req.headers["x-access-token"] || req.headers["authorization"];
      console.debug(token)
      // Remove Bearer from string
      token = token.replace(/^Bearer\s+/, "");
      var tokenDecrypted = tokenUtils.parseJwt(token);
      const today = new Date();
      // Obtener la fecha de hoy en formato adecuado para comparación en Sequelize
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      // Check if a number has been addded by the user today
      const response = await numberModel.findOne({
        where: {
          user_id: tokenDecrypted.userId,
          created_at: {
            [Op.between]: [startOfDay, endOfDay], 
          },
        }
      });
      // If the number has been added return true if not false
      if(response) {
        res.status(200).send(true);
        return;
      }
      res.status(200).send(false);
      return;
    }
  } catch (error) {
    console.error("Error checking if the user has added the daily number:", error);
    res.status(500).json({ error: "Error checking if the user has added the daily number" });
    return;
  }
 

});

module.exports = router;
