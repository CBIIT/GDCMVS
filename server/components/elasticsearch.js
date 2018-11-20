/**
 * Client for elasticsearch
 */

'use strict';

var fs = require('fs');
var path = require('path');
var elasticsearch = require('elasticsearch');
var yaml = require('yamljs');
var config = require('../config');
var config_dev = require('../config/dev');
var logger = require('./logger');
var caDSR = require('./caDSR');
var extend = require('util')._extend;
var _ = require('lodash');
var allTerm = {};
var cdeData = '';
var cdeDataType = '';
var report = require('../service/search/report');
var gdc_values = {};
var allProperties = [];

var esClient = new elasticsearch.Client({
	host: config_dev.elasticsearch.host,
	log: config_dev.elasticsearch.log
});

function parseRef(ref, termsJson, defJson) {
	let idx = ref.indexOf('/');
	let name = ref.substr(idx + 1);
	if (ref.indexOf('_terms.yaml') === 0) {
		return termsJson[name];
	} else if (ref.indexOf('_definitions.yaml') === 0) {
		return defJson[name];
	} else {
		return {
			"$ref": ref
		};
	}
}

function parseRefYaml(ref, termsJson, defJson) {
	let data = {};
	//return {"$ref":ref};
	var folderPath = path.join(__dirname, '..', 'data');
	let fileName = ref.split("#/")[0];
	let remmainingRef = ref.split("#/")[1];
	let title = remmainingRef.split('/')[0];
	let titleValue = remmainingRef.split('/')[1];
	if (fileName.indexOf(".yaml") !== -1) {
		let refJson = yaml.load(folderPath + '/' + fileName);
		let tmp = refJson[title];
		data.enum = tmp[titleValue].enum;
		if (tmp[titleValue].term) {
			data = extend(data, parseRef(tmp[titleValue].term['$ref'], termsJson, defJson));
		}
		return data;
	} else {
		return {
			"$ref": ref
		};
	}
}

