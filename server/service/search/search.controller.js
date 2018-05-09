'use strict';

var https = require('https');

var elastic = require('../../components/elasticsearch');
var handleError = require('../../components/handleError');
var logger = require('../../components/logger');
var config = require('../../config');
var https = require('https');
var fs = require('fs');
var path = require('path');
var yaml = require('yamljs');
const excel = require('node-excel-export');
var cdeData = {};
var gdcData = {};

var suggestion = function (req, res) {
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
	elastic.suggest(config.suggestionName, suggest, function (result) {
		if (result.suggest === undefined) {
			return handleError.error(res, result);
		}
		let dt = result.suggest.term_suggest;
		let data = [];
		dt[0].options.forEach(function (opt) {
			data.push(opt._source);
		});
		res.json(data);
	})
};

var searchICDO3Data = function (req, res) {
	var icdo3_code = req.query.icdo3;
	let data = [];
	let query = {};

	if (icdo3_code.trim() !== '') {
		query.match_phrase = {};
		query.match_phrase["enum.i_c.have"] = {};
		query.match_phrase["enum.i_c.have"].query = icdo3_code;
		query.match_phrase["enum.i_c.have"].analyzer = "case_insensitive";
		//query.analyzer = "keyword";
		let highlight;

		elastic.query(config.index_p, query, highlight, function (result) {
			let mainData = [];
			if (result.hits === undefined) {
				res.send('No data found!');
			}
			let data = result.hits.hits;
			data.forEach(function (entry) {
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
					let value = enums[e].i_c.have;
					value.map(function (x) {
						return x.toString().toUpperCase()
					})

					if ((value).indexOf(icdo3_code.toUpperCase()) > -1) {
						ICDO3Data.enums.push(enums[e]);
					}
				}
				mainData.push(ICDO3Data);
			}
			res.json(mainData);
		});
	} else {
		res.send('No data found!');
	}
}


