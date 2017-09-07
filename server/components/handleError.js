exports.error = function(res, err){
	return res.send(500, err);
};