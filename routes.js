/**
 * Main application routes
 */

'use strict';

const config = require('./server/config');
const compression = require('compression');
const path = require('path');
const helmet = require('helmet');

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
		res.status(200).sendFile(path.join(config.root, 'client/dist/index.html'));
	});

	// All other routes should redirect to error page
	app.get('*', function (req, res) {
		res.status(404).sendFile(path.join(config.root, 'client/dist/views/404.html'));
	});
};
