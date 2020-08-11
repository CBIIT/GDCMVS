/**
 * Main application routes
 */

'use strict';

var config = require('./server/config');
var compression = require('compression');
var helmet = require('helmet');

module.exports = function (app) {
	app.use(compression());
	app.use(helmet());
	//allows CrossDomainAccess to API
	app.use(function (req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

		if (next) {
			next();
		}
	});

	app.use('/search/', require('./server/service/search'));
	app.use('/api/v1/', require('./server/service/api'));

	//put all the routers here
	app.get('/', function (req, res) {
		res.status(200).render(app.get('views') + '/index.html');
	});

	// All other routes should redirect to error page
	app.get('*', function (req, res) {
		res.status(404).sendFile(app.get('views') + '/404.html');
	});
};
