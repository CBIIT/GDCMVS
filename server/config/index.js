'use strict';

var path = require('path');
var _ = require('lodash');

var all = {
	// Root path of server
    root: path.normalize(__dirname + '/../..'),

	// Server port
	port: process.env.PORT || 3000,

	// Server port
    logDir: process.env.LOGDIR || '/local/content/mvs/logs',

	// Node environment (dev, test, stage, prod), must select one.
	env: process.env.NODE_ENV || 'prod',

	//general gdc index name
	indexName: 'gdc',

	//suggestion index name for typeahead
	suggestionName: 'gdc-suggestion',

	//index name for properties
	index_p: 'gdc-p',

	//index name for values
	index_v: 'gdc-v',

	//get data from caDSR
	caDSR_url:[
			"https://cdebrowser.nci.nih.gov/cdebrowserServer/rest/search?publicId=",
			"https://cdebrowser.nci.nih.gov/cdebrowserServer/rest/CDEData?deIdseq="
			],

	//get synonyms from NCIt
	NCIt_url: [
		'https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code=',
		'https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&type=synonym&code=',
		'http://nciws-d790.nci.nih.gov:15080/evsrestapi2/api/v1/ctrp/concept/',
		'https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=CTCAE&type=synonym&code=',
		'https://evsrestapi-stage.nci.nih.gov/evsrestapi/api/v1/ctrp/concept/'
	]
};

module.exports = _.merge(all, require('./' + all.env + '.js'));