var searchP = function (req, res) {
	let keyword = req.query.keyword;
	if (keyword.trim() === '') {
		res.json([]);
		// query = {"match_all": {}};
		// highlight = null;
	} else {
		let option = JSON.parse(req.query.option);
		let words = [];
		let query = {};
		let highlight;
		query.bool = {};
		query.bool.should = [];
		if (option.match !== "exact") {
			let m = {};
			m.match_phrase = {};
			m.match_phrase["name.have"] = keyword;
			query.bool.should.push(m);
			if (option.desc) {
				m = {};
				m.match_phrase = {};
				m.match_phrase["desc"] = keyword;
				query.bool.should.push(m);
			}
			if (option.syn) {
				m = {};
				m.match_phrase = {};
				m.match_phrase["enum.s.have"] = keyword;
				query.bool.should.push(m);
				m = {};
				m.match_phrase = {};
				m.match_phrase["cde_pv.n.have"] = keyword;
				query.bool.should.push(m);
				m = {};
				m.match_phrase = {};
				m.match_phrase["cde_pv.ss.s.have"] = keyword;
				query.bool.should.push(m);
			}
			m = {};
			m.match_phrase = {};
			m.match_phrase["enum.n.have"] = keyword;
			query.bool.should.push(m);
			m = {};
			m.match = {};
			m.match["enum.i_c.have"] = {};
			m.match["enum.i_c.have"].query = keyword;
			m.match["enum.i_c.have"].analyzer = "keyword";
			query.bool.should.push(m);
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
				highlight.fields["cde_pv.n.have"] = {
					"number_of_fragments": 0
				};
				highlight.fields["cde_pv.ss.s.have"] = {
					"number_of_fragments": 0
				};
			}
		} else {
			let m = {};
			m.multi_match = {};
			m.multi_match.query = keyword;
			m.multi_match.analyzer = "keyword";
			m.multi_match.fields = ["name"];
			if (option.desc) {
				m.multi_match.fields.push("desc");
			}
			if (option.syn) {
				m.multi_match.fields.push("enum.s");
				m.multi_match.fields.push("cde_pv.n");
				m.multi_match.fields.push("cde_pv.ss.s");
			}
			m.multi_match.fields.push("enum.n");
			m.multi_match.fields.push("enum.i_c.c");
			query.bool.should.push(m);
			highlight = {
				"pre_tags": ["<b>"],
				"post_tags": ["</b>"],
				"fields": {
					"name": {},
					"enum.n": {},
					"enum.i_c.c": {}
				}
			};
			if (option.desc) {
				highlight.fields["desc"] = {
					"number_of_fragments": 0
				};
			}
			if (option.syn) {
				highlight.fields["enum.s"] = {};
				highlight.fields["cde_pv.n"] = {};
				highlight.fields["cde_pv.ss.s"] = {};
			}
		}
		elastic.query(config.index_p, query, highlight, function (result) {
			if (result.hits === undefined) {
				return handleError.error(res, result);
			}
			let data = result.hits.hits;
			data.forEach(function (entry) {
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

var indexing = function (req, res) {
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
							"lowercase"
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
					"enum.i_c.c": {
						"type": "text",
						"analyzer": "case_insensitive"
					},
					"enum.i_c.have": {
						"type": "text",
						"analyzer": "case_insensitive"
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
						"max_input_length": 100
					}
				}
			}
		}
	};
	configs.push(config_suggestion);
	elastic.createIndexes(configs, function (result) {
		if (result.acknowledged === undefined) {
			return handleError.error(res, result);
		}
		elastic.bulkIndex(function (data) {
			if (data.indexed === undefined) {
				return handleError.error(res, data);
			}
			return res.json(data);
		});
	});
};

var getDataFromCDE = function (req, res) {
	if (cdeData === '') {
		//load data file to memory
		let content_1 = fs.readFileSync("./cdeData.js").toString();
		content_1 = content_1.replace(/}{/g, ",");
		let content_2 = fs.readFileSync("./synonyms.js").toString();
		content_2 = content_2.replace(/}{/g, ",");
		cdeData = JSON.parse(content_1);
		let syns = JSON.parse(content_2);
		for (var c in cdeData) {
			let pvs = cdeData[c];
			pvs.forEach(function (pv) {
				if (pv.pvc !== null && pv.pvc.indexOf(':') === -1) {
					pv.syn = syns[pv.pvc];
				}
				if (pv.pvc !== null && pv.pvc.indexOf(':') >= 0) {
					let cs = pv.pvc.split(":");
					let synonyms = [];
					cs.forEach(function (s) {
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

var getCDEData = function (req, res) {
	let uid = req.query.id;
	if (cdeData[uid] == undefined) {
		//load data file to memory

		let query = {};
		query.term = {};
		query.term["cde.id"] = uid;
		elastic.query(config.index_p, query, null, function (result) {
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

var getDataFromGDC = function (req, res) {
	if (gdcData === '') {
		//load data file to memory
		let content_1 = fs.readFileSync("./conceptCode.js").toString();
		let content_2 = fs.readFileSync("./synonyms.js").toString();
		let content_3 = fs.readFileSync("./gdc_values.js").toString();
		content_2 = content_2.replace(/}{/g, ",");
		let cc = JSON.parse(content_1);
		let syns = JSON.parse(content_2);
		let gv = JSON.parse(content_3);
		gdcData = {};
		//load data from gdc_values.js to memory
		for (var c in gv) {
			gdcData[c] = [];
			gv[c].forEach(function (ss) {
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

var getGDCData = function (req, res) {
	let uid = req.query.id;
	if (gdcData[uid] == undefined) {
		//load data file to memory

		let query = {};
		query.terms = {};
		query.terms._id = [];
		query.terms._id.push(uid);
		elastic.query(config.index_p, query, null, function (result) {
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

var getGDCandCDEData = function (req, res) {
	let uid = req.query.local;
	let cdeId = req.query.cde;
	if (gdcData[uid] == undefined) {
		//load data file to memory

		let query = {};
		query.terms = {};
		query.terms._id = [];
		query.terms._id.push(uid);
		elastic.query(config.index_p, query, null, function (result) {
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

var preLoadCaDSRData = function (req, res){

	



}

var preload = function (req, res) {
	// elastic.preloadDataFromCaDSR(function(result) {
	// 	if (result === 1) { 
	// 		res.json({
	// 			"status": "success",
	// 			"message": "preparing data..."
	// 		});
	// 	} else {
	// 		res.json({
	// 			"status": "failed",
	// 			"message": "failed to loading data from caDSR."
	// 		});
	// 	}
	// });
	elastic.loadSynonyms_continue(function (result) {
		if (result === 1) {
			res.json({
				"status": "success",
				"message": "preparing data..."
			});
		} else {
			res.json({
				"status": "failed",
				"message": "failed to loading data from caDSR."
			});
		}
	});
	// elastic.preloadDataTypeFromCaDSR(function(result){
	// 	if(result === 1){
	// 		res.json({"status":"success", "message":"preparing data type..."});
	// 	}
	// 	else{
	// 		res.json({"status":"failed", "message":"failed to loading data type from caDSR."});
	// 	}
	// });
};

var export2Excel = function (req, res) {
	let query = {
		"match_all": {}
	};

	elastic.query(config.index_p, query, null, function (result) {
		if (result.hits === undefined) {
			return handleError.error(res, result);
		}
		let data = result.hits.hits;
		let ds = [];
		data.forEach(function (entry) {
			console.log(entry);
			let vs = entry._source.enum;
			if (vs) {
				let cde = entry._source.cde_pv;
				vs.forEach(function (v) {
					let tmp = {};
					tmp.c = entry._source.category;
					tmp.n = entry._source.node;
					tmp.p = entry._source.name;
					tmp.v = v.n;
					tmp.ncit = v.n_c;
					// if (v.i_c) {
					// 	tmp.icdo = v.i_c.c;
					// } else {
					// 	tmp.icdo = "";
					// }
					// if (tmp.n == 'follow_up' && tmp.p == 'adverse_event') {
					// 	cde.forEach(function (c) {
					// 		if (c.n.trim().toLowerCase() == tmp.v.trim().toLowerCase()) {
					// 			tmp.ctcae = c.ss[0].c;
					// 		}
					// 	});
					// } else {
					// 	tmp.ctcae = "";
					// }
					ds.push(tmp);
				});

			}
		});
		console.log(ds);
		let heading = [
			['Category', 'Node', 'Property', 'Value']
		];
		let merges = [];
		let specification = {
			c: {
				width: 200
			},
			n: {
				width: 200
			},
			p: {
				width: 200
			},
			v: {
				width: 200
			}
		};
		const report = excel.buildExport(
			[ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report 
				{
					name: 'Report', // <- Specify sheet name (optional) 
					heading: heading, // <- Raw heading array (optional) 
					merges: merges, // <- Merge cell ranges 
					specification: specification, // <- Report specification 
					data: ds // <-- Report data 
				}
			]
		);

		// You can then return this straight 
		res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers) 
		res.send(report);
	});
};

var getNCItInfo = function (req, res) {
	let code = req.query.code;
	let url = config.NCIt_url[4] + code;
	https.get(url, (rsp) => {
		let html = '';
		rsp.on('data', (dt) => {
			html += dt;
		});
		rsp.on('end', function () {
			if (html.trim() !== '') {
				let data = JSON.parse(html);
				res.json(data);
			}
		});

	}).on('error', (e) => {
		logger.debug(e);
	});
};

var export_common = function (req, res) {
	let heading = [
		['Category', 'Node', 'Property', 'Old GDC Dcitonary Value', 'New GDC Dcitonary Value', 'Term', 'NCIt Code']
	];
	let specification = {
		c: {
			width: 200
		},
		n: {
			width: 200
		},
		p: {
			width: 200
		},
		old: {
			width: 200
		},
		new: {
			width: 200
		},
		evs_term: {
			width: 200
		},
		evs_ncit: {
			width: 200
		}
	};

	let merges = [];
	let data = [];

	let content_1 = fs.readFileSync("./conceptCode.js").toString();
	//let cc = JSON.parse(content_1);
	let folderPath = path.join(__dirname, '../..', 'data_horton');
	let folderPath_old = path.join(__dirname, '../..', 'data_elephant_cat');
	let content = [];
	fs.readdirSync(folderPath).forEach(file => {
		if (file.indexOf("_") !== 0) {
			let tmp_new = yaml.load(folderPath + '/' + file);

			let props_old = {};

			if (fs.existsSync(folderPath_old + '/' + file)) {
				let tmp_old = yaml.load(folderPath_old + '/' + file);
				props_old = tmp_old.properties;
			}
			let props = tmp_new.properties;

			for (let p in props) {
				let fn = tmp_new.category + "." + tmp_new.id + "." + p;
				// if (fn == "clinical.diagnosis.primary_diagnosis" || fn == "clinical.diagnosis.morphology" || fn == "clinical.diagnosis.site_of_resection_or_biopsy" || fn == "clinical.diagnosis.tissue_or_organ_of_origin") {
				// 	continue;
				// } else {
				//if (fn in cc) {
				let tmp_cc = {};

				if (props[p].enum) {
					if (props_old[p] && props_old[p].enum) {
						//situation:111
						let ds = [];
						let cache_0 = [];
						let cache_1 = [];
						props[p].enum.forEach(function (em) {
							let lc = em.toLowerCase();
							if ((lc in tmp_cc) && props_old[p].enum.indexOf(em) >= 0) {
								cache_0.push(lc);
								cache_1.push(em);
								let tmp = {};
								tmp.c = tmp_new.category;
								tmp.n = tmp_new.id;
								tmp.p = p;
								tmp.old = em;
								tmp.new = em;
								tmp.evs_term = tmp_cc[lc].term;
								tmp.evs_ncit = tmp_cc[lc].ncit;
								ds.push(tmp);
							} else if ((lc in tmp_cc) && props_old[p].enum.indexOf(em) == -1) {
								cache_0.push(lc);
								let tmp = {};
								tmp.c = tmp_new.category;
								tmp.n = tmp_new.id;
								tmp.p = p;
								tmp.old = "no match";
								tmp.new = em;
								tmp.evs_term = tmp_cc[lc].term;
								tmp.evs_ncit = tmp_cc[lc].ncit;
								ds.push(tmp);
							} else if (!(lc in tmp_cc) && props_old[p].enum.indexOf(em) >= 0) {
								cache_1.push(em);
								let tmp = {};
								tmp.c = tmp_new.category;
								tmp.n = tmp_new.id;
								tmp.p = p;
								tmp.old = em;
								tmp.new = em;
								tmp.evs_term = "no match";
								tmp.evs_ncit = "no match";
								ds.push(tmp);
							} else {
								let tmp = {};
								tmp.c = tmp_new.category;
								tmp.n = tmp_new.id;
								tmp.p = p;
								tmp.old = "no match";
								tmp.new = em;
								tmp.evs_term = "no match";
								tmp.evs_ncit = "no match";
								ds.push(tmp);
							}
						});
						let cache_2 = [];
						props_old[p].enum.forEach(function (em) {
							if (cache_1.indexOf(em) == -1) {

								let lc = em.toString().toLowerCase();
								if (lc in tmp_cc) {
									cache_2.push(lc);
									let tmp = {};
									tmp.c = tmp_new.category;
									tmp.n = tmp_new.id;
									tmp.p = p;
									tmp.old = em;
									tmp.new = "no match";
									tmp.evs_term = tmp_cc[lc].term;
									tmp.evs_ncit = tmp_cc[lc].ncit;
									ds.push(tmp);
								} else {
									let tmp = {};
									tmp.c = tmp_new.category;
									tmp.n = tmp_new.id;
									tmp.p = p;
									tmp.old = em;
									tmp.new = "no match";
									tmp.evs_term = "no match";
									tmp.evs_ncit = "no match";
									ds.push(tmp);
								}
							}
						});
						for (let m in tmp_cc) {
							if (cache_0.indexOf(m) == -1 && cache_2.indexOf(m) == -1) {
								let tmp = {};
								tmp.c = tmp_new.category;
								tmp.n = tmp_new.id;
								tmp.p = p;
								tmp.old = "no match";
								tmp.new = "no match";
								tmp.evs_term = tmp_cc[m].term;
								tmp.evs_ncit = tmp_cc[m].ncit;
								ds.push(tmp);
							}
						}
						let dict = {};
						dict.name = fn;
						dict.heading = heading;
						dict.merges = merges;
						dict.specification = specification;
						dict.data = ds;
						content.push(dict);

						data.push.apply(data, ds);
					} else {
						//situation:110
						let ds = [];
						let cache = [];
						props[p].enum.forEach(function (em) {
							let lc = em.toLowerCase();
							if (lc in tmp_cc) {
								cache.push(lc);
								let tmp = {};
								tmp.c = tmp_new.category;
								tmp.n = tmp_new.id;
								tmp.p = p;
								tmp.old = "no match";
								tmp.new = em;
								tmp.evs_term = tmp_cc[lc].term;
								tmp.evs_ncit = tmp_cc[lc].ncit;
								ds.push(tmp);
							} else {
								let tmp = {};
								tmp.c = tmp_new.category;
								tmp.n = tmp_new.id;
								tmp.p = p;
								tmp.old = "no match";
								tmp.new = em;
								tmp.evs_term = "no match";
								tmp.evs_ncit = "no match";
								ds.push(tmp);
							}
						});
						for (let b in tmp_cc) {
							if (cache.indexOf(b) == -1) {
								let tmp = {};
								tmp.c = tmp_new.category;
								tmp.n = tmp_new.id;
								tmp.p = p;
								tmp.old = "no match";
								tmp.new = "no match";
								tmp.evs_term = tmp_cc[b].term;
								tmp.evs_ncit = tmp_cc[b].ncit;
								ds.push(tmp);
							}
						}
						let dict = {};
						dict.name = fn;
						dict.heading = heading;
						dict.merges = merges;
						dict.specification = specification;
						dict.data = ds;
						content.push(dict);

						data.push.apply(data, ds);
					}
				} else {
					if (props_old[p] && props_old[p].enum) {
						//situation:101
						let ds = [];
						let cache = [];
						props_old[p].enum.forEach(function (em) {
							let lc = em.toLowerCase();
							if (lc in tmp_cc) {
								cache.push(lc);
								let tmp = {};
								tmp.c = tmp_new.category;
								tmp.n = tmp_new.id;
								tmp.p = p;
								tmp.old = em;
								tmp.new = "no match";
								tmp.evs_term = tmp_cc[lc].term;
								tmp.evs_ncit = tmp_cc[lc].ncit;
								ds.push(tmp);
							} else {
								let tmp = {};
								tmp.c = tmp_new.category;
								tmp.n = tmp_new.id;
								tmp.p = p;
								tmp.old = em;
								tmp.new = "no match";
								tmp.evs_term = "no match";
								tmp.evs_ncit = "no match";
								ds.push(tmp);
							}
						});
						for (let b in tmp_cc) {
							if (cache.indexOf(b) == -1) {
								let tmp = {};
								tmp.c = tmp_new.category;
								tmp.n = tmp_new.id;
								tmp.p = p;
								tmp.old = "no match";
								tmp.new = "no match";
								tmp.evs_term = tmp_cc[b].term;
								tmp.evs_ncit = tmp_cc[b].ncit;
								ds.push(tmp);
							}
						};
						let dict = {};
						dict.name = fn;
						dict.heading = heading;
						dict.merges = merges;
						dict.specification = specification;
						dict.data = ds;
						content.push(dict);

						data.push.apply(data, ds);
					} else {
						//situation:100
						let ds = [];
						for (let c in cc[fn]) {
							let tmp = {};
							tmp.c = tmp_new.category;
							tmp.n = tmp_new.id;
							tmp.p = p;
							tmp.old = "no match";
							tmp.new = "no match";
							tmp.evs_term = c;
							tmp.evs_ncit = cc[fn][c];
							ds.push(tmp);
						}

						let dict = {};
						dict.name = fn;
						dict.heading = heading;
						dict.merges = merges;
						dict.specification = specification;
						dict.data = ds;
						content.push(dict);

						data.push.apply(data, ds);

					}
				}
				//}
				//}
			}
		}

	});

	const report = excel.buildExport(
		[ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report 
			{
				name: 'Report', // <- Specify sheet name (optional) 
				heading: heading, // <- Raw heading array (optional) 
				merges: merges, // <- Merge cell ranges 
				specification: specification, // <- Report specification 
				data: data // <-- Report data 
			}
		]
	);

	//const report = excel.buildExport(content);

	// You can then return this straight 
	res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers) 
	res.send(report);
};

var export_ICDO3 = function (req, res) {
	let heading = [
		['Category', 'Node', 'Property', 'Old GDC Dcitonary Value', 'New GDC Dcitonary Value', 'ICD-O-3 Code', 'Term', 'NCIt Code']
	];
	let merges = [];
	let specification = {
		c: {
			width: 200
		},
		n: {
			width: 200
		},
		p: {
			width: 200
		},
		old: {
			width: 200
		},
		new: {
			width: 200
		},
		evs_icdo: {
			width: 200
		},
		evs_term: {
			width: 200
		},
		evs_ncit: {
			width: 200
		}
	};

	let data = [];

	let ICDO3_content = fs.readFileSync("./gdc_values.js").toString();
	let ICDO3 = JSON.parse(ICDO3_content);
	let ICDO3_1 = ICDO3["clinical.diagnosis.morphology"];
	let ICDO3_dict = {};
	let ICDO3_dict_matched = [];
	ICDO3_1.forEach(function (i) {
		if (!(i.i_c in ICDO3_dict)) {
			ICDO3_dict[i.i_c] = [];
		}
		ICDO3_dict[i.i_c].push(i);
	});
	let ICDO3_2 = ICDO3["clinical.diagnosis.site_of_resection_or_biopsy"];
	let ICDO3_dict_c = {};
	let ICDO3_dict_c_matched = [];
	let nm_dict_c = {};
	ICDO3_2.forEach(function (i) {
		if (!(i.i_c in ICDO3_dict_c)) {
			ICDO3_dict_c[i.i_c] = [];
		}
		ICDO3_dict_c[i.i_c].push(i);
		nm_dict_c[i.nm.toLowerCase()] = i;
	});
	let content_1 = fs.readFileSync("./conceptCode.js").toString();
	let cc = JSON.parse(content_1);
	let primary = cc["clinical.diagnosis.primary_diagnosis"];
	let primary_diagnosis = {};
	let primary_diagnosis_matched = [];
	for (let p in primary) {
		primary_diagnosis[p.toLowerCase()] = {};
		primary_diagnosis[p.toLowerCase()].ncit = primary[p];
		primary_diagnosis[p.toLowerCase()].term = p;
	}
	let diagnosis = null;
	let folderPath = path.join(__dirname, '../..', 'data_horton');
	fs.readdirSync(folderPath).forEach(file => {
		if (file == "diagnosis.yaml") {
			diagnosis = yaml.load(folderPath + '/' + file);
		}
	});
	let content = [];
	//morphology
	let ds_1 = [];
	let merges_1 = [];
	let enum_1 = diagnosis.properties.morphology.enum;
	let rows = 3;
	enum_1.forEach(function (em) {
		if (em in ICDO3_dict) {
			ICDO3_dict_matched.push(em);
			let start = rows;
			let end = start + ICDO3_dict[em].length - 1;
			ICDO3_dict[em].forEach(function (item) {
				let tmp = {};
				tmp.c = 'clinical';
				tmp.n = 'diagnosis';
				tmp.p = 'morphology';
				tmp.old = "";
				tmp.new = em;
				tmp.evs_icdo = item.i_c;
				tmp.evs_term = item.nm;
				tmp.evs_ncit = item.n_c;
				ds_1.push(tmp);
			});
			let mg = {
				start: {
					row: start,
					column: 1
				},
				end: {
					row: end,
					column: 1
				}
			};
			merges_1.push(mg);
			mg = {
				start: {
					row: start,
					column: 2
				},
				end: {
					row: end,
					column: 2
				}
			};
			merges_1.push(mg);
			rows += ICDO3_dict[em].length;
		} else {
			let tmp = {};
			tmp.c = 'clinical';
			tmp.n = 'diagnosis';
			tmp.p = 'morphology';
			tmp.old = "";
			tmp.new = em;
			tmp.evs_icdo = "no match";
			tmp.evs_term = "";
			tmp.evs_ncit = "";
			ds_1.push(tmp);
			rows += 1;
		}

	});

	//show unmatched values
	for (let id in ICDO3_dict) {
		if (ICDO3_dict_matched.indexOf(id) == -1) {
			let start = rows;
			let end = start + ICDO3_dict[id].length - 1;
			ICDO3_dict[id].forEach(function (item) {
				let tmp = {};
				tmp.c = 'clinical';
				tmp.n = 'diagnosis';
				tmp.p = 'morphology';
				tmp.old = "";
				tmp.new = "no match";
				tmp.evs_icdo = item.i_c;
				tmp.evs_term = item.nm;
				tmp.evs_ncit = item.n_c;
				ds_1.push(tmp);
			});
			let mg = {
				start: {
					row: start,
					column: 1
				},
				end: {
					row: end,
					column: 1
				}
			};
			merges_1.push(mg);
			mg = {
				start: {
					row: start,
					column: 2
				},
				end: {
					row: end,
					column: 2
				}
			};
			merges_1.push(mg);
			rows += ICDO3_dict[id].length;
		}
	}

	let dict_1 = {};
	dict_1.name = "morphology";
	dict_1.heading = heading;
	dict_1.merges = merges_1;
	dict_1.specification = specification;
	dict_1.data = ds_1;
	content.push(dict_1);

	data.push.apply(data, ds_1);

	//primary_diagnosis
	let ds_2 = [];
	let merges_2 = [];
	rows = 3;
	let enum_2 = diagnosis.properties.primary_diagnosis.enum;
	enum_2.forEach(function (em) {
		let lc = em.toLowerCase();
		if (lc in primary_diagnosis) {
			primary_diagnosis_matched.push(lc);
			let tmp = {};
			tmp.c = 'clinical';
			tmp.n = 'diagnosis';
			tmp.p = 'primary_diagnosis';
			tmp.old = "";
			tmp.new = em;
			tmp.evs_icdo = "";
			tmp.evs_term = primary_diagnosis[lc].term;
			tmp.evs_ncit = primary_diagnosis[lc].ncit;
			ds_2.push(tmp);
			rows++;
		} else if (em in ICDO3_dict_c) {
			let start = rows;
			let end = start + ICDO3_dict_c[em].length - 1;
			ICDO3_dict_c[em].forEach(function (item) {
				let tmp = {};
				tmp.c = 'clinical';
				tmp.n = 'diagnosis';
				tmp.p = 'primary_diagnosis';
				tmp.old = "";
				tmp.new = em;
				tmp.evs_icdo = item.i_c;
				tmp.evs_term = item.nm;
				tmp.evs_ncit = item.n_c;
				ds_2.push(tmp);
			});
			let mg = {
				start: {
					row: start,
					column: 1
				},
				end: {
					row: end,
					column: 1
				}
			};
			merges_2.push(mg);
			mg = {
				start: {
					row: start,
					column: 2
				},
				end: {
					row: end,
					column: 2
				}
			};
			merges_2.push(mg);
			rows += ICDO3_dict_c[em].length;
		} else {
			let tmp = {};
			tmp.c = 'clinical';
			tmp.n = 'diagnosis';
			tmp.p = 'primary_diagnosis';
			tmp.old = "";
			tmp.new = em;
			tmp.evs_icdo = "no match";
			tmp.evs_term = "";
			tmp.evs_ncit = "";
			ds_2.push(tmp);
			rows++;
		}

	});

	//show unmatched primary_diagnosis values
	for (let p in primary_diagnosis) {
		if (primary_diagnosis_matched.indexOf(p) == -1) {
			let tmp = {};
			tmp.c = 'clinical';
			tmp.n = 'diagnosis';
			tmp.p = 'primary_diagnosis';
			tmp.old = "";
			tmp.new = "no match";
			tmp.evs_icdo = "";
			tmp.evs_term = primary_diagnosis[p].term;
			tmp.evs_ncit = primary_diagnosis[p].ncit;
			ds_2.push(tmp);
		}
	}

	let dict_2 = {};
	dict_2.name = "primary_diagnosis";
	dict_2.heading = heading;
	dict_2.merges = merges_2;
	dict_2.specification = specification;
	dict_2.data = ds_2;
	content.push(dict_2);

	data.push.apply(data, ds_2);

	//site_of_resection_or_biopsy
	let ds_3 = [];
	let merges_3 = [];
	let enum_3 = diagnosis.properties.site_of_resection_or_biopsy.enum;
	rows = 3;
	enum_3.forEach(function (em) {
		let lc = em.toLowerCase();
		if (lc in nm_dict_c) {
			ICDO3_dict_c_matched.push(nm_dict_c[lc].i_c);
			let tmp = {};
			tmp.c = 'clinical';
			tmp.n = 'diagnosis';
			tmp.p = 'site_of_resection_or_biopsy';
			tmp.old = "";
			tmp.new = em;
			tmp.evs_icdo = nm_dict_c[lc].i_c;
			tmp.evs_term = nm_dict_c[lc].nm;
			tmp.evs_ncit = nm_dict_c[lc].n_c;
			ds_3.push(tmp);
			rows++;
		} else if (em in ICDO3_dict) {
			let start = rows;
			let end = start + ICDO3_dict[em].length - 1;
			ICDO3_dict[em].forEach(function (item) {
				let tmp = {};
				tmp.old = "";
				tmp.new = em;
				tmp.evs_icdo = item.i_c;
				tmp.evs_term = item.nm;
				tmp.evs_ncit = item.n_c;
				ds_3.push(tmp);
			});
			let mg = {
				start: {
					row: start,
					column: 1
				},
				end: {
					row: end,
					column: 1
				}
			};
			merges_3.push(mg);
			mg = {
				start: {
					row: start,
					column: 2
				},
				end: {
					row: end,
					column: 2
				}
			};
			merges_3.push(mg);
			rows += ICDO3_dict[em].length;
		} else if (em in ICDO3_dict_c) {
			ICDO3_dict_c_matched.push(em);
			let start = rows;
			let end = start + ICDO3_dict_c[em].length - 1;
			ICDO3_dict_c[em].forEach(function (item) {
				let tmp = {};
				tmp.c = 'clinical';
				tmp.n = 'diagnosis';
				tmp.p = 'site_of_resection_or_biopsy';
				tmp.old = "";
				tmp.new = em;
				tmp.evs_icdo = item.i_c;
				tmp.evs_term = item.nm;
				tmp.evs_ncit = item.n_c;
				ds_3.push(tmp);
			});
			let mg = {
				start: {
					row: start,
					column: 1
				},
				end: {
					row: end,
					column: 1
				}
			};
			merges_3.push(mg);
			mg = {
				start: {
					row: start,
					column: 2
				},
				end: {
					row: end,
					column: 2
				}
			};
			merges_3.push(mg);
			rows += ICDO3_dict_c[em].length;
		} else {
			let tmp = {};
			tmp.c = 'clinical';
			tmp.n = 'diagnosis';
			tmp.p = 'site_of_resection_or_biopsy';
			tmp.old = "";
			tmp.new = em;
			tmp.evs_icdo = "no match";
			tmp.evs_term = "";
			tmp.evs_ncit = "";
			ds_3.push(tmp);
			rows += 1;
		}

	});

	//show unmatched values
	for (let idc in ICDO3_dict_c) {
		if (ICDO3_dict_c_matched.indexOf(idc) == -1) {
			let start = rows;
			let end = start + ICDO3_dict_c[idc].length - 1;
			ICDO3_dict_c[idc].forEach(function (item) {
				let tmp = {};
				tmp.c = 'clinical';
				tmp.n = 'diagnosis';
				tmp.p = 'site_of_resection_or_biopsy';
				tmp.old = "";
				tmp.new = "no match";
				tmp.evs_icdo = item.i_c;
				tmp.evs_term = item.nm;
				tmp.evs_ncit = item.n_c;
				ds_3.push(tmp);
			});
			let mg = {
				start: {
					row: start,
					column: 1
				},
				end: {
					row: end,
					column: 1
				}
			};
			merges_3.push(mg);
			mg = {
				start: {
					row: start,
					column: 2
				},
				end: {
					row: end,
					column: 2
				}
			};
			merges_3.push(mg);
			rows += ICDO3_dict_c[idc].length;
		}
	}

	let dict_3 = {};
	dict_3.name = "site_of_resection_or_biopsy";
	dict_3.heading = heading;
	dict_3.merges = merges_3;
	dict_3.specification = specification;
	dict_3.data = ds_3;
	content.push(dict_3);

	data.push.apply(data, ds_3);

	//tissue_or_organ_of_origin
	let ds_4 = [];
	let merges_4 = [];
	let enum_4 = diagnosis.properties.tissue_or_organ_of_origin.enum;
	rows = 3;
	enum_4.forEach(function (em) {
		let lc = em.toLowerCase();
		if (lc in nm_dict_c) {
			let tmp = {};
			tmp.c = 'clinical';
			tmp.n = 'diagnosis';
			tmp.p = 'tissue_or_organ_of_origin';
			tmp.old = "";
			tmp.new = em;
			tmp.evs_icdo = nm_dict_c[lc].i_c;
			tmp.evs_term = nm_dict_c[lc].nm;
			tmp.evs_ncit = nm_dict_c[lc].n_c;
			ds_4.push(tmp);
			rows++;
		} else if (em in ICDO3_dict) {
			let start = rows;
			let end = start + ICDO3_dict[em].length - 1;
			ICDO3_dict[em].forEach(function (item) {
				let tmp = {};
				tmp.old = "";
				tmp.new = em;
				tmp.evs_icdo = item.i_c;
				tmp.evs_term = item.nm;
				tmp.evs_ncit = item.n_c;
				ds_4.push(tmp);
			});
			let mg = {
				start: {
					row: start,
					column: 1
				},
				end: {
					row: end,
					column: 1
				}
			};
			merges_4.push(mg);
			mg = {
				start: {
					row: start,
					column: 2
				},
				end: {
					row: end,
					column: 2
				}
			};
			merges_4.push(mg);
			rows += ICDO3_dict[em].length;
		} else if (em in ICDO3_dict_c) {
			let start = rows;
			let end = start + ICDO3_dict_c[em].length - 1;
			ICDO3_dict_c[em].forEach(function (item) {
				let tmp = {};
				tmp.c = 'clinical';
				tmp.n = 'diagnosis';
				tmp.p = 'tissue_or_organ_of_origin';
				tmp.old = "";
				tmp.new = em;
				tmp.evs_icdo = item.i_c;
				tmp.evs_term = item.nm;
				tmp.evs_ncit = item.n_c;
				ds_4.push(tmp);
			});
			let mg = {
				start: {
					row: start,
					column: 1
				},
				end: {
					row: end,
					column: 1
				}
			};
			merges_4.push(mg);
			mg = {
				start: {
					row: start,
					column: 2
				},
				end: {
					row: end,
					column: 2
				}
			};
			merges_4.push(mg);
			rows += ICDO3_dict_c[em].length;
		} else {
			let tmp = {};
			tmp.c = 'clinical';
			tmp.n = 'diagnosis';
			tmp.p = 'tissue_or_organ_of_origin';
			tmp.old = "";
			tmp.new = em;
			tmp.evs_icdo = "no match";
			tmp.evs_term = "";
			tmp.evs_ncit = "";
			ds_4.push(tmp);
			rows += 1;
		}

	});

	let dict_4 = {};
	dict_4.name = "tissue_or_organ_of_origin";
	dict_4.heading = heading;
	dict_4.merges = merges_4;
	dict_4.specification = specification;
	dict_4.data = ds_4;
	content.push(dict_4);

	data.push.apply(data, ds_4);


	const report = excel.buildExport(
		[ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report 
			{
				name: 'Report', // <- Specify sheet name (optional) 
				heading: heading, // <- Raw heading array (optional) 
				merges: merges, // <- Merge cell ranges 
				specification: specification, // <- Report specification 
				data: data // <-- Report data 
			}
		]
	)

	//const report = excel.buildExport(content);

	// You can then return this straight 
	res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers) 
	res.send(report);
};

function findDeselectedItem(CurrentArray, PreviousArray) {

}

var export_difference = function (req, res) {
	let heading = [
		['Category', 'Node', 'Property', 'Old GDC Dcitonary Value', 'New GDC Dcitonary Value']
	];
	let merges = [];
	let data = [];
	let specification = {
		c: {
			width: 200
		},
		n: {
			width: 200
		},
		p: {
			width: 200
		},
		value_old: {
			width: 200
		},
		value_new: {
			width: 200
		}
	};

	let folderPath = path.join(__dirname, '../..', 'data_horton');
	let folderPath_old = path.join(__dirname, '../..', 'data_elephant_cat');
	let content = [];



	fs.readdirSync(folderPath).forEach(file => {
		if (file.indexOf("_") !== 0) {
			if (fs.existsSync(folderPath_old + '/' + file)) {
				let tmp_new = yaml.load(folderPath + '/' + file);
				let props_new = tmp_new.properties;

				let props_old = {};
				let property_keys_old;
				let property_keys_new = Object.keys(props_new);
				let tmp_old = yaml.load(folderPath_old + '/' + file);
				props_old = tmp_old.properties;
				property_keys_old = Object.keys(props_old);


				if (tmp_new.deprecated) {
					for (let d in tmp_new.deprecated) {
						if (props_old[tmp_new.deprecated[d]] && props_old[tmp_new.deprecated[d]].enum) {
							props_old[tmp_new.deprecated[d]].enum.forEach(function (em) {
								let temp_data = {};
								temp_data.c = tmp_new.category;
								temp_data.n = tmp_new.id;
								temp_data.p = tmp_new.deprecated[d];
								temp_data.value_old = em;
								temp_data.value_new = "no match";
								data.push(temp_data);
							})
						}

					}

				}
				
				for (let p in props_new) {
					
					if (props_new[p].enum) {
						if (props_old[p] && props_old[p].enum) {
							props_new[p].enum.forEach(function(em){
								if(props_old[p].enum.indexOf(em) >= 0){
									let temp_data = {};
										temp_data.c = tmp_new.category;
										temp_data.n = tmp_new.id;
										temp_data.p = p;
										temp_data.value_old = em;
										if(tmp_new.deprecated && tmp_new.deprecated.indexOf(p) >= 0){
											temp_data.value_new = "no match";		
										}
										else{
											temp_data.value_new = em;
										}
										
										data.push(temp_data);
								}
								else if(props_old[p].enum.indexOf(em) == -1 ){
									let temp_data = {};
									temp_data.c = tmp_new.category;
									temp_data.n = tmp_new.id;
									temp_data.p = p;
									temp_data.value_old = "no match";
									temp_data.value_new = em;
									data.push(temp_data);
								}
							});
							// props_old[p].enum.forEach(function (em) {
							// 	if (props_new[p].enum.indexOf(em) == -1) {
							// 		let temp_data = {};
							// 		temp_data.c = tmp_new.category;
							// 		temp_data.n = tmp_new.id;
							// 		temp_data.p = p;
							// 		temp_data.value_old = em;
							// 		temp_data.value_new = "no match";
							// 		data.push(temp_data);
							// 	}
							// });
						}
					}
				}

			}
		}
	});
	const report = excel.buildExport(
		[ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report 
			{
				name: 'Report', // <- Specify sheet name (optional) 
				heading: heading, // <- Raw heading array (optional) 
				merges: merges, // <- Merge cell ranges 
				specification: specification, // <- Report specification 
				data: data // <-- Report data 
			}
		]
	);

	//const report = excel.buildExport(content);

	// You can then return this straight 
	res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers) 
	res.send(report);

}
module.exports = {
	suggestion,
	searchP,
	getDataFromCDE,
	getCDEData,
	getDataFromGDC,
	getGDCData,
	getGDCandCDEData,
	searchICDO3Data,
	preload,
	export2Excel,
	getNCItInfo,
	indexing,
	export_common,
	export_ICDO3,
	export_difference,
	preLoadCaDSRData
};