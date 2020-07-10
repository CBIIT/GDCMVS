'use strict';

const path = require('path');
const _ = require('lodash');

const all = {
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

	//NCIT details index name;
	ncitDetails: 'ncit-details',

	//index name for properties
	index_p: 'gdc-p',

	//index name for values
	index_v: 'gdc-v',

	// GDC searchable nodes
	searchable_nodes : ["case", "demographic", "diagnosis", "exposure", "family_history", "follow_up", "molecular_test",
		"treatment", "slide", "sample", "read_group", "portion", "analyte", "aliquot", "slide_image", "analysis_metadata",
		"clinical_supplement", "experiment_metadata", "pathology_detail", "pathology_report", "run_metadata", "biospecimen_supplement",
		"submitted_aligned_reads", "submitted_genomic_profile", "submitted_methylation_beta_value", "submitted_tangent_copy_number",
		"submitted_unaligned_reads", "data_release", "root"
	],

	// GDC drugs properties
	drugs_properties : ["therapeutic_agents"],

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
		'https://evsrestapi.nci.nih.gov/evsrestapi/api/v1/ctrp/concept/',
		'https://evsrestapi-stage.nci.nih.gov/evsrestapi/api/v1/conceptList?db=weekly&properties=Code,Preferred_Name,FULL_SYN,DEFINITION&concepts='
	]
};

module.exports = _.merge(all, require('./' + all.env + '.js'));