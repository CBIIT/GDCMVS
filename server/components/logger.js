/**
 * back-end logger for application
 */

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;
const DailyRotateFile = require('winston-daily-rotate-file');
const config = require('../config');

// Define the custom format for the logs
const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create the logger
const logger = createLogger({
  // Set the default log level
  level: 'warn',
  format: combine(
    timestamp(),
    colorize(), // Colorize the output
    customFormat
  ),
  transports: [
    new transports.Console(
      {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true
      }
    ), // Log to the console
    new DailyRotateFile({
      level: 'warn',
      filename: 'mvs-%DATE%.log', // Log file name pattern
      dirname: config.logDir, // Directory where log files are stored
      datePattern: 'YYYY-MM-DD', // Date pattern for rotating logs
      maxFiles: '14d' // Keep logs for 14 days
    })
  ]
});

// Export the logger
module.exports = logger;
