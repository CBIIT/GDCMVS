/**
 * Client for elasticsearch
 */

'use strict';

var fs = require('fs');
var path = require('path');
var elasticsearch = require('elasticsearch');
var yaml = require('yamljs');
var config = require('../config');
var caDSR = require('./caDSR');
var extend = require('util')._extend;
var allTerm = {};
var cdeData = '';
var gdc_values = {};
var allProperties = [];

var esClient = new elasticsearch.Client({
	host: config.elasticsearch.host,
	log: config.elasticsearch.log
});

function parseRef(ref, termsJson, defJson){
	let idx = ref.indexOf('/');
	let name = ref.substr(idx+1);
	if(ref.indexOf('_terms.yaml') ===0){
		return termsJson[name];
	}
	else if(ref.indexOf('_definitions.yaml') ===0){
		return defJson[name];
	}
	else{
		return {"$ref":ref};
	}
}

function helper(fileJson, termsJson, defJson, conceptCode, syns){
	let doc = {};
	let propsRaw = fileJson.properties;
	//correct properties format
	doc = extend(fileJson, {});
	delete doc['$schema'];
	doc.properties = [];
	doc.suggestion = {};
	doc.suggestion.input = [];
	for(var prop in propsRaw){
		let entry = {};
		let p = {};
		let entryRaw = propsRaw[prop];
		if(prop === '$ref'){
			let idx = entryRaw.indexOf('/');
			entry.name = entryRaw.substr(idx+1);
			entry = extend(entry, parseRef(entryRaw, termsJson, defJson));
		}
		else{
			entry.name = prop;
			if(entryRaw['$ref'] !== undefined){
				entry = extend(entry, parseRef(entryRaw['$ref'], termsJson, defJson));
				delete entryRaw['$ref'];
				entry = extend(entry, entryRaw);
			}
			else if(entryRaw.term !== undefined){
				if(entryRaw.term['$ref'] !== undefined){
					entryRaw.term = extend(entryRaw.term, parseRef(entryRaw.term['$ref'], termsJson, defJson));
					delete entryRaw.term['$ref'];
				}
				entry = extend(entry, entryRaw);
				if(entry.term.termDef !== undefined && entry.term.termDef.cde_id !== undefined){
					entry.term.termDef.cde_id = "" + entry.term.termDef.cde_id;
					if(entry.term.termDef.source ==='caDSR'){
						entry.syns = cdeData[entry.term.termDef.cde_id];
						if(entry.syns.length > 0){
							entry.cde_len = entry.syns.length;
						}
						
						//generate cde_pv for properties index
						p.cde_pv = [];
						entry.syns.forEach(function(sn){
							let tmp = {};
							tmp.n = sn.pv;
							tmp.d = sn.pvd;
							tmp.ss = [];
							if(sn.syn !== undefined){
								let v = {};
								v.c = sn.pvc;
								v.s = sn.syn;
								tmp.ss.push(v);
							}
							else if(sn.ss !== undefined){
								sn.ss.forEach(function(s){
									let v = {};
									v.c = s.code;
									v.s = s.syn;
									tmp.ss.push(v);
								});
							}
							p.cde_pv.push(tmp);
						});
					}
				}
			}
			else{
				entry = extend(entry, entryRaw);
			}
			
		}
		//add conceptcode
		if(prop in conceptCode){
			let cc = conceptCode[prop];
			let enums = [];
			entry.syns = [];
			for(var s in cc){
				enums.push(s);
				let tmp = {};
				tmp.pv = s;
				tmp.pvc = cc[s];
				tmp.syn = tmp.pvc !== "" ? syns[tmp.pvc] : [];
				entry.syns.push(tmp);
			}
			if(entry.enum === undefined){
				entry.enum = enums;
			}
		}
		//check extra gdc values
		if(prop in gdc_values){
			let enums = [];
			let obj = gdc_values[prop];
			obj.forEach(function(v){
				let tmp = {};
				tmp.pv = v.nm;
				tmp.code = v.i_c;
				tmp.pvc = v.n_c;
				tmp.syn = tmp.pvc !== "" ? syns[tmp.pvc] : [];
				entry.syns.push(tmp);
				enums.push(v.nm);
			});
			entry.enum = enums;
		}
		doc.properties.push(entry);


		//building typeahead index
		if(entry.name in allTerm){
			//if exist, then check if have the same type
			let t = allTerm[entry.name];
			if(t.indexOf("p") == -1){
				t.push("p");
			}
		}
		else{
			let t = [];
			t.push("p");
			allTerm[entry.name] = t;
		}
		
		let enums = [];
		if(entry.enum !== undefined){
			enums = entry.enum;
		}
		else if(entry.oneOf !== undefined && Array.isArray(entry.oneOf)){
			entry.oneOf.forEach(function(em){
                if(em.enum !== undefined){
                    enums = enums.concat(em.enum);
                }
            });
		}
		enums.forEach(function(em){
			if(em in allTerm){
				//if exist, then check if have the same type
				let t = allTerm[em];
				if(t.indexOf("v") == -1){
					t.push("v");
				}
			}
			else{
				let t = [];
				t.push("v");
				allTerm[em] = t;
			}
		});
		//generate property index
		p.name = entry.name;
		p.node = fileJson.id;
		p.category = fileJson.category;
		if(entry.description === undefined){
			if(entry.term !== undefined && entry.term.description !== undefined){
				p.desc = entry.term.description;
			}
		}
		else{
			p.desc = entry.description;
		}
		if(entry.term !== undefined && entry.term.termDef !== undefined && entry.term.termDef.cde_id !== undefined){
			p.cde_id = entry.term.termDef.cde_id;
		}
		//generate enum
		if(entry.syns == undefined){
			//simple enumeration
			if(entry.enum !==undefined && entry.enum.length > 0){
				p.enum = [];
				entry.enum.forEach(function(item){
					let tmp = {};
					tmp.n = item;
					p.enum.push(tmp);
				});
			}
		}
		else{
			//has gdc synonyms
			if((prop in conceptCode) || (prop in gdc_values)){
				p.enum = [];
				entry.syns.forEach(function(item){
					let tmp = {};
					tmp.n = item.pv;
					if(item.code !== undefined){
						tmp.i_c = item.code;
					}
					tmp.n_c = item.pvc;
					tmp.s = item.syn;
					p.enum.push(tmp);
				});
			}
			else{
				if(entry.enum !==undefined && entry.enum.length > 0){
					p.enum = [];
					entry.enum.forEach(function(item){
						let tmp = {};
						tmp.n = item;
						p.enum.push(tmp);
					});
				}
			}
			
		}
		allProperties.push(p);
	}
	
	return doc;
}

