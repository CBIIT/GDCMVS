const express = require('express');
const config = require('./index');
const compression = require('compression');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const fs = require('fs');
const rfs = require('rotating-file-stream');

const initExpress = function (app) {
  const env = config.env;

  // Set the environment to development if not specified
  if (env === 'development') {
    app.use(morgan('dev'));
  } else if (env === 'production' || env === 'test') {
    let logDirectory = config.logDir;

    // ensure log directory exists
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

    // create a rotating write stream
    const accessLogStream = rfs.createStream('access.log', {
      interval: '1d', // rotate daily
      path: logDirectory
    });

    morgan.format(
      'log-format',
      ':remote-addr - - [:date[clf]] ":method :url HTTP/:http-version" :status ":referrer" ":user-agent"'
    );
    // setup the logger
    app.use(morgan('log-format', { stream: accessLogStream }));
  }

  // Use Helmet to set various HTTP headers for security
  app.use(helmet());

  // Enable compression for responses
  app.use(compression());

  // Set security headers
  app.use(
    cors({
      origin: config.env === 'development' ? '*' : config.corsOrigin , // Restrict origins in production
      methods: 'GET,PUT,POST,DELETE'
    })
  );

  // Parse JSON bodies
  app.use(
    express.json({
      limit: '4mb' // 100kb default is too small
    })
  );

  // Parse URL-encoded bodies
  app.use(
    express.urlencoded({
      limit: '4mb', // 100kb default is too small
      extended: false // Keep this as false if you don't need nested objects
    })
  );

  // Method Override for supporting PUT and DELETE methods
  app.use(methodOverride());

  // Cookie Parser for parsing cookies
  app.use(cookieParser());
};

module.exports = initExpress;
