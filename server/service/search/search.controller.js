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

var searchICDO3Data = function(req, res){
	var icdo3_code = req.query.icdo3;
	let data = [];
	let query = {};
	
	if(icdo3_code.trim() !== ''){
		
		
		query.term={};
		query.term["enum.i_c.have"] = icdo3_code;
		
		let highlight;
		
		elastic.query(config.index_p, query, highlight, function(result){
			let mainData = [];
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

			for(let d in data){
				let enums = data[d]._source.enum;
				let ICDO3Data = {};
				ICDO3Data.category = data[d]._source.category;
				ICDO3Data.node = data[d]._source.node;
				ICDO3Data.property = data[d]._source.name;
				ICDO3Data.enums =[];
				for(let e in enums){
					
					if((enums[e].i_c.have).indexOf(icdo3_code) > -1){
						
						ICDO3Data.enums.push(enums[e]);
						
					}
				}
				mainData.push(ICDO3Data);
			}
			res.json(mainData);
		});
	}else{
		data.push('No data found!');
	}

}

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
	                	"type": "text",
	                	"fields":{
	                		"have":{
	                			"type": "text",
	                			"analyzer": "my_standard"
	                		}
	                	},
	                	"analyzer": "case_insensitive"
	                },
	                "enum.n" : {
	                	"type": "text",
	                	"fields":{
	                		"have":{
	                			"type": "text"
	                		}
	                	},
	                	"analyzer": "case_insensitive"
	                },
	                "enum.s" : {
	                	"type": "text",
	                	"fields":{
	                		"have":{
	                			"type": "text"
	                		}
	                	},
	                	"analyzer": "case_insensitive"
	                },
	                "cde_pv.n" : {
	                	"type": "text",
	                	"fields":{
	                		"have":{
	                			"type": "text"
	                		}
	                	},
	                	"analyzer": "case_insensitive"
	                },
	                "cde_pv.ss.s" : {
	                	"type": "text",
	                	"fields":{
	                		"have":{
	                			"type": "text"
	                		}
	                	},
	                	"analyzer": "case_insensitive"
	                },
	                "enum.i_c.c":{
	                	"type": "text",
	                	"analyzer": "case_insensitive"
	                },
	                "enum.i_c.have":{
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
				let pid =  p._source.category + "." + p._source.node + "." + p._source.name;
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
		//load data from gdc_values.js to memory
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
		//load data from conceptCode.js to memory
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
	elastic.loadSynonyms_continue(function(result){
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

var export_release_elephant_cat =  function(req, res){
	let heading = [
		['Category', 'Node', 'Property', 'Value', 'Description']
	];

	let merges = [];
	let specification = {
		c : {
			width : 200
		},
		n : {
			width : 200
		},
		p : {
			width : 200
		},
		v : {
			width : 200
		},
		d : {
			width : 200
		}
	};


	
	let all_files = [];
	let file_definitions = {};
	let file_terms = {};
	let folderPath = path.join(__dirname,'../..','data_elephant');
	fs.readdirSync(folderPath).forEach(file => {
		let tmp_file = {};
		if(file !== '_definitions.yaml' && file !== '_terms.yaml'){
			tmp_file = yaml.load(folderPath+'/'+file);
			all_files.push(tmp_file);
		}
		file_definitions = yaml.load(folderPath + '/' +'_definitions.yaml');
		file_terms = yaml.load(folderPath + '/' + '_terms.yaml');
		
	});
	
	let data = [];
	all_files.forEach(function(item){
		
		//console.log(item);
		let keys1 = Object.keys(item.properties);
		
		for(var i=0; i < keys1.length; i++)
		{
			
			let value=keys1[i];

			if((item.properties[value]).hasOwnProperty('enum')){
				
				for(var m=0; m< item.properties[value].enum.length; m++){
					

					if((item.properties[value]).hasOwnProperty('$ref')){

						let temp_value = item.properties[value].$ref;
						
						if(temp_value.indexOf('_definitions.yaml') > -1){
							let fileName_data = [];
							fileName_data = temp_value.split('#/');
							//console.log(fileName_data);
							//console.log(file_definitions[fileName_data[1]]);
							if((file_definitions[fileName_data[1]]).hasOwnProperty('enum')){
		
								for(var n=0; n< file_definitions[fileName_data[1]].enum.length; n++){
									let tmp_data = {};
									tmp_data.c = item.category;
									tmp_data.n = item.id;			
									tmp_data.p = value;
									tmp_data.v = file_definitions[fileName_data[1]].enum[n];
		
									if((file_definitions[fileName_data[1]]).hasOwnProperty('term') && (file_definitions[fileName_data[1]].term).hasOwnProperty('$ref') ){
										if(file_definitions[fileName_data[1]].term.$ref.indexOf('_terms.yaml') > -1){
											let term_value = [];
											term_value = file_definitions[fileName_data[1]].term.$ref.split('#/');
											
		
											if(file_terms[term_value[1]].hasOwnProperty('description')){
												tmp_data.d = file_terms[term_value[1]].description;
											}else{
												tmp_data.d = "";
											}
		
										}
									}
		
									data.push(tmp_data);
								}
								
							}
		
						}
					}else{
						let tmp_data = {};
						tmp_data.c = item.category;
						tmp_data.n = item.id;			
						tmp_data.p = value;
						tmp_data.v = item.properties[value].enum[m];

						if(item.properties[value].hasOwnProperty('description')){
							tmp_data.d = item.properties[value].description;
						}
						else{
							tmp_data.d = " ";
						}
						data.push(tmp_data);

						}
				}
			}else if((item.properties[value]).hasOwnProperty('$ref')){

				let temp_value = item.properties[value].$ref;
				
				if(temp_value.indexOf('_definitions.yaml') > -1){
					let fileName_data = [];
					fileName_data = temp_value.split('#/');
					//console.log(fileName_data);
					//console.log(file_definitions[fileName_data[1]]);
					if((file_definitions[fileName_data[1]]).hasOwnProperty('enum')){

						for(var n=0; n< file_definitions[fileName_data[1]].enum.length; n++){
							let tmp_data = {};
							tmp_data.c = item.category;
							tmp_data.n = item.id;			
							tmp_data.p = value;
							tmp_data.v = file_definitions[fileName_data[1]].enum[n];

							if((file_definitions[fileName_data[1]]).hasOwnProperty('term') && (file_definitions[fileName_data[1]].term).hasOwnProperty('$ref') ){
								if(file_definitions[fileName_data[1]].term.$ref.indexOf('_terms.yaml') > -1){
									let term_value = [];
									term_value = file_definitions[fileName_data[1]].term.$ref.split('#/');
									

									if(file_terms[term_value[1]].hasOwnProperty('description')){
										tmp_data.d = file_terms[term_value[1]].description;
									}else{
										tmp_data.d = "";
									}

								}
							}

							data.push(tmp_data);
						}
						
					}

				}
			}
			
		}
		


	});
	// console.log(data);
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
	   res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers) 
		res.send(report);
};

var export_release_elephant_cat_excel =  function(req, res){
	let heading = [
		['Category', 'Node', 'Property', 'Value', 'Description']
	];

	let merges = [];
	let specification = {
		categories : {
			width : 200
		},
		node : {
			width : 200
		},
		properties : {
			width : 200
		},
		value : {
			width : 200
		},
		description : {
			width : 2000
		}
	};


	let report_data = [];
	let all_files = [];
	let file_definitions = {};
	let file_terms = {};
	let folderPath = path.join(__dirname,'../..','data_elephant');
	fs.readdirSync(folderPath).forEach(file => {
		let tmp_file = {};
		if(file !== '_definitions.yaml' && file !== '_terms.yaml'){
			tmp_file = yaml.load(folderPath+'/'+file);
			all_files.push(tmp_file);
		}
		file_definitions = yaml.load(folderPath + '/' +'_definitions.yaml');
		file_terms = yaml.load(folderPath + '/' + '_terms.yaml');
		
	});
	
	all_files.forEach(function(item){
		if(item.hasOwnProperty('$schema')){
			
			let property_keys = Object.keys(item.properties);
			for(let k in property_keys){
				let key = property_keys[k];
				if(item.properties[key].hasOwnProperty('enum')){
					
					let local_value = item.properties[key];
					let local_enum = local_value.enum;
					for(let en in local_enum){
						let temp_data = {};
						temp_data.categories = item.category;
						temp_data.node = item.id;
						temp_data.properties = key;
						temp_data.value = local_enum[en];
						
						if(local_value.hasOwnProperty('description')){
							temp_data.description = local_value.description;
						}
						else if(local_value.hasOwnProperty('term') && local_value.term.hasOwnProperty('$ref')){
							let local_ref = local_value.term.$ref;
							if(local_ref.indexOf('_terms.yaml') > -1){
								let ref_value = local_ref.replace('_terms.yaml#/','');
								if(file_terms.hasOwnProperty(ref_value) && file_terms[ref_value].hasOwnProperty('description')){
									temp_data.description = file_terms[ref_value].description;
								}
								
							}
						}
						else{
							temp_data.description = "";
						}
						report_data.push(temp_data);
					}
				}
				console.log(item.properties.$ref);
				if(item.properties.hasOwnProperty('$ref')){
					
				}
			}
		}else{
			
		}
	});
	
	const report = excel.buildExport(
		[ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report 
		  {
			name: 'Report', // <- Specify sheet name (optional) 
			heading: heading, // <- Raw heading array (optional) 
			merges: merges, // <- Merge cell ranges 
			specification: specification, // <- Report specification 
			data: report_data // <-- Report data 
		  }
		]
	  );
	  res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers) 
	   res.send(report);
};



module.exports = {
	suggestion,
	searchP,
	searchICDO3Data,
	getDataFromCDE,
	getCDEData,
	getDataFromGDC,
	getGDCData,
	getGDCandCDEData,
	preload,
	export2Excel,
	export_release_elephant_cat,
	export_release_elephant_cat_excel,
	getNCItInfo,
	indexing
};