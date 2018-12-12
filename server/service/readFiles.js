'use strict';

const fs = require('fs');
const path = require('path');

const dataFilesDir = path.join(__dirname, '..', 'data_files');

const ncitDetails = () => {
    let content = fs.readFileSync(dataFilesDir + "/ncit_details.js").toString();
	content = content.replace(/}{/g, ",");
	return JSON.parse(content);
}

const gdcValues = () => {
    let content = fs.readFileSync(dataFilesDir + "/gdc_values.js").toString();
	return JSON.parse(content);
}

const conceptCode = () => {
    let content = fs.readFileSync(dataFilesDir + "/conceptCode.js").toString();
	return JSON.parse(content);
}

const cdeData = () => {
    let content = fs.readFileSync(dataFilesDir + "/cdeData.js").toString();
	content = content.replace(/}{/g, ",");
	return JSON.parse(content);
}

const cdeDataType = () => {
    let content = fs.readFileSync(dataFilesDir + "/cdeDataType.js").toString();
	content = content.replace(/}{/g, ",");
	return JSON.parse(content);
}

const synonyms = () => {
    let content = fs.readFileSync(dataFilesDir + "/synonyms.js").toString();
	content = content.replace(/}{/g, ",");
	return JSON.parse(content);
}

const synonymsCtcae = () => {
    let content = fs.readFileSync(dataFilesDir + "/synonyms_ctcae.js").toString();
    return content;
}

const synonymsNcit = () => {
    let content = fs.readFileSync(dataFilesDir +  "/synonyms_ncit.js").toString();
    return content;
}

module.exports = {
    ncitDetails,
    gdcValues,
    conceptCode,
    cdeData,
    synonyms,
    cdeDataType,
    synonymsCtcae,
    synonymsNcit
};
