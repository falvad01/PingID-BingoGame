const express = require("express");
const router = express.Router();
const userModel = require("../database/models/user");
const jwt = require("jsonwebtoken");
const numberModel = require("../database/models/number");
const tokenUtils = require("../utils/TokenUtils");

require("dotenv").config();

router.post("/login", (request, response) => {
  const { username, password } = request.body;

  console.log(`User ${username} start the login process`);

  if (typeof username !== "undefined") {
    //find user exist or not
    userModel.findOne({ where: { username: username } }).then((user) => {
      //if user not exist than return status 400
      if (!user) {
        return response.status(400).json({ msg: "User not exist" });
      }

      console.log(`User ${user.username} founded`);

      if (password == user.password) {
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

        response.status(200).json({ token });
      } else {
        response.status(401).json({ error: "Authentication failed" });
      }
    });
  } else {
    console.log(`User ${username} cant perform a login`);
    response.status(401).json({ error: "Authentication failed" });
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
      numbers.forEach(numberObj => {
        const userId = numberObj.user_id;
        if (!userData[userId]) {
          const user = users.find(user => user.id === parseInt(userId));
          // Remove the password field from the user object and extract data values
          const userDataValues = user.get({ plain: true });
          const { password, ...userWithoutPassword } = userDataValues;
          userData[userId] = {
            user: userWithoutPassword,
            numbers: [],
            numberCount: 0, // This will be the count of unique numbers
            repeatedCount: 0
          };
        }
        userData[userId].numbers.push(numberObj.number);
      });

      // Calculate counts and repeated numbers
      Object.values(userData).forEach(data => {
        // Use a Set to get unique numbers
        const uniqueNumbers = new Set(data.numbers);
        data.numberCount = uniqueNumbers.size; // Count of unique numbers

        const numberFrequency = {};
        let repeatedCount = 0;

        data.numbers.forEach(num => {
          numberFrequency[num] = (numberFrequency[num] || 0) + 1;
        });

        repeatedCount = Object.values(numberFrequency).filter(count => count > 1).length;

        data.repeatedCount = repeatedCount;
      });

      // Convert userData to an array for sorting
      const sortedUsers = Object.values(userData).map(data => ({
        user: data.user, // Ensure user object does not contain password
        numbers: data.numbers, // Include all numbers (with repeats)
        numberCount: data.numberCount,
        repeatedCount: data.repeatedCount
      })).sort((a, b) => {
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
