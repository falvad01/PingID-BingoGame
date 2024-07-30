const express = require("express");
const router = express.Router();
const userModel = require("../database/models/user");
const jwt = require("jsonwebtoken");
const numberModel = require("../database/models/number");
const tokenUtils = require("../utils/TokenUtils");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

require("dotenv").config();

// Define validation rules
const validateLogin = [
  body("username").isString().notEmpty().trim(),
  body("password").isString().notEmpty().trim(),
];

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

    // Compare the hashed password
    bcrypt.compare(password, String(user.password).trim(), function (err, result) {
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
      console.log("Autentication suscess, 201");
      response.status(200).json({ token });
    });
  } catch (error) {
    console.error("Error during login process:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

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

      // Organize numbers by user
      numbers.forEach((numberObj) => {
        const userId = numberObj.user_id;
        if (!userData[userId]) {
          const user = users.find((user) => user.id === parseInt(userId));
          // Remove the password field from the user object and extract data values
          const userDataValues = user.get({ plain: true });
          const { password, ...userWithoutPassword } = userDataValues;
          userData[userId] = {
            user: userWithoutPassword,
            numbers: [],
            numberCount: 0, // This will be the count of unique numbers
            repeatedCount: 0,
          };
        }
        userData[userId].numbers.push(numberObj.number);
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

      // Convert userData to an array for sorting
      const sortedUsers = Object.values(userData)
        .map((data) => ({
          user: data.user, // Ensure user object does not contain password
          numbers: data.numbers, // Include all numbers (with repeats)
          numberCount: data.numberCount,
          repeatedCount: data.repeatedCount,
        }))
        .sort((a, b) => {
          // Sort by number count first, then by repeated count
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

module.exports = router;
