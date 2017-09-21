'use strict';

var https = require('https');

var elastic = require('../../components/elasticsearch');
var handleError = require('../../components/handleError');
var config = require('../../config');
var fs = require('fs');
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

var search = function(req, res){
	let keyword = req.query.keyword;
	let option = JSON.parse(req.query.option);
	let words = [];
	let query = {};
	let highlight;
	if(keyword.trim() ===''){
		query = {"match_all": {}};
		highlight = null;
	}
	else{
		query.bool = {};
		query.bool.should = [];
		let m = {};
		m.multi_match = {};
		m.multi_match.query = keyword;
		if(option.match !=="exact"){
			m.multi_match.fields = ["links.target_type",
	                  "properties.name.have"];
		    if(option.desc){
		    	m.multi_match.fields.push("properties.description");
		    	m.multi_match.fields.push("properties.term.description");
		    }
		    if(option.syn){
		    	m.multi_match.fields.push("properties.syns.syn.have");
		    	m.multi_match.fields.push("properties.syns.ss.syn.have");
		    }
		    m.multi_match.fields.push("properties.enum.have");
		    m.multi_match.fields.push("properties.oneOf.enum.have");
		    query.bool.should.push(m);
			// query.bool.should.push({
			// 	"term": {"properties.enum.raw" :keyword}
			// });
			// query.bool.should.push({
		 //    	"term": {"properties.oneOf.enum.raw": keyword}
		 //    });
		    highlight = {
					      "pre_tags" : ["<b>"],
		        		  "post_tags" : ["</b>"],
					      "fields":{
					        "properties.name.have":{"number_of_fragments" : 0},
					        "links.target_type":{},
					        "properties.enum.have":{"number_of_fragments" : 0},
					        "properties.oneOf.enum.have":{"number_of_fragments" : 0}
					    }
			};
			if(option.desc){
				highlight.fields["properties.description"] = {"number_of_fragments" : 0};
				highlight.fields["properties.term.description"] = {"number_of_fragments" : 0};
			}
			if(option.syn){
				highlight.fields["properties.syns.syn.have"] = {"number_of_fragments" : 0};
				highlight.fields["properties.syns.ss.syn.have"] = {"number_of_fragments" : 0};
			}
		}
		else{
			m.multi_match.fields = ["links.target_type",
	                  "properties.name"];
		    if(option.desc){
		    	m.multi_match.fields.push("properties.description");
		    	m.multi_match.fields.push("properties.term.description");
		    }
		    if(option.syn){
		    	m.multi_match.fields.push("properties.syns.syn");
		    	m.multi_match.fields.push("properties.syns.ss.syn");
		    }
		    m.multi_match.fields.push("properties.enum");
		    m.multi_match.fields.push("properties.oneOf.enum");
		    query.bool.should.push(m);
			// query.bool.should.push({
			// 	"term": {"properties.enum" :keyword}
			// });
			// query.bool.should.push({
		 //    	"term": {"properties.oneOf.enum": keyword}
		 //    });
		    highlight = {
					      "pre_tags" : ["<b>"],
		        		  "post_tags" : ["</b>"],
					      "fields":{
					        "properties.name":{},
					        "links.target_type":{},
					        "properties.enum":{},
					        "properties.oneOf.enum":{}
					    }
			};
			if(option.desc){
				highlight.fields["properties.description"] = {"number_of_fragments" : 0};
				highlight.fields["properties.term.description"] = {"number_of_fragments" : 0};
			}
			if(option.syn){
				highlight.fields["properties.syns.syn"] = {};
				highlight.fields["properties.syns.ss.syn"] = {};
			}
		}
		
	}
	
	elastic.query(config.indexName, query, highlight, function(result){
		if(result.hits === undefined){
			return handleError.error(res, result);
		}
		let data = result.hits.hits;
		res.json(data);
	});
};

