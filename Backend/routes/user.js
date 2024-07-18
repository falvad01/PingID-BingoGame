const express = require("express");
const router = express.Router();
const userModel = require("../database/models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/login", (request, response) => {
  const { username, password } = request.body;

  console.log(`User ${username} start the login process`);

  //find user exist or not
  userModel.findOne({ where: { username: username } }).then((user) => {
    //if user not exist than return status 400
    if (!user) return res.status(400).json({ msg: "User not exist" });

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
});

module.exports = router;
