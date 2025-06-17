const routes = function (app) {

	app.use('/search/', require('./service/search'));
	app.use('/v1/', require('./service/api'));

	// 404 error handler for API endpoints
	app.use(function (req, res, next) {
		res.status(404).json({
			status: 'error',
			message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
			code: 'API_NOT_FOUND'
		});
	});

	// 500 error handler
	app.use(function (err, req, res, next) { 

		// Determine status code
		const statusCode = err.statusCode || 500;

		// Determine message (hide details in production for 5xx errors)
		let message = 'Internal Server Error';
		if (statusCode < 500 || process.env.NODE_ENV === 'development') {
			message = err.message;
		}

		// Log the error (very important for debugging)
		console.error(`Error ${statusCode}: ${message}`);
		if (process.env.NODE_ENV === 'development') {
			console.error(err.stack);
		}

		// Explicitly set Content-Type to application/json
		res.setHeader('Content-Type', 'application/json');

		// Send the JSON response
		res.status(statusCode).json({
			status: 'error',
			message: message,
			// Only include stack in development
			...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
		});
});
};

module.exports = routes;