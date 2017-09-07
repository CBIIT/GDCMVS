'use strict';

var express = require('express');
var controller = require('./search.controller');
var router = express.Router();

router.get('/property', controller.propertySearch);
router.get('/value', controller.valueSearch);
router.get('/all', controller.search);
router.get('/buildIndex', controller.indexing);
router.get('/external/caDSR', controller.getDataFromCDE);
router.get('/suggest', controller.suggestion);
router.get('/preload', controller.preload);

module.exports = router;