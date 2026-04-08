'use strict';

module.exports = {
	opensearch: {
		// AWS openssearch configuration (upper tier)
		node: "https://" + process.env.OPENSEARCH_DOMAIN,  // OpenSearch domain URL
		// node: 'https://search-xxx.region.es.amazonaws.com', // OpenSearch domain URL
	}
};