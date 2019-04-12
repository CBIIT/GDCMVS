exports.error = (res, err) => {
	return res.status(500).send(err);
};