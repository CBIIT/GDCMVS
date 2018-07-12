'use strict';

var express = require('express');
var controller = require('./search.controller');
var router = express.Router();

router.get('/buildIndex', controller.indexing);
router.get('/suggest', controller.suggestion);
router.get('/preload', controller.preload);
router.get('/preloadSynonumsCtcae', controller.preloadSynonumsCtcae);
router.get('/preloadCadsrData', controller.preloadCadsrData);
router.get('/preloadCadsrDataType', controller.preloadDataTypeFromCaDSR);
//router.get('/parseExcel', controller.parseExcel);
//router.get('/external/caDSR', controller.getDataFromCDE);
//router.get('/local', controller.getDataFromGDC);
//router.get('/export_ICDO3', controller.export_ICDO3);
//router.get('/export_all', controller.export2Excel);
//router.get('/exportAllValues', controller.exportAllValues);
//router.get('/export', controller.export_difference);
router.get('/ncit/detail', controller.getNCItInfo);


//property based api
router.get('/all/data', controller.searchICDO3Data);
router.get('/all/p', controller.searchP);
router.get('/p/local/vs', controller.getGDCData);
router.get('/p/cde/vs', controller.getCDEData);
router.get('/p/both/vs', controller.getGDCandCDEData);

module.exports = router;