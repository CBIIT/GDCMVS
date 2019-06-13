'use strict';

const express = require('express');
const controller = require('./../search/search.controller');

const router = express.Router();

router.get('/search', controller.searchAPI);

module.exports = router;
