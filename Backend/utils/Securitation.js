const sessions = require("express-session");
const ipFilter = require("express-ipfilter").IpFilter;
const compression = require("compression");
const bodyParser = require("body-parser");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const requestIp = require("request-ip");
const path = require("path");

/**
 * Initialize API securization
 * @param {*} app
 */
const securization = (app) => {
  //
  // Compressing requests
  console.silly("Compressing requests");
  app.use(compression());
  //
  // Add remote IP to request
  console.silly("Adding IP to request");
  app.use((req, res, next) => {
    req.ip = requestIp.getClientIp(req);
    next();
  });
  //
  // Only allow local network clients
  // console.silly("Filtering remote IPs");
  // var ips = process.env.ALLOWED_IPS.split(",");
  // app.use(ipFilter(ips, { mode: "allow" }));
  //
  // Sessions
  console.silly("Configuring sessions");
  //

  //

  //
  // Middleware
  console.silly("Configuring middleware");
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  //
  // Securizing headers
  console.silly("Securizing headers");
  app.use(cors());
  app.use(helmet());
  //
  // Morgan http logger redirection to winston
  console.silly("Loggin http requests");
  const stream = {
    // Use the http severity reirected to winston
    write: (message) => console.http(message),
  };
  const skip = () => {
    const env = process.env.NODE_ENV || "development";
    return env !== "development";
  };
  const morganMiddleware = morgan(
    ":remote-addr :method :url :status :res[content-length] - :response-time ms",
    { stream, skip }
  );
  app.use(morganMiddleware);
  //
  console.silly("Disabling x-powered-by");
  app.disable("x-powered-by");
  //
  // Rete limiter
  console.silly("Limiting request to 100 per 15 minutes per IP");
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  app.use(limiter);
  //
  // Custom error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(path.join(__dirname, "../public/500.html"));
  });
};
module.exports = { securization };
