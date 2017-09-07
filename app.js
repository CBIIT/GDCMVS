'use strict';

var express = require('express');
var config = require('./server/config');
var app = express();

require('./server/config/express')(app);
require('./routes')(app);

app.listen(config.port, function(){
	console.log('my app listening on port :' + config.port);
});