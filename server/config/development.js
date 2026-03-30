/**
 * local environment
 */

'use strict';

module.exports = {

	// AWS openssearch configuration (development)
	opensearchDomain: process.env.OPENSEARCH_DOMAIN,
	node:`https://${opensearchDomain}`, // OpenSearch domain URL
	log: 'error',
	requestTimeout: 300000

	/** local development 
	* opensearch: {
	*	node: 'https://127.0.0.1:9200',
	*	auth: {
	*		username: 'admin',
	*		password: process.env['OPENSEARCH_INITIAL_ADMIN_PASSWORD']
	*	},
	*	ssl: {
	*		reject
	*	}
    *
	*	log: 'error',
	*	requestTimeout: 300000,
	*}
    */	
};