function extendDef(termsJson, defJson){
	for(var d in defJson){
		let df = defJson[d];
		if(df.term !== undefined){
			let idx = df.term["$ref"].indexOf('/');
			let termName = df.term["$ref"].substr(idx+1);
			df.term = termsJson[termName];
		}
	}
}

function bulkIndex(next){
	//load synonyms data file to memory
	let cc = fs.readFileSync("./conceptCode.js").toString();
	let ccode = JSON.parse(cc);
	//load suggestedTerm data file to memory
	let gv = fs.readFileSync("./gdc_values.js").toString();
	gdc_values = JSON.parse(gv);
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
	var folderPath = path.join(__dirname, '..','data');
	var count = 0, total = 0;
	var termsJson = yaml.load(folderPath+'/_terms.yaml');
	var defJson = yaml.load(folderPath + '/_definitions.yaml');
	extendDef(termsJson, defJson);
	let bulkBody = [];
	fs.readdirSync(folderPath).forEach(file =>{
		if(file.indexOf('_') !== 0){
			count++;
			let fileJson = yaml.load(folderPath+'/'+file);
			if(fileJson.category !=="TBD"){
				let doc = helper(fileJson, termsJson, defJson, ccode, syns);
				bulkBody.push({
					index: {
						_index: config.indexName,
						_type: 'nodes',
						_id: doc.id
					}
				});
				bulkBody.push(doc);
			}
			
		}
		total++;

	});
	//build suggestion index
	let suggestionBody = [];
	for(var term in allTerm){
		let doc = {};
		doc.id = term.toString();
		doc.type = allTerm[term];
		suggestionBody.push({
			index: {
				_index: config.suggestionName,
				_type: 'suggestions',
				_id: doc.id
			}
		});
		suggestionBody.push(doc);
	}
	//build property index
	let propertyBody = [];
	allProperties.forEach(function(ap){
		let doc = extend(ap, {});
		doc.id = ap.name+"/"+ap.node+"/"+ap.category;
		propertyBody.push({
			index: {
				_index: config.index_p,
				_type: 'props',
				_id: doc.id
			}
		});
		propertyBody.push(doc);
	});
	esClient.bulk({body: bulkBody}, function(err, data){
		if(err){
			return next(err);
		}
		let errorCount = 0;
		data.items.forEach(item => {
			if (item.index && item.index.error) {
			  console.log(++errorCount, item.index.error);
			}
		});
		esClient.bulk({body: propertyBody}, function(err_p, data_p){
			if(err_p){
				return next(err_p);
			}
			let errorCount_p = 0;
			data_p.items.forEach(item => {
				if (item.index && item.index.error) {
				  console.log(++errorCount_p, item.index.error);
				}
			});
			esClient.bulk({body: suggestionBody}, function(err_s, data_s){
				if(err_s){
					return next(err_s);
				}
				let errorCount_s = 0;
				data_s.items.forEach(itm => {
					if (itm.index && itm.index.error) {
					  console.log(++errorCount_s, itm.index.error);
					}
				});
				next({indexed: (count - errorCount), 
						total: count, 
						property_indexed: (propertyBody.length - errorCount_p),
						property_total: propertyBody.length,
						suggestion_indexed: (suggestionBody.length - errorCount_s), 
						suggestion_total: suggestionBody.length});
			});
		});
	});
	
}

