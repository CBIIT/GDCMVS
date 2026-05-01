'use strict';

const express = require('express');
const config = require('./index');
const compression = require('compression');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const rfs = require('rotating-file-stream');

module.exports = app => {
  let env = config.env;
  let tier = config.tier;

  app.set('views', config.root + '/client');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(compression());
  app.use(express.urlencoded({
    limit: '4mb', // 100kb default is too small
    extended: false // Keep this as false if you don't need nested objects
  }));
  app.use(express.json({
    limit: '4mb' // 100kb default is too small
  }));
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(express.static(path.join(config.root, 'client/static')));
  app.use('/vendor/lodash', express.static(path.join(config.root, 'node_modules/lodash')));
  app.set('viewPath', 'client');

  if ((tier === 'development') || (tier === 'dev')) {
    app.use(morgan('dev'));
  } else if (tier === 'prod' || tier === 'test' || tier === 'stage' || tier === 'qa') {
    let logDirectory = config.logDir;

    // ensure log directory exists
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

    // create a rotating write stream
    const accessLogStream = rfs.createStream('access.log', {
      interval: '1d', // rotate daily
      path: logDirectory
    });

    morgan.format('log-format', ':remote-addr - - [:date[clf]] ":method :url HTTP/:http-version" :status ":referrer" ":user-agent"');
    // setup the logger
    app.use(morgan('log-format', { stream: accessLogStream }));
  }
};
