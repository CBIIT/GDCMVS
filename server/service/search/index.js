'use strict';

const express = require('express');
const controller = require('./search.controller');
const report = require('./report');
// const sheet = require('./googleSheets');
const router = express.Router();

router.get('/buildIndex', controller.indexing);
router.get('/suggest', controller.suggestion);
router.get('/suggestMisSpelled', controller.suggestionMisSpelled);
router.get('/gdcDictionaryVersion', controller.gdcDictionaryVersion);
router.get('/preloadSynonumsNcit', controller.preloadSynonumsNcit);
router.get('/loadNcitSynonymsContinue', controller.loadSynonyms_continue);
router.get('/preloadSynonumsCtcae', controller.preloadSynonumsCtcae);
router.get('/loadCtcaeSynonymsContinue', controller.loadCtcaeSynonyms_continue);
router.get('/preloadCadsrData', controller.preloadCadsrData);
router.get('/preloadCadsrDataType', controller.preloadDataTypeFromCaDSR);
router.get('/getPV', controller.getPV);
router.get('/parseExcel', controller.parseExcel);
router.get('/Unmapped', controller.Unmapped);
// router.get('/external/caDSR', controller.getDataFromCDE);
// router.get('/local', controller.getDataFromGDC);
router.get('/ncit/detail', controller.getNCItInfo);

// Generate Reports
// get all values report
// router.get('/exportAllValues', report.exportAllValues);
router.get('/exportMapping', report.exportMapping);
// Create a report with diff value with old version
// router.get('/exportDelta', report.exportDelta);
// router.get('/exportMorphology', report.exportMorphology);
// router.get('/addTermType', report.addTermType);
// router.get('/icdoMapping', report.icdoMapping);
// router.get('/releaseNote', report.releaseNote);
// router.get('/compareDataType', report.compareDataType);
// router.get('/ttNotAssigned', report.ttNotAssigned);

// property based api
router.get('/all/data', controller.searchICDO3Data);
router.get('/all/p', controller.searchP);
router.get('/p/local/vs', controller.getGDCData);

// router.get('/manageSheet', sheet.manageSheets);

module.exports = router;
