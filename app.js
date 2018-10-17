'use strict';

var express = require('express');
var config = require('./server/config');
var logger = require('./server/components/logger');
var app = express();


require('./server/config/express')(app);
require('./routes')(app);


app.listen(config.port, function(){
	logger.info('GDCMVS listening on port :' + config.port);
});