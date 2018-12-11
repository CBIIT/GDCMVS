exports.error = function(res, err){
	return res.status(500).send(err);
};