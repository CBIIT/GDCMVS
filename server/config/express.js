'use strict';

const express = require('express');
const config = require('./index');
const compression = require('compression');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');

module.exports = app => {

    let env = config.env;

    app.set('views', config.root + '/client');
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(compression());
    app.use(bodyParser.urlencoded({
        limit: '4mb', // 100kb default is too small
        extended: false
    }));
    app.use(bodyParser.json({
        limit: '4mb' // 100kb default is too small
    }));
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(express.static(path.join(config.root, 'client/static')));
    app.set('viewPath', 'client');

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    if ('dev' === env) {
        app.use(morgan('dev'));
    }
    else if('prod' === env || 'test' === env){
        let logDirectory = config.logDir;

        // ensure log directory exists
        fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

        // create a rotating write stream
        var accessLogStream = rfs('access.log', {
            interval: '1d', // rotate daily
            path: logDirectory
        })

        morgan.format('log-format', ':remote-addr - - [:date[clf]] ":method :url HTTP/:http-version" :status ":referrer" ":user-agent"');
        // setup the logger
        app.use(morgan('log-format', {stream: accessLogStream}));
    }
};