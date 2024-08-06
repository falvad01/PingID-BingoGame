const express = require("express");
const router = express.Router();
const userModel = require("../database/models/user");
const jwt = require("jsonwebtoken");
const numberModel = require("../database/models/number");
const tokenUtils = require("../utils/TokenUtils");
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
 * Get the clasification of the users, dependending the number of numbers and repeated umbers of each users
 */
router.get(
  "/getUsersQualify",
  tokenUtils.verifyToken,
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

      // Convert userData to an array and sort by numberCount and repeatedCount
      const sortedUsers = Object.values(userData)
        .map((data) => {
          // Return desired output format without the numbers array
          const { numbers, ...userWithoutNumbers } = data;
          return userWithoutNumbers;
        })
        .sort((a, b) => {
          // Sort by numberCount descending
          if (b.numberCount !== a.numberCount) {
            return b.numberCount - a.numberCount;
          }
          // If numberCount is the same, sort by repeatedCount descending
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

module.exports = router;
