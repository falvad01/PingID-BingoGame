// /**
//  * File to set logger. Winston version: 2.4.0.
// */
//
// Read .env configuration file
const dotenv = require('dotenv');
dotenv.config();
const winston = require('winston');
var util = require('util');
require('winston-daily-rotate-file');
//
// Custom formatter to replicate console.log behaviour
const combineMessageAndSplat = winston.format((info, opts) => {
    //
    // combine message and args if any
    info.message = util.format(
        info.message,
        ...(info[Symbol.for("splat")] || [])
    );
    return info;
});
/**
 * Logger definition
 */
var logLevel = process.env.LOG_LEVEL || "silly";
var consoleLogFile = process.env.LOG_FILE || "info";
console.debug('Stablishing error level to -' + logLevel + '-');
const logger = winston.createLogger({
    level: logLevel,
    handleExceptions: true,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format.json()),
    transports: [
        //
        // Write all the log to the log file
        new winston.transports.DailyRotateFile({
            filename: 'log/log-%DATE%.log',
            level: consoleLogFile,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        }),
        //
        // Write only error to the error log file
        new winston.transports.DailyRotateFile({
            filename: 'log/error-%DATE%.log',
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d'
        })
    ],
});
/**
 * Init logger and redirect console... to Winston
 */
function initLogger() {
    //
    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    //
    if (process.env.NODE_ENV === 'production') {
        logger.add(new winston.transports.Console({
            format: winston.format.combine(
                winston.format.errors({ stack: true }),
                combineMessageAndSplat(),
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
                winston.format.colorize(),
                winston.format.printf(info => {
                    if (info.context) {
                        return `${info.timestamp} [${info.context}] [${info.level}] ${info.msg}` + (info.splat !== undefined ? `${info.splat}` : " ") + (info.stack !== undefined ? `${info.stack}` : ' ');
                    }
                    return `${info.timestamp} [${info.level}] ${info.msg}` + (info.splat !== undefined ? `${info.splat}` : " ") + (info.stack !== undefined ? `${info.stack}` : ' ');

                }))
        }));
    }
    //  
    // Redirect standar console output to winston
    console.silly = function (msg, contextID) { logger.log('silly', { msg: msg, context: contextID }) };
    console.debug = function (msg, contextID) { logger.log('debug', { msg: msg, context: contextID }) };
    console.verbose = function (msg, contextID) { logger.log('verbose', { msg: msg, context: contextID }) };
    console.http = function (msg, contextID) { logger.log('http', { msg: msg, context: contextID }) };
    console.info = function (msg, contextID) { logger.log('info', { msg: msg, context: contextID }) };
    //console.log = function(  ) { logger.log( 'info' , msg ) };
    console.warn = function (msg, contextID) { logger.log('warn', { msg: msg, context: contextID }) };
    console.error = function (msg, contextID) { logger.log('error', { msg: msg, context: contextID }) };
}
module.exports = { initLogger };