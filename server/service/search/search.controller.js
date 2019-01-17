'use strict';

const elastic = require('../../components/elasticsearch');
const handleError = require('../../components/handleError');
const logger = require('../../components/logger');
const config = require('../../config');
const https = require('https');
const fs = require('fs');
const path = require('path');
const yaml = require('yamljs');
const xlsx = require('node-xlsx');
const _ = require('lodash');
const shared = require('./shared');
const folderPath = path.join(__dirname, '..', '..', 'data');
// const git = require('nodegit');
var cdeData = {};
var gdcData = {};

const suggestion = (req, res) => {
	let term = req.query.keyword;
	let suggest = {
		"term_suggest": {
			"prefix": term,
			"completion": {
				"field": "id",
				"size": 10
			}
		}
	};
	elastic.suggest(config.suggestionName, suggest, result => {
		if (result.suggest === undefined) {
			return handleError.error(res, result);
		}
		let dt = result.suggest.term_suggest;
		let data = [];
		dt[0].options.forEach(opt => {
			data.push(opt._source);
		});
		res.json(data);
	})
};

const suggestionMisSpelled = (req, res) => {
	let term = req.query.keyword.replace(/[ _-]+/g, " ");
	let suggest = {
		"term_suggest": {
			"prefix": term,
			"completion": {
				"field": "id",
				"size": 3,
				"fuzzy": {
					"fuzziness": "AUTO"
				}
			}
		}
	};
	elastic.suggest(config.suggestionName, suggest, result => {
		if (result.suggest === undefined) {
			return handleError.error(res, result);
		}
		let dt = result.suggest.term_suggest;
		let data = [];
		dt[0].options.forEach(opt => {
			data.push(opt._source);
		});
		res.json(data);
	})
};

const searchICDO3Data = (req, res) => {
	var icdo3_code = req.query.icdo3.trim();
	let query = {};

	if (icdo3_code.trim() !== '') {
		query.match_phrase_prefix = {};
		query.match_phrase_prefix["enum.i_c.have"] = {};
		query.match_phrase_prefix["enum.i_c.have"].query = icdo3_code;
		query.match_phrase_prefix["enum.i_c.have"].analyzer = "my_standard";
		//query.analyzer = "keyword";
		let highlight;

		elastic.query(config.index_p, query, highlight, result => {
			let mainData = [];
			if (result.hits === undefined) {
				res.send('No data found!');
			}
			let data = result.hits.hits;
			data.forEach(entry => {
				delete entry.sort;
				delete entry._index;
				delete entry._score;
				delete entry._type;
				delete entry._id;
			});

			for (let d in data) {
				let enums = data[d]._source.enum;
				let ICDO3Data = {};
				ICDO3Data.category = data[d]._source.category;
				ICDO3Data.node = data[d]._source.node;
				ICDO3Data.property = data[d]._source.name;
				ICDO3Data.enums = [];
				for (let e in enums) {
					if (enums[e].i_c) {
						let value = enums[e].i_c.have;
						value.map(x => {
							return x.toString().toUpperCase()
						})

						if (value.indexOf(icdo3_code.toString().toUpperCase()) > -1) {
							ICDO3Data.enums.push(enums[e]);
						}
					}
				}
				if (ICDO3Data.enums.length > 0) {
					mainData.push(ICDO3Data);
				}
			}
			if (mainData.length > 0) res.json(mainData);
			else res.send("No data found!");
		});
	} else {
		res.send('No data found!');
	}
}


const searchP = (req, res) => {
	let isBoolSearch = {
		value: false,
		type: "" 
	};
	let keyword = req.query.keyword.trim().replace(/[\ ]+/g, " ");
	let original_keyword = req.query.keyword.trim().replace(/[\ ]+/g, " ");
	if (keyword.trim() === '') {
		res.json([]);
	} else {
		if (keyword.indexOf('AND') !== -1 || keyword.indexOf('OR') !== -1 || keyword.indexOf('NOT') !== -1) {
			if(keyword.indexOf(' AND ') !== -1) isBoolSearch.type = "AND";
			if(keyword.indexOf(' OR ') !== -1) isBoolSearch.type = "OR";
			if(keyword.indexOf(' NOT ') !== -1) isBoolSearch.type = "NOT";
			if (keyword.indexOf('NOT') !== -1) keyword = keyword.replace(new RegExp('NOT', 'g'), 'OR');
			isBoolSearch.value = true;
		}
		let option = JSON.parse(req.query.option);
		let query = generateQuery(keyword, option, isBoolSearch);
		let highlight = generateHighlight(keyword, option, isBoolSearch);
		elastic.query(config.index_p, query, highlight, result => {
			if (result.hits === undefined) {
				return handleError.error(res, result);
			}
			let data = result.hits.hits;
			data.forEach(entry => {
				delete entry.sort;
				delete entry._index;
				delete entry._score;
				delete entry._type;
				delete entry._id;
			});
			res.json(data);
		});
	}
};

