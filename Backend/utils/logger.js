const winston = require("winston");
const path = require("path");

// Define custom levels including http
const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "green",
        http: "magenta",
        debug: "blue",
    },
};

// Tell winston about our custom colors
winston.addColors(customLevels.colors);

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        if (stack) {
            return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
        }
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
);

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "http",
    levels: customLevels.levels,
    format: logFormat,
    transports: [
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(__dirname, "../log/combined.log"),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write errors to error.log
        new winston.transports.File({
            filename: path.join(__dirname, "../log/error.log"),
            level: "error",
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});

// If not in production, also log to console with colors
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                winston.format.colorize({ all: false, level: true }),
                winston.format.printf(({ timestamp, level, message, stack }) => {
                    if (stack) {
                        return `${timestamp} [${level}]: ${message}\n${stack}`;
                    }
                    return `${timestamp} [${level}]: ${message}`;
                })
            ),
        })
    );
}

module.exports = logger;
