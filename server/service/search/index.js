'use strict';

var express = require('express');
var controller = require('./search.controller');
var report = require('./report');
var router = express.Router();

router.get('/buildIndex', controller.indexing);
router.get('/suggest', controller.suggestion);
router.get('/preload', controller.preload);
router.get('/preloadSynonumsCtcae', controller.preloadSynonumsCtcae);
router.get('/preloadCadsrData', controller.preloadCadsrData);
router.get('/preloadCadsrDataType', controller.preloadDataTypeFromCaDSR);
router.get('/getPV', controller.getPV);
router.get('/parseExcel', controller.parseExcel);
router.get('/Unmapped', controller.Unmapped);
//router.get('/external/caDSR', controller.getDataFromCDE);
//router.get('/local', controller.getDataFromGDC);
router.get('/ncit/detail', controller.getNCItInfo);

//Generate Reports
// router.get('/export_ICDO3', report.export_ICDO3);
// router.get('/export_all', report.export2Excel);
// router.get('/exportAllValues', report.exportAllValues);
// router.get('/export', report.export_difference);
// router.get('/exportDifference', report.exportDifference);
// router.get('/export_common', report.export_common)

//property based api
router.get('/all/data', controller.searchICDO3Data);
router.get('/all/p', controller.searchP);
router.get('/p/local/vs', controller.getGDCData);
router.get('/p/cde/vs', controller.getCDEData);
router.get('/p/both/vs', controller.getGDCandCDEData);

module.exports = router;