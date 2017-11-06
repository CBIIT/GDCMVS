'use strict';

var https = require('https');

var elastic = require('../../components/elasticsearch');
var handleError = require('../../components/handleError');
var config = require('../../config');
var https = require('https');
var fs = require('fs');
const excel = require('node-excel-export');
var cdeData = {};
var gdcData = {};

var suggestion = function(req, res){
	let term = req.query.keyword;
	let suggest = {
		"term_suggest":{
		"prefix": term,
		"completion":{
			"field": "id",
			"size": 10
		}
	}};
	elastic.suggest(config.suggestionName, suggest, function(result){
		if(result.suggest === undefined){
			return handleError.error(res, result);
		}
		let dt = result.suggest.term_suggest;
		let data = [];
		dt[0].options.forEach(function(opt){
			data.push(opt._source);
		});
		res.json(data);
	})
};

var searchP = function(req, res){
	let keyword = req.query.keyword;
	if(keyword.trim() ===''){
		res.json([]);
		// query = {"match_all": {}};
		// highlight = null;
	}
	else{
		let option = JSON.parse(req.query.option);
		let words = [];
		let query = {};
		let highlight;
		query.bool = {};
		query.bool.should = [];
		if(option.match !=="exact"){
			let m = {};
			m.match_phrase = {};
			m.match_phrase["name.have"] = keyword;
			query.bool.should.push(m);
			if(option.desc){
		    	m = {};
				m.match_phrase = {};
				m.match_phrase["desc"] = keyword;
				query.bool.should.push(m);
		    }
		    if(option.syn){
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
					      "pre_tags" : ["<b>"],
		        		  "post_tags" : ["</b>"],
					      "fields":{
					        "name.have":{"number_of_fragments" : 0},
					        "enum.n.have":{"number_of_fragments" : 0},
					        "enum.i_c.have":{"number_of_fragments" : 0}
					    }
			};
			if(option.desc){
				highlight.fields["desc"] = {"number_of_fragments" : 0};
			}
			if(option.syn){
				highlight.fields["enum.s.have"] = {"number_of_fragments" : 0};
				highlight.fields["cde_pv.n.have"] = {"number_of_fragments" : 0};
				highlight.fields["cde_pv.ss.s.have"] = {"number_of_fragments" : 0};
			}
		}
		else{
			let m = {};
			m.multi_match = {};
			m.multi_match.query = keyword;
			m.multi_match.analyzer = "keyword";
			m.multi_match.fields = ["name"];
		    if(option.desc){
		    	m.multi_match.fields.push("desc");
		    }
		    if(option.syn){
		    	m.multi_match.fields.push("enum.s");
		    	m.multi_match.fields.push("cde_pv.n");
		    	m.multi_match.fields.push("cde_pv.ss.s");
		    }
		    m.multi_match.fields.push("enum.n");
		    m.multi_match.fields.push("enum.i_c.c");
		    query.bool.should.push(m);
		    highlight = {
					      "pre_tags" : ["<b>"],
		        		  "post_tags" : ["</b>"],
					      "fields":{
					        "name":{},
					        "enum.n":{},
					        "enum.i_c.c":{}
					    }
			};
			if(option.desc){
				highlight.fields["desc"] = {"number_of_fragments" : 0};
			}
			if(option.syn){
				highlight.fields["enum.s"] = {};
				highlight.fields["cde_pv.n"] = {};
				highlight.fields["cde_pv.ss.s"] = {};
			}
		}
		elastic.query(config.index_p, query, highlight, function(result){
			if(result.hits === undefined){
				return handleError.error(res, result);
			}
			let data = result.hits.hits;
			data.forEach(function(entry){
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

var indexing = function(req, res){
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
                	"tokenizer" : "standard",
                	"char_filter" : ["my_filter"],
                	"filter" : ["standard", "lowercase"]
		        }
	         },
			"char_filter" : {
				"my_filter" : {
                    "type" : "mapping",
                    "mappings" : ["_=>-"]
                }
			}
	      }
		},
		"mappings" : {
	        "props" : {
	            "properties" : {
	                "id": {
	                	"type":"keyword"
	                },
	                "category": {
	                	"type":"keyword"
	                },
	                "node":{
	                	"type":"keyword"
	                },
	                "name" : {
	                	"type": "string",
	                	"fields":{
	                		"have":{
	                			"type": "text",
	                			"analyzer": "my_standard"
	                		}
	                	},
	                	"analyzer": "case_insensitive"
	                },
	                "enum.n" : {
	                	"type": "string",
	                	"fields":{
	                		"have":{
	                			"type": "text"
	                		}
	                	},
	                	"analyzer": "case_insensitive"
	                },
	                "enum.s" : {
	                	"type": "string",
	                	"fields":{
	                		"have":{
	                			"type": "text"
	                		}
	                	},
	                	"analyzer": "case_insensitive"
	                },
	                "cde_pv.n" : {
	                	"type": "string",
	                	"fields":{
	                		"have":{
	                			"type": "text"
	                		}
	                	},
	                	"analyzer": "case_insensitive"
	                },
	                "cde_pv.ss.s" : {
	                	"type": "string",
	                	"fields":{
	                		"have":{
	                			"type": "text"
	                		}
	                	},
	                	"analyzer": "case_insensitive"
	                },
	                "enum.i_c.c":{
	                	"type": "string",
	                	"analyzer": "case_insensitive"
	                },
	                "enum.i_c.have":{
	                	"type": "string",
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
		"mappings" : {
	        "suggestions" : {
	            "properties" : {
	                "id":{
	                	"type": "completion",
	                	"max_input_length": 100
	                }
	            }
	        }
	    }
	};
	configs.push(config_suggestion);
	elastic.createIndexes(configs, function(result){
		if(result.acknowledged === undefined){
			return handleError.error(res, result);
		}
		elastic.bulkIndex(function(data){
			if(data.indexed === undefined){
				return handleError.error(res, data);
			}
			return res.json(data);
		});
	});
};

var getDataFromCDE = function(req, res){
	if(cdeData === ''){
		//load data file to memory
		let content_1 = fs.readFileSync("./cdeData.js").toString();
		content_1 = content_1.replace(/}{/g, ",");
		let content_2 = fs.readFileSync("./synonyms.js").toString();
		content_2 = content_2.replace(/}{/g, ",");
		cdeData = JSON.parse(content_1);
		let syns = JSON.parse(content_2);
		for(var c in cdeData){
			let pvs = cdeData[c];
			pvs.forEach(function(pv){
				if(pv.pvc !== null && pv.pvc.indexOf(':') === -1){
					pv.syn = syns[pv.pvc];
				}
				if(pv.pvc !== null && pv.pvc.indexOf(':') >= 0){
					let cs = pv.pvc.split(":");
					let synonyms = [];
					cs.forEach(function(s){
						if(!(s in syns)){
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

var getCDEData = function(req, res){
	let uid = req.query.id;
	if(cdeData[uid] == undefined){
		//load data file to memory
		
		let query = {};
		query.term = {};
		query.term["cde.id"] = uid;
		elastic.query(config.index_p, query, null, function(result){
			if(result.hits === undefined){
				return handleError.error(res, result);
			}
			let data = result.hits.hits;
			//cache the data and response
			if(data.length > 0){
				let p = data[0];
				cdeData[uid] = p._source.cde_pv;
				let pid = p._source.name + "/" + p._source.node + "/" + p._source.category;
				if(!(pid in gdcData)){
					gdcData[pid] = p._source.enum;	
				}
			}
			
			res.json(cdeData[uid]);
		});
	}
	else{
		res.json(cdeData[uid]);
	}
};

var getDataFromGDC = function(req, res){
	if(gdcData === ''){
		//load data file to memory
		let content_1 = fs.readFileSync("./conceptCode.js").toString();
		let content_2 = fs.readFileSync("./synonyms.js").toString();
		let content_3 = fs.readFileSync("./gdc_values.js").toString();
		content_2 = content_2.replace(/}{/g, ",");
		let cc = JSON.parse(content_1);
		let syns = JSON.parse(content_2);
		let gv = JSON.parse(content_3);
		gdcData = {};
		//put data from gdc_values.js to memory
		for(var c in gv){
			gdcData[c] = [];
			gv[c].forEach(function(ss){
				let tmp = {};
				tmp.pv = ss.nm;
				tmp.pvc = ss.n_c;
				tmp.code = ss.i_c;
				tmp.syn = syns[ss.n_c];
				gdcData[c].push(tmp);
			});
		}
		//put data from conceptCode.js to memory
		for(var t in cc){
			gdcData[t] = [];
			let obj = cc[t];
			for(var m in obj){
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

var getGDCData = function(req, res){
	let uid = req.query.id;
	if(gdcData[uid] == undefined){
		//load data file to memory
		
		let query = {};
		query.terms = {};
		query.terms._id = [];
		query.terms._id.push(uid);
		elastic.query(config.index_p, query, null, function(result){
			if(result.hits === undefined){
				return handleError.error(res, result);
			}
			let data = result.hits.hits;
			//cache the data and response
			
			if(data.length > 0){
				let p = data[0];
				gdcData[uid] = p._source.enum;
				let cde = p._source.cde;
				if(cde !== undefined && !(cde.id in cdeData)){
					cdeData[cde.id] = p._source.cde_pv;
				}
			}
			
			res.json(gdcData[uid]);
		});
	}
	else{
		res.json(gdcData[uid]);
	}
};

var getGDCandCDEData = function(req, res){
	let uid = req.query.local;
	let cdeId = req.query.cde;
	if(gdcData[uid] == undefined){
		//load data file to memory
		
		let query = {};
		query.terms = {};
		query.terms._id = [];
		query.terms._id.push(uid);
		elastic.query(config.index_p, query, null, function(result){
			if(result.hits === undefined){
				return handleError.error(res, result);
			}
			let data = result.hits.hits;
			//cache the data and response
			
			if(data.length > 0){
				let p = data[0];
				gdcData[uid] = p._source.enum;
				let cde = p._source.cde;
				if(cde !== undefined && !(cde.id in cdeData)){
					cdeData[cde.id] = p._source.cde_pv;
				}
			}
			
			let tmp = {};
			tmp.to = cdeData[cdeId];
			tmp.from = gdcData[uid];
			res.json(tmp);
		});
	}
	else{
		let result = {};
		result.to = cdeData[cdeId];
		result.from = gdcData[uid];
		res.json(result);
	}
	
};

var preload = function(req, res){
	elastic.loadSynonyms(function(result){
		if(result === 1){
			res.json({"status":"success", "message":"preparing data..."});
		}
		else{
			res.json({"status":"failed", "message":"failed to loading data from caDSR."});
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

var export2Excel = function(req, res){
	let query = {"match_all": {}};

	elastic.query(config.index_p, query, null, function(result){
		if(result.hits === undefined){
			return handleError.error(res, result);
		}
		let data = result.hits.hits;
		let ds = [];
		data.forEach(function(entry){
			let vs = entry._source.enum;
			if(vs){
				let cde = entry._source.cde_pv;
				vs.forEach(function(v){
					let tmp = {};
					tmp.c = entry._source.category;
					tmp.n = entry._source.node;
					tmp.p = entry._source.name;
					tmp.v = v.n;
					tmp.ncit = v.n_c;
					if(v.i_c){
						tmp.icdo = v.i_c.c;
					}
					else{
						tmp.icdo = "";
					}
					if(tmp.n == 'follow_up' && tmp.p == 'adverse_event'){
						cde.forEach(function(c){
							if(c.n.trim().toLowerCase() == tmp.v.trim().toLowerCase()){
								tmp.ctcae = c.ss[0].c;
							}
						});
					}
					else{
						tmp.ctcae = "";
					}
					ds.push(tmp);
				});
				
			}
		});
		let heading = [
			['Category', 'Node', 'Property', 'Value', 'NCIt Code', 'ICD-O-3 Code', 'CTCAE Code']
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
			},
			ncit: {
				width: 100
			},
			icdo: {
				width: 100
			},
			ctcae: {
				width: 100
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

var getNCItInfo = function(req, res){
	let code = req.query.code;
	let url = config.NCIt_url[4] + code;
	https.get(url, (rsp) => {
		  let html = '';
		  rsp.on('data', (dt) => {
			html += dt;
		  });
		  rsp.on('end', function(){
			  	if(html.trim() !== ''){
			  		let data = JSON.parse(html);
			  		res.json(data);
			  	}
  			});

	}).on('error', (e) => {
	  logger.debug(e);
	});
};

module.exports = {
	suggestion,
	searchP,
	getDataFromCDE,
	getCDEData,
	getDataFromGDC,
	getGDCData,
	getGDCandCDEData,
	preload,
	export2Excel,
	getNCItInfo,
	indexing
};