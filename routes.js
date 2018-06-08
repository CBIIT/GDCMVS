/**
 * Main application routes
 */

'use strict';

var config = require('./server/config');
var compression = require('compression');
var helmet =  require('helmet');

module.exports = function(app){
	app.use(compression());
	app.use(helmet());
	//allows CrossDomainAccess to API
	app.use(function(req, res, next){
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

		if(next){
			next();
		}
	});

	app.use('/search', require('./server/service/search'));
	
	// app.use('/ui', function(req, res){
	// 	let idx = req.query.idx;
	// 	if(idx == 1){
	// 		res.sendFile(app.get('viewPath') + '/index.html');
	// 	}
	// 	else{
	// 		res.sendFile(app.get('viewPath') + '/index_1.html');
	// 	}
	// })

	//put all the routers here
	app.use('/', function(req, res){
		res.render(app.get('views') + '/index.html');
		//res.sendFile(app.get('views') + '/index.html');
	});

	// All other routes should redirect to error page
  app.route('*').get(function(req, res) {
    res.sendFile(app.get('views') + '/404.html');
  });
};