exports.bulkIndex = bulkIndex;

function query(index, dsl,highlight, next){
	var body = {
      size: 1000,
      from: 0
    };
    body.query = dsl;
    if(highlight){
    	body.highlight = highlight;
    }
    body.sort = [{"category":"asc"},{"node":"asc"}];
    esClient.search({index: index, body: body}, function(err, data){
    	if(err){
    		console.log(err);
    		next(err);
    	}
    	else{
    		next(data);
    	}
    });
}

exports.query = query;


function suggest(index, suggest, next){
	let body = {};
	body.suggest = suggest;
	esClient.search({index: index,"_source": true, body: body}, function(err, data){
		if(err){
			console.log(err);
    		next(err);
		}
		else{
			next(data);
		}
	});
}

exports.suggest = suggest;

function createIndexes(params, next){
	esClient.indices.create(params[0], function(err_1, result_1){
		if(err_1){
			console.log(err_1);
			next(err_1);
		}
		else{
			esClient.indices.create(params[1], function(err_2, result_2){
				if(err_2){
					console.log(err_2);
					next(err_2);
				}
				else{
					esClient.indices.create(params[2], function(err_3, result_3){
						if(err_3){
							console.log(err_3);
							next(err_3);
						}
						else{
							console.log("have built node, property and suggestion indexes.");
							next(result_3);
						}
					});
				}
			});
		}
	});
}

exports.createIndexes = createIndexes;

function preloadDataFromCaDSR(next){
	let folderPath = path.join(__dirname, '..','data');
	let termsJson = yaml.load(folderPath+'/_terms.yaml');
	let ids = [];
	for(var term in termsJson){
		let detail = termsJson[term];
		if(detail.termDef !== undefined && detail.termDef.source !== undefined && detail.termDef.source === 'caDSR'){
			if(detail.termDef.cde_id !== undefined){
				ids.push(detail.termDef.cde_id);
			}
		}
	}
	caDSR.loadData(ids);
	next(1);
}

exports.preloadDataFromCaDSR = preloadDataFromCaDSR;

function preloadDataAfter(next){
	caDSR.loadDataAfter();
	next(1);
}

exports.preloadDataAfter = preloadDataAfter;