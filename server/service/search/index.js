'use strict';

var express = require('express');
var controller = require('./search.controller');
var router = express.Router();

router.get('/buildIndex', controller.indexing);
router.get('/suggest', controller.suggestion);
router.get('/preload', controller.preload);
router.get('/external/caDSR', controller.getDataFromCDE);
router.get('/local', controller.getDataFromGDC);

//node based api
router.get('/all', controller.search);

//property based api
router.get('/all/p', controller.searchP);
router.get('/p/local/vs', controller.getGDCData);
router.get('/p/cde/vs', controller.getCDEData);
router.get('/p/both/vs', controller.getGDCandCDEData);

module.exports = router;