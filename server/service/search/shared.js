'use strict';

const fs = require('fs');
const path = require('path');

const dataFilesDir = path.join(__dirname, '..', '..', 'data_files');

const readNCItDetails = () => {
    let content = fs.readFileSync(dataFilesDir + "/ncit_details.js").toString();
	content = content.replace(/}{/g, ",");
	return JSON.parse(content);
}

const readGDCValues = () => {
    let content = fs.readFileSync(dataFilesDir + "/gdc_values.js").toString();
	return JSON.parse(content);
}

const readConceptCode = () => {
    let content = fs.readFileSync(dataFilesDir + "/conceptCode.js").toString();
	return JSON.parse(content);
}

const readCDEData = () => {
    let content = fs.readFileSync(dataFilesDir + "/cdeData.js").toString();
	content = content.replace(/}{/g, ",");
	return JSON.parse(content);
}

const readCDEDataType = () => {
    let content = fs.readFileSync(dataFilesDir + "/cdeDataType.js").toString();
	content = content.replace(/}{/g, ",");
	return JSON.parse(content);
}

const readSynonyms = () => {
    let content = fs.readFileSync(dataFilesDir + "/synonyms.js").toString();
	content = content.replace(/}{/g, ",");
	return JSON.parse(content);
}

const readSynonymsCtcae = () => {
    let content = fs.readFileSync(dataFilesDir + "/synonyms_ctcae.js").toString();
    return content;
}

const readSynonymsNcit = () => {
    let content = fs.readFileSync(dataFilesDir +  "/synonyms_ncit.js").toString();
    return content;
}

const readGdcDictionaryVersion = () => {
    let content = fs.readFileSync(dataFilesDir +  "/VERSION").toString();
    return content;
}

module.exports = {
    readNCItDetails,
    readGDCValues,
    readConceptCode,
    readCDEData,
    readSynonyms,
    readCDEDataType,
    readSynonymsCtcae,
    readSynonymsNcit,
    readGdcDictionaryVersion
};