const generateQuery = (keyword, option, isBoolSearch) => {
	if (keyword.indexOf("/") !== -1 && option.match !== "exact") keyword = keyword.replace(/\//g, "\\/");
	let query = {};
	if (isBoolSearch.value === true && option.match !== "exact") {
		query.query_string = {};
		query.query_string.fields = [];
		query.query_string.fields.push("name.have");
		if (option.desc) {
			query.query_string.fields.push("desc");
		}
		if (option.syn) {
			query.query_string.fields.push("enum.s.have");
			query.query_string.fields.push("enum.all_syn.have");
			query.query_string.fields.push("cde_pv.n.have");
			query.query_string.fields.push("cde_pv.ss.s.have");
			query.query_string.fields.push("cde_pv.ss.c");

		}
		query.query_string.fields.push("enum.n_c");
		query.query_string.fields.push("enum.all_n_c");
		query.query_string.fields.push("cde.id");
		query.query_string.fields.push("enum.n.have");
		query.query_string.fields.push("enum.i_c.have");
		query.query_string.query = keyword;
	}
	else if(isBoolSearch.value === true && option.match === "exact"){
		if(isBoolSearch.type === "AND") {
			keyword = keyword.replace(new RegExp(' AND ', 'g'), ' ');
			query.bool = {};
			query.bool.should = [];
			let m = {};
			m.multi_match = {};
			m.multi_match.query = keyword;
			m.multi_match.analyzer = "case_insensitive";
			m.multi_match.fields = ["name"];
			if (option.desc) {
				m.multi_match.fields.push("desc");
			}
			if (option.syn) {
				m.multi_match.fields.push("enum.s");
				m.multi_match.fields.push("enum.all_syn");
				m.multi_match.fields.push("cde_pv.n");
				m.multi_match.fields.push("cde_pv.ss.s");
				m.multi_match.fields.push("cde_pv.ss.c");
			}
			m.multi_match.fields.push("enum.n");
			m.multi_match.fields.push("enum.n_c");
			m.multi_match.fields.push("enum.all_n_c");
			m.multi_match.fields.push("cde.id");
			m.multi_match.fields.push("enum.i_c.c");
			query.bool.should.push(m);
		}
		if(isBoolSearch.type === "OR"){
			query.bool = {};
			query.bool.should = [];
			let temp_keyword = keyword.split(' OR ');
			temp_keyword.forEach(value => {
				let m = {};
				m.multi_match = {};
				m.multi_match.query = value;
				m.multi_match.analyzer = "case_insensitive";
				m.multi_match.fields = ["name"];
				if (option.desc) {
					m.multi_match.fields.push("desc");
				}
				if (option.syn) {
					m.multi_match.fields.push("enum.s");
					m.multi_match.fields.push("enum.all_syn");
					m.multi_match.fields.push("cde_pv.n");
					m.multi_match.fields.push("cde_pv.ss.s");
					m.multi_match.fields.push("cde_pv.ss.c");
				}
				m.multi_match.fields.push("enum.n");
				m.multi_match.fields.push("enum.n_c");
				m.multi_match.fields.push("enum.all_n_c");
				m.multi_match.fields.push("cde.id");
				m.multi_match.fields.push("enum.i_c.c");
				query.bool.should.push(m);
			});
		}
		if(isBoolSearch.type === "NOT"){
			query.bool = {};
			query.bool.should = [];
			query.bool.must_not = [];
			let temp_keyword = keyword.split(' OR ');
			temp_keyword.forEach((value, index) => {
				if(index === 0){
					let m = {};
					m.multi_match = {};
					m.multi_match.query = value;
					m.multi_match.analyzer = "case_insensitive";
					m.multi_match.fields = ["name"];
					if (option.desc) {
						m.multi_match.fields.push("desc");
					}
					if (option.syn) {
						m.multi_match.fields.push("enum.s");
						m.multi_match.fields.push("enum.all_syn");
						m.multi_match.fields.push("cde_pv.n");
						m.multi_match.fields.push("cde_pv.ss.s");
						m.multi_match.fields.push("cde_pv.ss.c");
					}
					m.multi_match.fields.push("enum.n");
					m.multi_match.fields.push("enum.n_c");
					m.multi_match.fields.push("enum.all_n_c");
					m.multi_match.fields.push("cde.id");
					m.multi_match.fields.push("enum.i_c.c");
					query.bool.should.push(m);
				}
				else{
					let m = {};
					m.multi_match = {};
					m.multi_match.query = value;
					m.multi_match.analyzer = "case_insensitive";
					m.multi_match.fields = ["name"];
					if (option.desc) {
						m.multi_match.fields.push("desc");
					}
					if (option.syn) {
						m.multi_match.fields.push("enum.s");
						m.multi_match.fields.push("enum.all_syn");
						m.multi_match.fields.push("cde_pv.n");
						m.multi_match.fields.push("cde_pv.ss.s");
						m.multi_match.fields.push("cde_pv.ss.c");
					}
					m.multi_match.fields.push("enum.n");
					m.multi_match.fields.push("enum.n_c");
					m.multi_match.fields.push("enum.all_n_c");
					m.multi_match.fields.push("cde.id");
					m.multi_match.fields.push("enum.i_c.c");
					query.bool.must_not.push(m);
				}
			});
		}
	} 
	else {
		query.bool = {};
		query.bool.should = [];
		if (option.match !== "exact") {
			let m = {};
			m.match_phrase_prefix = {};
			m.match_phrase_prefix["name.have"] = keyword;
			query.bool.should.push(m);
			if (option.desc) {
				m = {};
				m.match_phrase_prefix = {};
				m.match_phrase_prefix["desc"] = keyword;
				query.bool.should.push(m);
			}
			if (option.syn) {
				m = {};
				m.match_phrase_prefix = {};
				m.match_phrase_prefix["enum.s.have"] = keyword;
				query.bool.should.push(m);
				m = {};
				m.match_phrase_prefix = {};
				m.match_phrase_prefix["enum.all_syn.have"] = keyword;
				query.bool.should.push(m);
				m = {};
				m.match_phrase_prefix = {};
				m.match_phrase_prefix["cde_pv.n.have"] = keyword;
				query.bool.should.push(m);
				m = {};
				m.match_phrase_prefix = {};
				m.match_phrase_prefix["cde_pv.ss.s.have"] = keyword;
				query.bool.should.push(m);
				m = {};
				m.match_phrase_prefix = {};
				m.match_phrase_prefix["cde_pv.ss.c"] = keyword;
				query.bool.should.push(m);
			}
			m = {};
			m.match_phrase_prefix = {};
			m.match_phrase_prefix["enum.n_c"] = keyword;
			query.bool.should.push(m);
			m = {};
			m.match_phrase_prefix = {};
			m.match_phrase_prefix["enum.all_n_c"] = keyword;
			query.bool.should.push(m);
			m = {};
			m.match_phrase_prefix = {};
			m.match_phrase_prefix["cde.id"] = keyword;
			query.bool.should.push(m);
			m = {};
			m.match_phrase_prefix = {};
			m.match_phrase_prefix["enum.n.have"] = keyword;
			query.bool.should.push(m);
			m = {};
			m.match_phrase_prefix = {};
			m.match_phrase_prefix["enum.i_c.have"] = {};
			m.match_phrase_prefix["enum.i_c.have"].query = keyword;
			m.match_phrase_prefix["enum.i_c.have"].analyzer = "my_standard";
			query.bool.should.push(m);
		} else {
			let m = {};
			m.multi_match = {};
			m.multi_match.query = keyword;
			m.multi_match.analyzer = "case_insensitive";
			m.multi_match.fields = ["name"];
			if (option.desc) {
				m.multi_match.fields.push("desc");
			}
			if (option.syn) {
				m.multi_match.fields.push("enum.s");
				m.multi_match.fields.push("enum.all_syn");
				m.multi_match.fields.push("cde_pv.n");
				m.multi_match.fields.push("cde_pv.ss.s");
				m.multi_match.fields.push("cde_pv.ss.c");
			}
			m.multi_match.fields.push("enum.n");
			m.multi_match.fields.push("enum.n_c");
			m.multi_match.fields.push("enum.all_n_c");
			m.multi_match.fields.push("cde.id");
			m.multi_match.fields.push("enum.i_c.c");
			query.bool.should.push(m);
		}
	}
	return query;
}

const generateHighlight = (keyword, option, isBoolSearch) => {
	if (keyword.indexOf("/") !== -1 && option.match !== "exact") keyword = keyword.replace(/\//g, "\\/");
	let highlight;
	if (isBoolSearch.value === true && option.match !== "exact") {
		highlight = {
			"pre_tags": ["<b>"],
			"post_tags": ["</b>"],
			"highlight_query": {
				"query_string": {
					"fields": [],
					"query": keyword
				}
			},
			"fields": {
				"name.have": {
					"number_of_fragments": 0
				},
				"enum.n.have": {
					"number_of_fragments": 0
				},
				"enum.i_c.have": {
					"number_of_fragments": 0
				},
				"enum.n_c": {
					"number_of_fragments": 0
				},
				"enum.all_n_c": {
					"number_of_fragments": 0
				},
				"cde.id": {
					"number_of_fragments": 0
				}
			}
		};
		highlight.highlight_query.query_string.fields.push("name.have");
		if (option.desc) {
			highlight.highlight_query.query_string.fields.push("desc");
		}
		if (option.syn) {
			highlight.highlight_query.query_string.fields.push("enum.s.have");
			highlight.highlight_query.query_string.fields.push("enum.all_syn.have");
			highlight.highlight_query.query_string.fields.push("cde_pv.n.have");
			highlight.highlight_query.query_string.fields.push("cde_pv.ss.s.have");
			highlight.highlight_query.query_string.fields.push("cde_pv.ss.c");

		}
		highlight.highlight_query.query_string.fields.push("enum.n_c");
		highlight.highlight_query.query_string.fields.push("enum.all_n_c");
		highlight.highlight_query.query_string.fields.push("cde.id");
		highlight.highlight_query.query_string.fields.push("enum.n.have");
		highlight.highlight_query.query_string.fields.push("enum.i_c.have");
		if (option.desc) {
			highlight.fields["desc"] = {
				"number_of_fragments": 0
			};
		}
		if (option.syn) {
			highlight.fields["enum.s.have"] = {
				"number_of_fragments": 0
			};
			highlight.fields["enum.all_syn.have"] = {
				"number_of_fragments": 0
			};
			highlight.fields["cde_pv.n.have"] = {
				"number_of_fragments": 0
			};
			highlight.fields["cde_pv.ss.s.have"] = {
				"number_of_fragments": 0
			};
			highlight.fields["cde_pv.ss.c"] = {
				"number_of_fragments": 0
			};
		}
	}
	else if(isBoolSearch.value === true && option.match === "exact"){
		highlight = {
			"pre_tags": ["<b>"],
			"post_tags": ["</b>"],
			"fields": {
				"name": {},
				"enum.n": {},
				"enum.i_c.c": {},
				"enum.n_c": {},
				"enum.all_n_c": {},
				"cde.id": {}
			}
		};
		if (option.desc) {
			highlight.fields["desc"] = {
				"number_of_fragments": 0
			};
		}
		if (option.syn) {
			highlight.fields["enum.s"] = {};
			highlight.fields["enum.all_syn"] = {};
			highlight.fields["cde_pv.n"] = {};
			highlight.fields["cde_pv.ss.s"] = {};
			highlight.fields["cde_pv.ss.c"] = {};
		}

	} 
	else {
		if (option.match !== "exact") {
			highlight = {
				"pre_tags": ["<b>"],
				"post_tags": ["</b>"],
				"fields": {
					"name.have": {
						"number_of_fragments": 0
					},
					"enum.n.have": {
						"number_of_fragments": 0
					},
					"enum.i_c.have": {
						"number_of_fragments": 0
					},
					"enum.n_c": {
						"number_of_fragments": 0
					},
					"enum.all_n_c": {
						"number_of_fragments": 0
					},
					"cde.id": {
						"number_of_fragments": 0
					}
				}
			};
			if (option.desc) {
				highlight.fields["desc"] = {
					"number_of_fragments": 0
				};
			}
			if (option.syn) {
				highlight.fields["enum.s.have"] = {
					"number_of_fragments": 0
				};
				highlight.fields["enum.all_syn.have"] = {
					"number_of_fragments": 0
				};
				highlight.fields["cde_pv.n.have"] = {
					"number_of_fragments": 0
				};
				highlight.fields["cde_pv.ss.s.have"] = {
					"number_of_fragments": 0
				};
				highlight.fields["cde_pv.ss.c"] = {
					"number_of_fragments": 0
				};
			}
		} else {
			highlight = {
				"pre_tags": ["<b>"],
				"post_tags": ["</b>"],
				"fields": {
					"name": {},
					"enum.n": {},
					"enum.i_c.c": {},
					"enum.n_c": {},
					"enum.all_n_c": {},
					"cde.id": {}
				}
			};
			if (option.desc) {
				highlight.fields["desc"] = {
					"number_of_fragments": 0
				};
			}
			if (option.syn) {
				highlight.fields["enum.s"] = {};
				highlight.fields["enum.all_syn"] = {};
				highlight.fields["cde_pv.n"] = {};
				highlight.fields["cde_pv.ss.s"] = {};
				highlight.fields["cde_pv.ss.c"] = {};
			}
		}
	}
	return highlight;
}

const indexing = (req, res) => {
	let configs = [];
	//config property index
	let config_property = {};
	config_property.index = config.index_p;
	config_property.body = {
		"settings": {
			"analysis": {
				"analyzer": {
					"case_insensitive": {
						"tokenizer": "keyword",
						"filter": [
							"lowercase", "whitespace_remove"
						]
					},
					"my_standard": {
						"tokenizer": "standard",
						"char_filter": ["my_filter"],
						"filter": ["standard", "lowercase"]
					}
				},
				"char_filter": {
					"my_filter": {
						"type": "mapping",
						"mappings": ["_=>-"]
					}
				},
				"filter": {
					"whitespace_remove": {
						"type": "pattern_replace",
						"pattern": "[_-]",
						"replacement": " "
					}
				}
			}
		},
		"mappings": {
			"props": {
				"properties": {
					"id": {
						"type": "keyword"
					},
					"category": {
						"type": "keyword"
					},
					"node": {
						"type": "keyword"
					},
					"name": {
						"type": "text",
						"fields": {
							"have": {
								"type": "text",
								"analyzer": "my_standard"
							}
						},
						"analyzer": "case_insensitive"
					},
					"enum.n": {
						"type": "text",
						"fields": {
							"have": {
								"type": "text"
							}
						},
						"analyzer": "case_insensitive"
					},
					"enum.s": {
						"type": "text",
						"fields": {
							"have": {
								"type": "text"
							}
						},
						"analyzer": "case_insensitive"
					},
					"enum.all_syn": {
						"type": "text",
						"fields": {
							"have": {
								"type": "text",
								"analyzer": "my_standard"
							}
						},
						"analyzer": "case_insensitive"
					},
					"enum.n_c": {
						"type": "text",
						"analyzer": "case_insensitive"
					},
					"enum.all_n_c": {
						"type": "text",
						"analyzer": "case_insensitive"
					},
					"cde.id": {
						"type": "text",
						"analyzer": "case_insensitive"
					},
					"cde_pv.n": {
						"type": "text",
						"fields": {
							"have": {
								"type": "text"
							}
						},
						"analyzer": "case_insensitive"
					},
					"cde_pv.ss.s": {
						"type": "text",
						"fields": {
							"have": {
								"type": "text"
							}
						},
						"analyzer": "case_insensitive"
					},
					"cde_pv.ss.c": {
						"type": "text",
						"analyzer": "case_insensitive"
					},
					"enum.i_c.c": {
						"type": "text",
						"analyzer": "case_insensitive"
					},
					"enum.i_c.have": {
						"type": "text"
					}
				}
			}
		}
	};
	configs.push(config_property);
	//config suggestion index
	let config_suggestion = {};
	config_suggestion.index = config.suggestionName;
	config_suggestion.body = {
		"mappings": {
			"suggestions": {
				"properties": {
					"id": {
						"type": "completion",
						"max_input_length": 100,
						"analyzer": "standard",
						"search_analyzer": "standard",
						"preserve_separators": false
					}
				}
			}
		}
	};
	configs.push(config_suggestion);
	elastic.createIndexes(configs, result => {
		if (result.acknowledged === undefined) {
			return handleError.error(res, result);
		}
		elastic.bulkIndex(data => {
			if (data.property_indexed === undefined) {
				return handleError.error(res, data);
			}
			return res.status(200).json(data);
		});
	});
};

const getDataFromCDE = (req, res) => {
	if (cdeData === '') {
		//load data file to memory
		cdeData = shared.readCDEData();
		let syns = shared.readSynonyms();
		for (var c in cdeData) {
			let pvs = cdeData[c];
			pvs.forEach(pv => {
				if (pv.pvc !== null && pv.pvc.indexOf(':') === -1) {
					pv.syn = syns[pv.pvc];
				}
				if (pv.pvc !== null && pv.pvc.indexOf(':') >= 0) {
					let cs = pv.pvc.split(":");
					let synonyms = [];
					cs.forEach(s => {
						if (!(s in syns)) {
							return;
						}
						let entry = {};
						entry.code = s;
						entry.syn = syns[s];
						synonyms.push(entry);
					});
					pv.ss = synonyms;
				}
			});
		}
	}
	let uid = req.query.uid;
	res.json(cdeData[uid]);
};

const getCDEData = (req, res) => {
	let uid = req.query.id;
	if (cdeData[uid] == undefined) {
		//load data file to memory

		let query = {};
		query.term = {};
		query.term["cde.id"] = uid;
		elastic.query(config.index_p, query, null, result => {
			if (result.hits === undefined) {
				return handleError.error(res, result);
			}
			let data = result.hits.hits;
			//cache the data and response
			if (data.length > 0) {
				let p = data[0];
				cdeData[uid] = p._source.cde_pv;
				let pid = p._source.category + "." + p._source.node + "." + p._source.name;
				if (!(pid in gdcData)) {
					gdcData[pid] = p._source.enum;
				}
			}

			res.json(cdeData[uid]);
		});
	} else {
		res.json(cdeData[uid]);
	}
};

const getDataFromGDC = (req, res) => {
	if (gdcData === '') {
		//load data file to memory
		let cc = shared.readConceptCode();
		let syns = shared.readSynonyms();
		let gv = shared.readGDCValues();
		gdcData = {};
		//load data from gdc_values.js to memory
		for (var c in gv) {
			gdcData[c] = [];
			gv[c].forEach(ss => {
				let tmp = {};
				tmp.pv = ss.nm;
				tmp.pvc = ss.n_c;
				tmp.code = ss.i_c;
				tmp.syn = syns[ss.n_c];
				gdcData[c].push(tmp);
			});
		}
		//load data from conceptCode.js to memory
		for (var t in cc) {
			gdcData[t] = [];
			let obj = cc[t];
			for (var m in obj) {
				let tmp = {};
				tmp.pv = m;
				tmp.pvc = obj[m];
				tmp.syn = syns[tmp.pvc];
				gdcData[t].push(tmp);
			}
		}
	}
	let uid = req.query.uid;
	res.json(gdcData[uid]);
};

const getGDCData = (req, res) => {
	let uid = req.query.id;
	if (gdcData[uid] == undefined) {
		//load data file to memory

		let query = {};
		query.terms = {};
		query.terms._id = [];
		query.terms._id.push(uid);
		elastic.query(config.index_p, query, null, result => {
			if (result.hits === undefined) {
				return handleError.error(res, result);
			}
			let data = result.hits.hits;
			//cache the data and response

			if (data.length > 0) {
				let p = data[0];
				gdcData[uid] = p._source.enum;
				let cde = p._source.cde;
				if (cde !== undefined && !(cde.id in cdeData)) {
					cdeData[cde.id] = p._source.cde_pv;
				}
			}

			res.json(gdcData[uid]);
		});
	} else {
		res.json(gdcData[uid]);
	}
};

const getGDCandCDEData = (req, res) => {
	let uid = req.query.local;
	let cdeId = req.query.cde;
	if (gdcData[uid] == undefined) {
		//load data file to memory

		let query = {};
		query.terms = {};
		query.terms._id = [];
		query.terms._id.push(uid);
		elastic.query(config.index_p, query, null, result => {
			if (result.hits === undefined) {
				return handleError.error(res, result);
			}
			let data = result.hits.hits;
			//cache the data and response

			if (data.length > 0) {
				let p = data[0];
				gdcData[uid] = p._source.enum;
				let cde = p._source.cde;
				if (cde !== undefined && !(cde.id in cdeData)) {
					cdeData[cde.id] = p._source.cde_pv;
				}
			}

			let tmp = {};
			tmp.to = cdeData[cdeId];
			tmp.from = gdcData[uid];
			res.json(tmp);
		});
	} else {
		let result = {};
		result.to = cdeData[cdeId];
		result.from = gdcData[uid];
		res.json(result);
	}

};

const preloadCadsrData = (req, res) => {
	elastic.preloadDataFromCaDSR(result => {
		if (result === "CDE data Refreshed!!") {
			res.end('Success!!');
		} else {
			res.write(result);
		}
	});
}

const preloadDataTypeFromCaDSR = (req, res) => {
	elastic.preloadDataTypeFromCaDSR(result => {
		if (result === "CDE data Refreshed!!") {
			res.end('Success!!');
		} else {
			res.write(result);
		}
	});
}

const preloadSynonumsNcit = (req, res) => {
	let arr = [];
	elastic.loadSynonyms(result => {
		if (result === "Success") {
			copyToSynonymsJS();
			res.end('Success!!');
		} else {
			if (arr.length === 50) {
				res.write(arr.toString());
				arr = [];
				arr.push(result);
			}else{
				arr.push(result);
			}
		}
	});
};

const loadSynonyms_continue = (req, res) => {
	elastic.loadSynonyms_continue(result => {
		if (result === "Success") {
			copyToSynonymsJS();
			res.end('Success!!');
		} else {
			res.write(result);
		}
	});
};

const preloadSynonumsCtcae = (req, res) => {
	let arr = [];
	elastic.loadSynonymsCtcae(result => {
		if (result === "Success") {
			copyToSynonymsJS();
			res.end('Success!!');
		} else {
			if (arr.length === 5) {
				res.write(arr.toString());
				arr = [];
				arr.push(result);
			}else{
				arr.push(result);
			}
		}
	})
};

const loadCtcaeSynonyms_continue = (req, res) => {
	elastic.loadCtcaeSynonyms_continue(result => {
		if (result === "Success") {
			copyToSynonymsJS();
			res.end('Success!!');
		} else {
			res.write(result);
		}
	})
};

const copyToSynonymsJS = () => {
	let content_1 = shared.readSynonymsCtcae();
	let content_2 = shared.readSynonymsNcit();
	fs.writeFileSync("./server/data_files/synonyms.js", content_2 + content_1, function (err) {
		if (err) return logger.error(err);
	});
}

const getPV = (req, res) => {
	let query = {
		"match_all": {}
	};

	elastic.query(config.index_p, query, null, result => {
		if (result.hits === undefined) {
			return handleError.error(res, result);
		}
		let data = result.hits.hits;
		let cc = [];
		data.forEach(entry => {
			let vs = entry._source.enum;
			if (vs) {
				vs.forEach(v => {
					if (v.n_c && cc.indexOf(v.n_c) == -1) {
						cc.push(v.n_c);

					}
				});
			}
		});
		fs.truncate('./server/data_files/ncit_details.js', 0, () => {
			console.log('ncit_details.js truncated')
		});
		getPVFunc(cc, 0, data => {
			if (data === "Success") {
				res.end(data);
			} else {
				res.write(data);
			}
		});
	});
}

const getPVFunc = (ncitids, idx, next) => {
	if (idx >= ncitids.length) {
		return;
	}
	https.get(config.NCIt_url[4] + ncitids[idx], (rsp) => {
		let html = '';
		rsp.on('data', (dt) => {
			html += dt;
		});
		rsp.on('end', () => {
			if (html.trim() !== '') {
				let d = JSON.parse(html);
				if (d.preferredName !== undefined) {
					let tmp = {}
					tmp[ncitids[idx]] = {};
					tmp[ncitids[idx]].preferredName = d.preferredName;
					tmp[ncitids[idx]].code = d.code;
					tmp[ncitids[idx]].definitions = d.definitions;
					tmp[ncitids[idx]].synonyms = d.synonyms;

					fs.appendFile("./server/data_files/ncit_details.js", JSON.stringify(tmp), err => {
						if (err) return logger.error(err);
					});
				}
			}
			idx++;
			getPVFunc(ncitids, idx, next);
			if (ncitids.length == idx) {
				return next('Success');
			} else {
				return next("NCIT finished number: " + idx + " of " + ncitids.length + "\n");
			}
		});
	}).on('error', (e) => {
		logger.debug(e);
	});
};

const removeDeprecated = () => {
	let deprecated_properties = [];
	let deprecated_enum = [];
	fs.readdirSync(folderPath).forEach(file => {
		if (file.indexOf('_') !== 0) {
			let fileJson = yaml.load(folderPath + '/' + file);
			let category = fileJson.category;
			let node = fileJson.id;

			if (fileJson.deprecated) {
				fileJson.deprecated.forEach(d_p => {
					let tmp_d_p = category + "." + node + "." + d_p;
					deprecated_properties.push(tmp_d_p);
				})
			}

			for (let keys in fileJson.properties) {
				if (fileJson.properties[keys].deprecated_enum) {
					fileJson.properties[keys].deprecated_enum.forEach(d_e => {
						let tmp_d_e = category + "." + node + "." + keys + ".#" + d_e;
						deprecated_enum.push(tmp_d_e);
					});
				}
			}
		}
	});
	let concept = shared.readConceptCode();
	deprecated_properties.forEach(d_p => {
		if (concept[d_p]) {
			delete concept[d_p];
		}
	});
	deprecated_enum.forEach(d_e => {
		let cnp = d_e.split(".#")[0];
		let cnp_key = d_e.split(".#")[1];
		if (concept[cnp]) {
			for (let key in concept[cnp]) {
				if (key === cnp_key) {
					let tmp_value = concept[cnp];
					delete tmp_value[cnp_key];
				}
			}
		}
	});
	fs.writeFileSync("./server/data_files/conceptCode.js", JSON.stringify(concept), err => {
		if (err) return logger.error(err);
	});
}

const getNCItInfo = (req, res) => {
	let code = req.query.code;
	let ncit_pv = shared.readNCItDetails();
	if (ncit_pv[code]) {
		res.json(ncit_pv[code]);
	} else {
		let url = config.NCIt_url[4] + code;
		https.get(url, (rsp) => {
			let html = '';
			rsp.on('data', (dt) => {
				html += dt;
			});
			rsp.on('end', () => {
				if (html.trim() !== '') {
					let data = JSON.parse(html);
					res.json(data);
				}
			});
		}).on('error', (e) => {
			logger.debug(e);
		});
	}
};

const parseExcel = (req, res) => {
	var folderPathMapping = path.join(__dirname, '..', '..', 'excel_mapping');
	let concept = shared.readConceptCode();
	let all_gdc_values = shared.readGDCValues();
	fs.readdirSync(folderPathMapping).forEach(file => {
		if (file.indexOf('.xlsx') !== -1) {
			var dataParsed = [];
			var obj = xlsx.parse(folderPathMapping + '/' + file);
			obj.forEach(sheet => {
				var worksheet = sheet.data;

				for (var n = 1; n < worksheet.length; n++) {
					var row = worksheet[n];
					let temp_data = {};
					if (row.length > 0) {
						if (row[0]) {
							temp_data.category = row[0];
						} else {
							temp_data.category = "";
						}
						if (row[1]) {
							temp_data.node = row[1];
						} else {
							temp_data.node = "";
						}
						if (row[2]) {
							temp_data.property = row[2];
						} else {
							temp_data.property = "";
						}
						if (row[3]) {
							temp_data.value = row[3];
						} else {
							temp_data.value = "";
						}
						if (row[5]) {
							temp_data.ncit_code = row[5];
						} else {
							temp_data.ncit_code = "";
						}
						if (row[6]) {
							temp_data.icdo3_code = row[6];
							if (row[7]) {
								temp_data.icdo3_term = row[7];
							} else {
								temp_data.icdo3_term = "";
							}
						}
						dataParsed.push(temp_data);
					}
				}
			});

			for (let dp in dataParsed) {
				if (dataParsed[dp].icdo3_code) {
					//If the excel file has icdo3 codes, save the difference in gdc_values.js file.
					let icdo = shared.readGDCValues();
					let category_node_property = dataParsed[dp].category + "." + dataParsed[dp].node + "." + dataParsed[dp].property;
					if (icdo[category_node_property]) {
						//If some of the mapping exists for this category.node.property
						var temp_obj = {
							nm: dataParsed[dp].icdo3_term,
							i_c: dataParsed[dp].icdo3_code,
							n_c: dataParsed[dp].ncit_code
						};
						if (!mappingExists(icdo[category_node_property], temp_obj)) {
							logger.info("new icdo3 mapping found " + JSON.stringify(temp_obj));
							icdo[category_node_property].push(temp_obj);
						}

					} else {
						//If no mapping exists for this category.node.property	
						icdo[category_node_property] = [];
						var temp_obj = {
							nm: dataParsed[dp].icdo3_term,
							i_c: dataParsed[dp].icdo3_code,
							n_c: dataParsed[dp].ncit_code
						};
						icdo[category_node_property].push(temp_obj);
					}
					//write changes to file
					fs.writeFileSync("./server/data_files/gdc_values.js", JSON.stringify(icdo), err => {
						if (err) return logger.error(err);
					});

				} else {
					let category_node_property = dataParsed[dp].category + "." + dataParsed[dp].node + "." + dataParsed[dp].property;
					let c_n_p = all_gdc_values[category_node_property];
					delete all_gdc_values[category_node_property];
					if (c_n_p) {
						all_gdc_values[category_node_property] = [];
						c_n_p.forEach(prop_values => {
							if (dataParsed[dp].value === prop_values.nm && !prop_values.n_c) {
								prop_values.n_c = dataParsed[dp].ncit_code;
							}
							all_gdc_values[category_node_property].push(prop_values);
						});

					}

					var cc = {};
					//If the excel file don't have icdo3 code, save the difference in conceptCode.js file.
					if (concept[category_node_property]) {
						//If category.node.property already exists in the conceptCode.js file, then delete it.
						//delete concept[category_node_property]
						var temp_cc = {};
						for (let temp_dp in dataParsed) {
							if (category_node_property === dataParsed[temp_dp].category + "." + dataParsed[temp_dp].node + "." + dataParsed[temp_dp].property) {
								if (dataParsed[temp_dp].ncit_code) {
									temp_cc[category_node_property] = {
										[dataParsed[temp_dp].value]: dataParsed[temp_dp].ncit_code
									}
								} else {
									temp_cc[category_node_property] = {
										[dataParsed[temp_dp].value]: ""
									}
								}
								Object.assign(concept[category_node_property], temp_cc[category_node_property]);
							}
						}
					} else {
						var helper_cc = {};
						helper_cc[category_node_property] = {}
						var temp_cc = {};
						for (let temp_dp in dataParsed) {
							if (dataParsed[dp].category + "." + dataParsed[dp].node + "." + dataParsed[dp].property === dataParsed[temp_dp].category + "." + dataParsed[temp_dp].node + "." + dataParsed[temp_dp].property) {

								if (dataParsed[temp_dp].ncit_code) {
									temp_cc[category_node_property] = {
										[dataParsed[temp_dp].value]: dataParsed[temp_dp].ncit_code
									}
								} else {
									temp_cc[category_node_property] = {
										[dataParsed[temp_dp].value]: ""
									}
								}
								Object.assign(helper_cc[category_node_property], temp_cc[category_node_property]);
							}
						}
						cc = helper_cc;
					}
					Object.assign(concept, cc);
					fs.writeFileSync("./server/data_files/conceptCode.js", JSON.stringify(concept), err => {
						if (err) return logger.error(err);
						logger.debug("adding new mapping in concept code " + JSON.stringify(temp_concept));
					});
				}
			}

		}
	});
	fs.writeFileSync("./server/data_files/gdc_values.js", JSON.stringify(all_gdc_values), err => {
		if (err) return logger.error(err);
	});
	// removeDeprecated();
	res.json({
		"status": "success",
		"message": "Done"
	});
}

const mappingExists = (arr, obj) => {
	for (let a in arr) {
		var checker = JSON.stringify(arr[a]) == JSON.stringify(obj);
		if (checker) {
			return true;
		}
	}
	return false;
}

const Unmapped = (req, res) => {
	let concept = shared.readConceptCode();
	for (let keys in concept) {
		let node = keys.split('.')[1];
		let property = keys.split('.')[2];
		if (fs.existsSync(folderPath + '/' + node + '.yaml')) {
			let fileData = yaml.load(folderPath + '/' + node + '.yaml');
			if (fileData.properties[property]) {
				let local_property = fileData.properties[property];
				if (local_property.deprecated_enum) {
					let local_enum = local_property.enum;
					let local_d_enum = local_property.deprecated_enum;
					let final_enum = _.differenceWith(local_enum, local_d_enum, _.isEqual);
					let local_values = [];
					for (let file_values in concept[keys]) {
						local_values.push(file_values);
					}
					let value_not_found = _.differenceWith(final_enum, local_values, _.isEqual);
					value_not_found.forEach(new_val => {
						let local_obj = concept[keys];
						local_obj[new_val] = "";
					});
				} else {
					let final_enum = local_property.enum;
					let local_values = [];
					for (let file_values in concept[keys]) {
						local_values.push(file_values);
					}
					let value_not_found = _.differenceWith(final_enum, local_values, _.isEqual);
					value_not_found.forEach(new_val => {
						let local_obj = concept[keys];
						local_obj[new_val] = "";
					});
				}
			}
		}
	}
	let icdo = shared.readGDCValues();
	for (let keys in icdo) {
		if (concept[keys]) {
			let cc_values = concept[keys];
			icdo[keys].forEach(value => {
				//if the "value" in conceptCode.js is similar to "icdo3" code in gdc_values.js, remove that value from conceptCode.js
				for (let val in cc_values) {
					if (val === value.i_c) {
						delete cc_values[val];
					}
				}
				if (cc_values[value.nm] || cc_values[value.nm] == "") {
					if (cc_values[value.nm] == value.n_c || cc_values[value.nm] == "") {
						delete cc_values[value.nm];
					}
					if (value.n_c == "" && cc_values[value.nm]) {
						value.n_c = cc_values[value.nm];
						delete cc_values[value.nm];
					}
				}
			});
		}
	}
	fs.writeFileSync("./server/data_files/gdc_values.js", JSON.stringify(icdo), err => {
		if (err) return logger.error(err);
	});
	fs.writeFileSync("./server/data_files/conceptCode.js", JSON.stringify(concept), err => {
		if (err) return logger.error(err);
	});

	//Remove old properties and values that don't exists in GDC Dictionary from conceptCode.js
	let gdc_data = {};
	fs.readdirSync(folderPath).forEach(file => {
		gdc_data[file.replace('.yaml', '')] = yaml.load(folderPath + '/' + file);
	});
	let tmp_concept = shared.readConceptCode();
	for (let keys in tmp_concept) {
		let category = keys.split(".")[0];
		let node = keys.split(".")[1];
		let property = keys.split(".")[2];
		if (!gdc_data[node]) {
			delete tmp_concept[keys];
		}
		if (gdc_data[node] && !gdc_data[node].properties[property]) {
			delete tmp_concept[keys];
		}
		let tmp_obj = tmp_concept[keys];
		for (let values in tmp_obj) {
			if (gdc_data[node] && gdc_data[node].properties[property] && gdc_data[node].properties[property].enum.indexOf(values) == -1) {
				delete tmp_obj[values];
			}
		}
	}
	fs.writeFileSync("./server/data_files/conceptCode.js", JSON.stringify(tmp_concept), err => {
		if (err) return logger.error(err);
	});
	res.send("Success");
}

const gitClone = (req, res) => {
	let url = 'https://github.com/NCI-GDC/gdcdictionary.git';
	let directory = 'tmp_data';
	let clone = git.Clone.clone;
	let branch = 'develop';
	var cloneOptions = new git.CloneOptions();

	cloneOptions.checkoutBranch = branch;
	clone(url, directory, cloneOptions)
		.then(repository => {

		});
	res.send('Success');
}

const gdcDictionaryVersion = (req, res) => {
	res.json(shared.readGdcDictionaryVersion());
}

module.exports = {
	suggestion,
	suggestionMisSpelled,
	searchP,
	getPV,
	getDataFromCDE,
	getCDEData,
	getDataFromGDC,
	getGDCData,
	getGDCandCDEData,
	searchICDO3Data,
	preloadSynonumsNcit,
	loadSynonyms_continue,
	preloadSynonumsCtcae,
	loadCtcaeSynonyms_continue,
	getNCItInfo,
	indexing,
	preloadCadsrData,
	parseExcel,
	preloadDataTypeFromCaDSR,
	Unmapped,
	gitClone,
	gdcDictionaryVersion
};
