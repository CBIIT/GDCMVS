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
			let refs = [];
			let obj = gdc_values[prop];
			for(var c in obj){
				let tmp = {};
				tmp.pv = c;
				tmp.code = obj[c];
				refs.push(tmp);
				enums.push(c);
			}
			entry.ref = refs;
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
		esClient.bulk({body: suggestionBody}, function(err, result){
			if(err){
				return next(err);
			}
			let errorCount_suggest = 0;
			result.items.forEach(itm => {
				if (itm.index && itm.index.error) {
				  console.log(++errorCount_suggest, itm.index.error);
				}
			});
			next({indexed: (count - errorCount), total: count, suggestion_indexed: (suggestionBody.length - errorCount_suggest), suggestion_total: suggestionBody.length});
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
    body.sort = [{"category":"asc"}];
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
	esClient.indices.create(params[0], function(err, resp){
		if(err){
			console.log(err);
			next(err);
		}
		else{
			esClient.indices.create(params[1], function(error, result){
				if(error){
					console.log(error);
					next(error);
				}
				else{
					console.log("have built node and suggestion indexes.");
					next(result);
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