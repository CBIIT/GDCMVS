/**
 * back-end logger for application
 */

const winston = require('winston');
const config = require('../config');
winston.emitErrs = true;

const tsFormat = () => (new Date()).toLocaleTimeString();

var logger = new winston.Logger({
  transports: [
    new (require('winston-daily-rotate-file'))({
      filename: config.logDir + '/-warning.log',
      timestamp: tsFormat,
      datePattern: 'yyyy-MM-dd',
      prepend: true,
      level: 'warn'
    }),
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});

module.exports = logger;