function helper(fileJson, termsJson, defJson, conceptCode, syns) {
	let doc = {};
	let propsRaw = fileJson.properties;
	//correct properties format
	doc = extend(fileJson, {});
	delete doc['$schema'];
	doc.properties = [];
	doc.suggestion = {};
	doc.suggestion.input = [];
	for (var prop in propsRaw) {
		let entry = {};
		let p = {};
		let entryRaw = propsRaw[prop];
		if (prop === '$ref') {
			let idx = entryRaw.indexOf('/');
			entry.name = entryRaw.substr(idx + 1);
			entry = extend(entry, parseRef(entryRaw, termsJson, defJson));
		} else {
			entry.name = prop;
			if (entryRaw['$ref'] !== undefined) {
				if (entryRaw['$ref'].indexOf("_terms.yaml") == -1 && entryRaw['$ref'].indexOf("_definitions.yaml") == -1) {
					entry = extend(entry, parseRefYaml(entryRaw['$ref'], termsJson, defJson));
				} else {
					entry = extend(entry, parseRef(entryRaw['$ref'], termsJson, defJson));
				}
				delete entryRaw['$ref'];
				entry = extend(entry, entryRaw);
			} else if (entryRaw.term !== undefined) {
				if (entryRaw.term['$ref'] !== undefined) {
					entryRaw.term = extend(entryRaw.term, parseRef(entryRaw.term['$ref'], termsJson, defJson));
					delete entryRaw.term['$ref'];
				}
				entry = extend(entry, entryRaw);
				if (entry.term.termDef !== undefined && entry.term.termDef.cde_id !== undefined) {
					entry.term.termDef.cde_id = "" + entry.term.termDef.cde_id;
					if (entry.term.termDef.source === 'caDSR') {
						entry.syns = cdeData[entry.term.termDef.cde_id];
						if (entry.syns !== undefined && entry.syns.length > 0) {
							entry.cde_len = entry.syns.length;


							//generate cde_pv for properties index
							p.cde_pv = [];
							entry.syns.forEach(function (sn) {
								let tmp = {};
								tmp.n = sn.pv;
								tmp.m = sn.pvm;
								tmp.d = sn.pvd;
								tmp.ss = [];
								if (sn.syn !== undefined) {
									let v = {};
									v.c = sn.pvc;
									v.s = sn.syn;
									tmp.ss.push(v);
								} else if (sn.ss !== undefined) {
									sn.ss.forEach(function (s) {
										let v = {};
										v.c = s.code;
										v.s = s.syn;
										tmp.ss.push(v);
									});
								}
								p.cde_pv.push(tmp);
							});
						}
					} else if (entry.term.termDef.source === 'NCIt') {
						p.ncit = {};
						p.ncit.id = entry.term.termDef.cde_id;
						p.ncit.url = entry.term.termDef.term_url;
					}
				}
			} else {
				entry = extend(entry, entryRaw);
			}

		}
		let prop_full_name = fileJson.category + "." + fileJson.id + "." + prop;
		//add conceptcode
		if (prop_full_name in conceptCode) {
			let cc = conceptCode[prop_full_name];
			let enums = [];
			entry.syns = [];
			for (var s in cc) {
				enums.push(s);
				let tmp = {};
				tmp.pv = s;
				tmp.pvc = cc[s];
				tmp.syn = tmp.pvc !== "" ? syns[tmp.pvc] : [];
				entry.syns.push(tmp);
			}
			if (entry.enum === undefined) {
				entry.enum = enums;
			}
		}
		//check extra gdc values
		if (prop_full_name in gdc_values) {
			let enums = [];
			let obj = gdc_values[prop_full_name];
			obj.forEach(function (v) {
				let tmp = {};
				tmp.pv = v.nm;
				tmp.code = v.i_c;
				tmp.pvc = v.n_c;
				tmp.syn = tmp.pvc !== "" ? syns[tmp.pvc] : [];
				tmp.term_type = v.term_type;
				entry.syns.push(tmp);
				enums.push(v.nm);
			});
			entry.enum = enums;
		}
		doc.properties.push(entry);


		//building typeahead index
		if (entry.name in allTerm) {
			//if exist, then check if have the same type
			let t = allTerm[entry.name];
			if (t.indexOf("p") == -1) {
				t.push("p");
			}
		} else {
			let t = [];
			t.push("p");
			allTerm[entry.name] = t;
		}

		let enums = [];
		if (entry.enum !== undefined) {
			enums = entry.enum;
		} else if (entry.oneOf !== undefined && Array.isArray(entry.oneOf)) {
			entry.oneOf.forEach(function (em) {
				if (em.enum !== undefined) {
					enums = enums.concat(em.enum);
				}
			});
		}
		enums.forEach(function (enm) {
			let em = enm.toString().trim().toLowerCase();
			if (em in allTerm) {
				//if exist, then check if have the same type
				let t = allTerm[em];
				if (t.indexOf("v") == -1) {
					t.push("v");
				}
			} else {
				let t = [];
				t.push("v");
				allTerm[em] = t;
			}
		});
		// build typre ahed index for CDE ID
		if (entry.term !== undefined && entry.term.termDef !== undefined && entry.term.termDef.source === 'caDSR' && entry.term.termDef.cde_id !== undefined) {
			let em = entry.term.termDef.cde_id.toString().trim().toLowerCase();
			if (em in allTerm) {
				//if exist, then check if have the same type
				let t = allTerm[em];
				if (t.indexOf("c") == -1) {
					t.push("c");
				}
			} else {
				let t = [];
				t.push("c");
				allTerm[em] = t;
			}
		}
		//generate property index
		p.name = entry.name;
		p.node = fileJson.id;
		p.n_desc = fileJson.description;
		p.n_title = fileJson.title;
		p.category = fileJson.category;
		if (entry.description === undefined) {
			if (entry.term !== undefined && entry.term.description !== undefined) {
				p.desc = entry.term.description;
			}
		} else {
			p.desc = entry.description;
		}
		if (entry.term !== undefined && entry.term.termDef !== undefined && entry.term.termDef.source === 'caDSR' && entry.term.termDef.cde_id !== undefined) {
			p.cde = {};
			p.cde.id = entry.term.termDef.cde_id;
			p.cde.v = entry.term.termDef.cde_version;
			p.cde.url = entry.term.termDef.term_url;
			if (p.cde.id in cdeDataType) {
				p.cde.dt = cdeDataType[p.cde.id];
			}
		}
		//generate enum
		if (entry.syns == undefined) {
			//simple enumeration
			if (entry.enum !== undefined && entry.enum.length > 0) {
				p.enum = [];
				entry.enum.forEach(function (item) {
					let tmp = {};
					tmp.n = item;
					p.enum.push(tmp);
				});
			}
		} else {
			//has gdc synonyms
			if ((prop_full_name in conceptCode) || (prop_full_name in gdc_values)) {
				p.enum = [];
				entry.syns.forEach(function (item) {
					let tmp = {};
					if (item.term_type) {
						tmp.term_type = item.term_type;
					}
					tmp.n = item.pv;
					if (item.code !== undefined) {
						tmp.i_c = {};
						tmp.i_c.c = item.code;
						let ts = [];

						if (item.code.indexOf('C') >= 0) {
							//ICD-O-3 code with C
							//check if it's a range in level 2
							if (item.code.indexOf("-") >= 0) {
								let r = item.code.split("-");
								let start = parseInt(r[0].substr(1));
								let end = parseInt(r[1].substr(1));
								for (let i = start; i <= end; i++) {
									if (i < 10) {
										ts.push("C0" + i);
									} else {
										ts.push("C" + i);
									}
								}
							} else if (item.code.indexOf(".") >= 0) {
								//check if it has "/" in the code
								let idx = item.code.indexOf(".");
								let l2 = item.code.substr(0, idx);
								let l3 = item.code;
								ts.push(l2);
								ts.push(l3);
							} else {
								ts.push(item.code);
							}
						} else {
							//regular ICD-O-3 code
							//check if it's a range in level 2
							if (item.code.indexOf("-") >= 0) {
								let r = item.code.split("-");
								let start = parseInt(r[0]);
								let end = parseInt(r[1]);
								for (let i = start; i <= end; i++) {
									ts.push(i);
								}

							} else if (item.code.indexOf("/") >= 0) {
								//check if it has "/" in the code
								let idx = item.code.indexOf("/");
								let l3 = item.code.substr(0, idx);
								let l4 = item.code;
								let l2 = l3.substr(0, l3.length - 1);
								ts.push(l2);
								ts.push(l3);
								ts.push(l4);
							} else {
								ts.push(item.code);
							}
						}

						tmp.i_c.have = ts;
					}
					tmp.n_c = item.pvc;
					tmp.s = item.syn;
					p.enum.push(tmp);
				});
			} else {
				if (entry.enum !== undefined && entry.enum.length > 0) {
					p.enum = [];
					entry.enum.forEach(function (item) {
						let tmp = {};
						tmp.n = item;
						p.enum.push(tmp);
					});
				}
			}

		}
		//property type
		if (entry.enum !== undefined && entry.enum.length > 0) {
			p.type = "enum";
		} else {
			let type = typeof entry.type;
			p.type = type !== "undefined" && type !== "object" ? entry.type : "object";
		}
		allProperties.push(p);
	}
	return doc;
}