var searchP = function(req, res){
	let keyword = req.query.keyword;
	let option = JSON.parse(req.query.option);
	let words = [];
	let query = {};
	let highlight;
	if(keyword.trim() ===''){
		query = {"match_all": {}};
		highlight = null;
	}
	else{
		query.bool = {};
		query.bool.should = [];
		let m = {};
		m.multi_match = {};
		m.multi_match.query = keyword;
		if(option.match !=="exact"){
			m.multi_match.fields = ["name.have"];
		    if(option.desc){
		    	m.multi_match.fields.push("desc");
		    }
		    if(option.syn){
		    	m.multi_match.fields.push("enum.s.have");
		    	m.multi_match.fields.push("cde_pv.ss.s.have");
		    }
		    m.multi_match.fields.push("enum.n.have");
		    query.bool.should.push(m);
		    highlight = {
					      "pre_tags" : ["<b>"],
		        		  "post_tags" : ["</b>"],
					      "fields":{
					        "name.have":{"number_of_fragments" : 0},
					        "enum.n.have":{"number_of_fragments" : 0}
					    }
			};
			if(option.desc){
				highlight.fields["desc"] = {"number_of_fragments" : 0};
			}
			if(option.syn){
				highlight.fields["enum.s.have"] = {"number_of_fragments" : 0};
				highlight.fields["cde_pv.ss.s.have"] = {"number_of_fragments" : 0};
			}
		}
		else{
			m.multi_match.fields = ["name"];
		    if(option.desc){
		    	m.multi_match.fields.push("desc");
		    }
		    if(option.syn){
		    	m.multi_match.fields.push("enum.s");
		    	m.multi_match.fields.push("cde_pv.ss.s");
		    }
		    m.multi_match.fields.push("enum.n");
		    query.bool.should.push(m);
			// query.bool.should.push({
			// 	"term": {"properties.enum" :keyword}
			// });
			// query.bool.should.push({
		 //    	"term": {"properties.oneOf.enum": keyword}
		 //    });
		    highlight = {
					      "pre_tags" : ["<b>"],
		        		  "post_tags" : ["</b>"],
					      "fields":{
					        "name":{},
					        "enum.n":{}
					    }
			};
			if(option.desc){
				highlight.fields["desc"] = {"number_of_fragments" : 0};
			}
			if(option.syn){
				highlight.fields["enum.s"] = {};
				highlight.fields["cde_pv.ss.s"] = {};
			}
		}
		
	}
	
	elastic.query(config.index_p, query, highlight, function(result){
		if(result.hits === undefined){
			return handleError.error(res, result);
		}
		let data = result.hits.hits;
		res.json(data);
	});
};

var indexing = function(req, res){
	let configs = [];
	let config_node = {};
	config_node.index = config.indexName;
	config_node.body = {
		"settings": {
	      "analysis": {
	         "analyzer": {
	            "case_insensitive": {
	               "tokenizer": "keyword",
	               "filter": [
	                  "lowercase"
	               ]
	            },
	            "case_sensitive": {
	               "tokenizer": "keyword",
	               "filter": [
	                  "lowercase"
	               ]
	            }
	         }
	      }
		},
		"mappings" : {
	        "nodes" : {
	            "properties" : {
	                "id": {
	                	"type":"keyword"
	                },
	                "category": {
	                	"type":"keyword"
	                },
	                "properties.name" : {
	                	"type": "string",
	                	"fields":{
	                		"have":{
	                			"type": "text"
	                		}
	                	},
	                	"analyzer": "case_insensitive"
	                },
	                "properties.enum" : {
	                	"type": "string",
	                	"fields":{
	                		"have":{
	                			"type": "text"
	                		}
	                	},
	                	"analyzer": "case_insensitive"
	                },
	                "properties.oneOf.enum":{
	                	"type": "string",
	                	"fields":{
	                		"have":{
	                			"type": "text"
	                		}
	                	},
	                	"analyzer": "case_insensitive"
	                },
	                "properties.syns.syn" : {
	                	"type": "string",
	                	"fields":{
	                		"have":{
	                			"type": "text"
	                		}
	                	},
	                	"analyzer": "case_insensitive"
	                },
	                "properties.syns.ss.syn" : {
	                	"type": "string",
	                	"fields":{
	                		"have":{
	                			"type": "text"
	                		}
	                	},
	                	"analyzer": "case_insensitive"
	                }
	            }
	        }
	    }
	};

	configs.push(config_node);
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
	                			"type": "text"
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
	                "cde_pv.ss.s" : {
	                	"type": "string",
	                	"fields":{
	                		"have":{
	                			"type": "text"
	                		}
	                	},
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
		query.term.cde_id = uid;
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
				let cde_id = p._source.cde_id;
				if(cde_id !== undefined && !(cde_id in cdeData)){
					cdeData[cde_id] = p._source.cde_pv;
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
				let cde_id = p._source.cde_id;
				if(cde_id !== undefined && !(cde_id in cdeData)){
					cdeData[cde_id] = p._source.cde_pv;
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
	elastic.preloadDataAfter(function(result){
		if(result === 1){
			res.json({"status":"success", "message":"preparing data..."});
		}
		else{
			res.json({"status":"failed", "message":"failed to loading data from caDSR."});
		}
	});
};

module.exports = {
	suggestion,
	search,
	searchP,
	getDataFromCDE,
	getCDEData,
	getDataFromGDC,
	getGDCData,
	getGDCandCDEData,
	preload,
	indexing
};