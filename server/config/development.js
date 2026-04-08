/**
 * local environment
 */

'use strict';

module.exports = {

	 
	// AWS development
	opensearch: {
	    node: process.env.OPENSEARCH_HOST,  // OpenSearch domain URL
        // node: 'https://search-xxx.region.es.amazonaws.com', // OpenSearch domain URL
	} 

	/** local development
	opensearch: {
		// note that opensearch used locally normally requires https w/ auth and ssl (e.g. with default docker image/install) 
		// but for local dev, was able to re-build a docker image without the security plugin, and then use http w/o auth or ssl.
		node: "http://localhost:9200",  
	}
	*/
	
	
	/** local development but with standard docker, install
	* opensearch: {
	*	node: "https://localhost:9200",  // OpenSearch - note https
	*	username: 'admin',
	*		password: process.env['OPENSEARCH_INITIAL_ADMIN_PASSWORD']
	*	},
	*	ssl: {
	*		rejectUnauthorized: false
	*	}
	* }
	*/
    
};