function extendDef(termsJson, defJson) {
	for (var d in defJson) {
		let df = defJson[d];
		if (df.term !== undefined) {
			let idx = df.term["$ref"].indexOf('/');
			let termName = df.term["$ref"].substr(idx + 1);
			df.term = termsJson[termName];
		}
	}
}

function bulkIndex(next) {
	let deprecated_properties = [];
	let deprecated_enum = [];
	var folderPath = path.join(__dirname, '..', 'data');
	fs.readdirSync(folderPath).forEach(file => {
		if (file.indexOf('_') !== 0) {
			let fileJson = yaml.load(folderPath + '/' + file);
			let category = fileJson.category;
			let node = fileJson.id;

			if (fileJson.deprecated) {
				fileJson.deprecated.forEach(function (d_p) {
					let tmp_d_p = category + "." + node + "." + d_p;
					deprecated_properties.push(tmp_d_p.trim().toLowerCase());
				})
			}

			for (let keys in fileJson.properties) {
				if (fileJson.properties[keys].deprecated_enum) {
					fileJson.properties[keys].deprecated_enum.forEach(function (d_e) {
						let tmp_d_e = category + "." + node + "." + keys + "." + d_e;
						deprecated_enum.push(tmp_d_e.trim().toLowerCase());
					});
				}
			}
		}
	});
	let searchable_nodes = ["case", "demographic", "diagnosis", "exposure", "family_history", "follow_up", "molecular_test", "treatment", "slide", "sample", "read_group", "portion", "analyte",
		"aliquot", "slide_image", "analysis_metadata", "clinical_supplement", "experiment_metadata", "pathology_report", "run_metadata", "biospecimen_supplement",
		"submitted_aligned_reads", "submitted_genomic_profile", "submitted_methylation_beta_value", "submitted_tangent_copy_number", "submitted_unaligned_reads"
	];
	//load synonyms data file to memory
	let cc = fs.readFileSync("./server/data_files/conceptCode.js").toString();
	let ccode = JSON.parse(cc);
	//load suggestedTerm data file to memory
	let gv = fs.readFileSync("./server/data_files/gdc_values.js").toString();
	gdc_values = JSON.parse(gv);
	let content_1 = fs.readFileSync("./server/data_files/cdeData.js").toString();
	content_1 = content_1.replace(/}{/g, ",");
	cdeData = JSON.parse(content_1);
	let content_2 = fs.readFileSync("./server/data_files/synonyms.js").toString();
	content_2 = content_2.replace(/}{/g, ",");
	let syns = JSON.parse(content_2);
	let content_3 = fs.readFileSync("./server/data_files/cdeDataType.js").toString();
	content_3 = content_3.replace(/}{/g, ",");
	cdeDataType = JSON.parse(content_3);
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
	var folderPath = path.join(__dirname, '..', 'data');
	var count = 0,
		total = 0;
	var termsJson = yaml.load(folderPath + '/_terms.yaml');
	var defJson = yaml.load(folderPath + '/_definitions.yaml');
	extendDef(termsJson, defJson);
	let bulkBody = [];
	fs.readdirSync(folderPath).forEach(file => {
		if (file.indexOf('_') !== 0) {
			let fileJson = yaml.load(folderPath + '/' + file);
			if (fileJson.category !== "TBD" && fileJson.id !== "metaschema" && searchable_nodes.indexOf(fileJson.id) !== -1) {
				logger.debug(folderPath + '/' + file);
				for (let keys in fileJson.properties) {
					if (fileJson.properties[keys].deprecated_enum) {
						fileJson.properties[keys].enum = _.differenceWith(fileJson.properties[keys].enum, fileJson.properties[keys].deprecated_enum, _.isEqual);
					}
					if (fileJson.deprecated && deprecated_properties.indexOf(fileJson.category + "." + fileJson.id + "." + keys) !== -1) {
						delete fileJson.properties[keys];
					}
				}
				helper(fileJson, termsJson, defJson, ccode, syns);
			}

		}

	});
	//build suggestion index
	let suggestionBody = [];
	// typeahed suggestions for NCIt Codes.
	if (ccode) {
		for (let key in ccode) {
			for (let ncit_value in ccode[key]) {
				let ncit_code = ccode[key][ncit_value];
				if(ncit_code !== ""){
					let em = ncit_code.toString().trim().toLowerCase();
					if(em in allTerm) {
						//if exist, then check if have the same type
						let t = allTerm[em];
						if (t.indexOf("n") == -1) {
							t.push("n");
						}
					} else {
						let t = [];
						t.push("n");
						allTerm[em] = t;
					}
				}
			}
		}
	}
	// typeahead for ICDO3 codes
	if(gdc_values){
		for(let key in gdc_values){
			gdc_values[key].forEach(values => {
				let icdo3_code = values.i_c;
				let ncit_code = values.n_c;
				if(icdo3_code !== ""){
					let em = icdo3_code.toString().trim().toLowerCase();
					if(em in allTerm) {
						//if exist, then check if have the same type
						let t = allTerm[em];
						if (t.indexOf("i") == -1) {
							t.push("i");
						}
					} else {
						let t = [];
						t.push("i");
						allTerm[em] = t;
					}
				}
				if(ncit_code !== ""){
					let em = ncit_code.toString().trim().toLowerCase();
					if(em in allTerm) {
						//if exist, then check if have the same type
						let t = allTerm[em];
						if (t.indexOf("n") == -1) {
							t.push("n");
						}
					} else {
						let t = [];
						t.push("n");
						allTerm[em] = t;
					}
				}
			});
		}

	}
	for (var term in allTerm) {
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
	let gdc_data = {};
	let folderPath_gdcdata = path.join(__dirname, '..', 'data');
	fs.readdirSync(folderPath_gdcdata).forEach(file => {
		gdc_data[file.replace('.yaml', '')] = yaml.load(folderPath_gdcdata + '/' + file);
	});
	gdc_data = report.preProcess(searchable_nodes, gdc_data);
	allProperties.forEach(function (p) {
		let node = p.node;
		let property = p.name;
		if (gdc_data[node] && gdc_data[node].properties && gdc_data[node].properties[property] && gdc_data[node].properties[property].enum) {
			if (p.enum) {
				p.enum.forEach(function (em) {
					if (gdc_data[node].properties[property].enum.indexOf(em.n) !== -1) {
						em.gdc_d = true;
					} else {
						em.gdc_d = false;
					}
				});
			}
		}
	});
	allProperties.forEach(function (ap) {
		// if (ap.cde && ap.desc) { // ADD CDE ID to all property description.
		// 	ap.desc = ap.desc + " (CDE ID - " + ap.cde.id + ")"
		// }
		let doc = extend(ap, {});
		doc.id = ap.name + "/" + ap.node + "/" + ap.category;
		propertyBody.push({
			index: {
				_index: config.index_p,
				_type: 'props',
				_id: doc.id
			}
		});
		propertyBody.push(doc);
	});
	esClient.bulk({
		body: propertyBody
	}, function (err_p, data_p) {
		if (err_p) {
			return next(err_p);
		}
		let errorCount_p = 0;
		data_p.items.forEach(item => {
			if (item.index && item.index.error) {
				logger.error(++errorCount_p, item.index.error);
			}
		});
		esClient.bulk({
			body: suggestionBody
		}, function (err_s, data_s) {
			if (err_s) {
				return next(err_s);
			}
			let errorCount_s = 0;
			data_s.items.forEach(itm => {
				if (itm.index && itm.index.error) {
					logger.error(++errorCount_s, itm.index.error);
				}
			});
			next({
				property_indexed: (propertyBody.length - errorCount_p),
				property_total: propertyBody.length,
				suggestion_indexed: (suggestionBody.length - errorCount_s),
				suggestion_total: suggestionBody.length
			});
		});
	});

}

exports.bulkIndex = bulkIndex;

function query(index, dsl, highlight, next) {
	var body = {
		size: 1000,
		from: 0
	};
	body.query = dsl;
	if (highlight) {
		body.highlight = highlight;
	}
	body.sort = [{
		"category": "asc"
	}, {
		"node": "asc"
	}];
	esClient.search({
		index: index,
		body: body
	}, function (err, data) {
		if (err) {
			logger.error(err);
			next(err);
		} else {
			next(data);
		}
	});
}

exports.query = query;


function suggest(index, suggest, next) {
	let body = {};
	body.suggest = suggest;
	esClient.search({
		index: index,
		"_source": true,
		body: body
	}, function (err, data) {
		if (err) {
			logger.error(err);
			next(err);
		} else {
			next(data);
		}
	});
}

exports.suggest = suggest;

function createIndexes(params, next) {
	esClient.indices.create(params[0], function (err_2, result_2) {
		if (err_2) {
			logger.error(err_2);
			next(err_2);
		} else {
			esClient.indices.create(params[1], function (err_3, result_3) {
				if (err_3) {
					logger.error(err_3);
					next(err_3);
				} else {
					logger.debug("have built property and suggestion indexes.");
					next(result_3);
				}
			});
		}
	});
}

exports.createIndexes = createIndexes;

function preloadDataFromCaDSR(next) {
	let folderPath = path.join(__dirname, '..', 'data');
	let termsJson = yaml.load(folderPath + '/_terms.yaml');
	let content_1 = fs.readFileSync("./server/data_files/cdeData.js").toString();
	content_1 = content_1.replace(/}{/g, ",");
	let cdeDataJson;
	if (content_1) {
		cdeDataJson = JSON.parse(content_1);
	}

	let ids = [];
	for (var term in termsJson) {
		let detail = termsJson[term];
		if (detail.termDef !== undefined && detail.termDef.source !== undefined && detail.termDef.source === 'caDSR') {
			if (!cdeDataJson && detail.termDef.cde_id !== undefined) {
				ids.push(detail.termDef.cde_id);
			} else if (detail.termDef.cde_id !== undefined && !(detail.termDef.cde_id in cdeDataJson)) {
				ids.push(detail.termDef.cde_id);
			}
		}
	}
	logger.debug(ids);
	if (ids.length > 0) {
		caDSR.loadData(ids, function (data) {
			return next(data);
		});
	} else {
		return next('CDE data Refreshed!!');
	}

	// next(1);
}

exports.preloadDataFromCaDSR = preloadDataFromCaDSR;

function preloadDataTypeFromCaDSR(next) {
	let content_1 = fs.readFileSync("./server/data_files/cdeData.js").toString();
	content_1 = content_1.replace(/}{/g, ",");
	let cdeDataJson = JSON.parse(content_1);
	let ids = [];
	for (var term in cdeDataJson) {
		let detail = cdeDataJson[term];
		if (detail.length == 0) {
			ids.push(term);
		}
	}
	if (ids.length > 0) {
		caDSR.loadDataType(ids, function (data) {
			return next(data);
		});
	} else {
		return next('CDE data Refreshed!!');
	}
}

exports.preloadDataTypeFromCaDSR = preloadDataTypeFromCaDSR;

function loadSynonyms(next) {
	caDSR.loadSynonyms(function (data) {
		return next(data);
	});
}

exports.loadSynonyms = loadSynonyms;

function loadSynonyms_continue(next) {
	caDSR.loadNcitSynonyms_continue(function (data) {
		return next(data);
	});
}

exports.loadSynonyms_continue = loadSynonyms_continue;

function loadSynonymsCtcae(next) {
	caDSR.loadSynonymsCtcae(function (data) {
		return next(data);
	});
}

exports.loadSynonymsCtcae = loadSynonymsCtcae;

function loadCtcaeSynonyms_continue(next) {
	caDSR.loadCtcaeSynonyms_continue(function (data) {
		return next(data);
	});
}

exports.loadCtcaeSynonyms_continue = loadCtcaeSynonyms_continue;