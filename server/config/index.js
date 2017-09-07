'use strict';

var path = require('path');
var _ = require('lodash');

var all = {
	// Root path of server
    root: path.normalize(__dirname + '/../..'),

	// Server port
	port: process.env.PORT || 3000,

	// Server port
    logDir: process.env.LOGDIR || '/var/log/gdcmvs',

	// Node environment (dev, test, stage, prod), must select one.
	env: process.env.NODE_ENV || 'prod',

	//gdc index name for building elasticsearch indices
	indexName: 'gdc',

	//suggestion index name for typeahead
	suggestionName: 'gdc-suggestion',

	//get data from caDSR
	caDSR_url:[
			"https://cdebrowser.nci.nih.gov/cdebrowserServer/rest/search?publicId=",
			"https://cdebrowser.nci.nih.gov/cdebrowserServer/rest/CDEData?deIdseq="
			],

	//get synonyms from NCIt
	NCIt_url: [
		'https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code=',
		'https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&type=synonym&code=',
		'http://nciws-d790.nci.nih.gov:15080/evsrestapi2/api/v1/ctrp/concept/'
	]
};

module.exports = _.merge(all, require('./' + all.env + '.js'));