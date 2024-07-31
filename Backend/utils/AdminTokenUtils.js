var jwt = require("jsonwebtoken");

async function verifyToken(req, res, next) {
  //
  // Try to decode token from headers
  let token = req.headers["x-access-token"] || req.headers["authorization"];
  if (!token) {
    console.error("Auth: No token provided %s.", token);
    return res.status(403).send({ auth: false, message: "No token provided." });
  }

  // Remove Bearer from string
  token = token.replace(/^Bearer\s+/, "");

  // Check token
  jwt.verify(token, process.env.JWT_SECRET_KEY_ADMIN, async (err, decoded) => {
    //
    // If an error happens decoding token, return an error response
    if (err) {
      console.error("Auth: Failed to authenticate token.");
      return res.status(500).send({
        auth: false,
        message: "Failed to authenticate token.",
      });
    } else {
      next();
    }
  });
}

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

module.exports = { verifyToken, parseJwt };
