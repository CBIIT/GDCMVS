'use strict';

module.exports = {
	opensearch: {
		// AWS openssearch configuration (production)
		node: process.env.OPENSEARCH_HOST,  // OpenSearch domain URL
		// node: 'https://search-xxx.region.es.amazonaws.com', // OpenSearch domain URL
	}
}