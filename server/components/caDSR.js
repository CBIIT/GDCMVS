/**
 * loading data from caDSR into local, and write into file.
 * including load synonmys data from NCIt
 */
'use strict';

const fs = require('fs');
const https = require('https');
const fetch = require('node-fetch');
const config = require('../config');
const logger = require('./logger');
const shared = require('../service/search/shared');
var datas = {};
var syns = {};

const loadData = (ids, next) => {
	if (ids.length > 0) {
		logger.debug(ids.length);
		let ncitids = [];
		let count = 0,
			has = 0;
		ids.forEach(uid => {
			logger.debug("request:" + config.caDSR_url[0] + uid);
			https.get(config.caDSR_url[0] + uid, (response) => {
				let info = '';
				response.on('data', (d) => {
					info += d;
				});
				response.on('end', () => {
					let parsed = JSON.parse(info);
					if (parsed.length > 0) {
						https.get(config.caDSR_url[1] + parsed[0].deIdseq, (result) => {
							let body = '';
							result.on('data', (r) => {
								body += r;
							});
							result.on('end', () => {
								let b = JSON.parse(body);
								let pvs = b.valueDomain.permissibleValues;
								let data = [];
								pvs.forEach(pv => {
									let value = {};
									value.pv = pv.value;
									value.pvm = pv.shortMeaning;
									value.pvc = pv.conceptCode;
									value.pvd = pv.vmDescription;
									if (value.pvc !== null) {
										value.pvc = value.pvc.replace('c', 'C');
										// value.pvc = value.pvc.replace("C00", 'C');
										// value.pvc = value.pvc.replace("C0", 'C');
									}
									//prepare to get synonyms from NCIt
									if (value.pvc !== null) {
										if (value.pvc.indexOf(':') >= 0) {
											let cs = value.pvc.split(":");
											logger.debug("get synonyms for :" + cs);
											cs.forEach(c => {
												if (ncitids.indexOf(c) === -1) {
													ncitids.push(c);
												}
											});
										} else {
											if (ncitids.indexOf(value.pvc) === -1) {
												ncitids.push(value.pvc);
											}
										}
									}
									data.push(value);
								});
								//datas[uid] = data;
								//save to local
								let str = {};
								str[uid] = data;
								fs.appendFileSync("./server/data_files/cdeData.js", JSON.stringify(str), err => {
									if (err) return logger.error(err);
									logger.debug(" " + data.length + " PVs for caDSR :" + uid);
								});
								count++;
								logger.debug("finished number:" + count);
								if (count == ids.length) {
									next('CDE data Refreshed!!');
								} else {
									next("finished number: " + count + " of " + ids.length + "\n");
								}

							});
						}).on('error', (e) => {
							logger.error(e);
						});
					}

				});

			}).on('error', (e) => {
				logger.error(e);
			});

		});
	}

};

const loadDataType = (ids, next)  => {
	let count = 0;
	if (ids.length > 0) {
		logger.debug(ids.length);
		ids.forEach(uid => {
			https.get(config.caDSR_url[0] + uid, (response) => {
				let info = '';
				response.on('data', (d) => {
					info += d;
				});
				response.on('end', () => {
					let parsed = JSON.parse(info);
					if (parsed.length > 0) {
						https.get(config.caDSR_url[1] + parsed[0].deIdseq, (result) => {
							let body = '';
							result.on('data', (r) => {
								body += r;
							});
							result.on('end', () => {
								let b = JSON.parse(body);
								let dataType = b.valueDomain.valueDomainDetails.dataType;
								let str = {};
								str[uid] = dataType;
								logger.debug("save to file:" + uid);
								fs.appendFile("./server/data_files/cdeDataType.js", JSON.stringify(str), err => {
									if (err) return logger.error(err);
									logger.debug(" dataType for caDSR (" + uid + ") :" + dataType);
								});
								count++;
								if (count == ids.length) {
									next('CDE data Refreshed!!');
								} else {
									next("finished number: " + count + " of " + ids.length + "\n");
								}
							});
						}).on('error', (e) => {
							logger.error(e);
						});
					}

				});

			}).on('error', (e) => {
				logger.error(e);
			});

		});
	}
};

const loadSynonyms = next => {
	let ncitids = [];
	//load concept codes
	let concept = shared.readConceptCode();
	//load ICD-0 codes
	let icdo = shared.readGDCValues();
	for (let cc in concept) {
		let dict = concept[cc];
		for (let v in dict) {
			if (dict[v] !== "" && ncitids.indexOf(dict[v]) == -1) {
				ncitids.push(dict[v]);
			}
		}
	}
	for (let ic in icdo) {
		let arr = icdo[ic];
		arr.forEach(dict => {
			if (dict.n_c !== "" && ncitids.indexOf(dict.n_c) == -1) {
				ncitids.push(dict.n_c);
			}
		});
	}
	let ncit = [];

	ncitids.forEach(id => {
		if (ncit.indexOf(id) === -1) {
			ncit.push(id);
		}
	});
	//get data
	if(ncit.length > 0){
		fs.truncate('./server/data_files/ncit_details.js', 0, () => {
			console.log('ncit_details.js truncated')
		});
		// let new_ncit = spliceArray(ncit, 1000);
		synchronziedLoadSynonmysfromNCIT(ncit, 0, data => {
			return next(data);
		});
	}else{
		logger.debug('Already up to date');
		return next('Success');
	}
};

const loadNcitSynonyms_continue = next => {
	let ncitids = [];
	let synonyms = shared.readNCItDetails();
	//load concept codes
	let cc = shared.readConceptCode();
	let gdc_values = shared.readGDCValues();
	for (let c in cc) {
		let vs = cc[c];
		for (let v in vs) {
			let code = vs[v];
			if (code !== "" && ncitids.indexOf(code) == -1) {
				ncitids.push(code);
			}
		}
	}
	for(let cnp in gdc_values){
		let enums = gdc_values[cnp];
		enums.forEach(em => {
			let n_c = em.n_c;
			if(ncitids.indexOf(n_c) === -1){
				ncitids.push(n_c);
			}
		});
	}
	let ncit = [];
	ncitids.forEach(id => {
		if (Array.isArray(id)) {
			id.forEach((id) => {
				if (!(id in synonyms)) {
					if (id.indexOf('E') === -1) {
						ncit.push(id);
					}
				} else {
					logger.debug("in the synonyms:" + id);
				}
			});
		} else {
			if (!(id in synonyms)) {
				if (id.indexOf('E') === -1) {
					ncit.push(id);
				}
			} else {
				logger.debug("in the synonyms:" + id);
			}
		}
	});
	if(ncit.length > 0){
		synchronziedLoadSynonmysfromNCIT(ncit, 0, data => {
			return next(data);
		});
	}else{
		logger.debug('Already up to date');
		return next('Success');
	}
};

const spliceArray = (inputArray, chunkSize) => {
	var R = [];
  for (var i=0,len=inputArray.length; i<len; i+=chunkSize)
    R.push(inputArray.slice(i,i+chunkSize));
  return R;
}

const getDataURL = async url => {
	try {
	  const response = await fetch(url);
	  const json = await response.json();
	  return json;
	} catch (error) {
	  console.log(error);
	}
  };

const synchronziedLoadSynonmysfromNCITTEST = (ncitids, idx, next) => {
	if (idx >= ncitids.length) {
		return;
	}
	// let syn = [];
	let param = "";
	ncitids[idx].forEach((n_c, index) => {
		if(index === 0) param += n_c;
		if(index !== 0) param += ","+n_c;
	});
	let response = getDataURL(config.NCIt_url[5] + param);
	response.then(data => {
		console.log(data);
		idx++;
		synchronziedLoadSynonmysfromNCITTEST(ncitids, idx, next);
	}).catch(err => {
		console.log(err);
	});
};

const synchronziedLoadSynonmysfromNCIT = (ncitids, idx, next) => {
	if (idx >= ncitids.length) {
		return;
	}
	let syn = [];
	https.get(config.NCIt_url[4] + ncitids[idx], (rsp) => {
		let html = '';
		rsp.on('data', (dt) => {
			html += dt;
		});
		rsp.on('end', () => {
			if (html.trim() !== '') {
				let d = JSON.parse(html);
				if (d.synonyms !== undefined) {
					let tmp = {}
					tmp[ncitids[idx]] = {};
					tmp[ncitids[idx]].preferredName = d.preferredName;
					tmp[ncitids[idx]].code = d.code;
					tmp[ncitids[idx]].definitions = d.definitions;
					tmp[ncitids[idx]].synonyms = [];
					let checker_arr = [];
					d.synonyms.forEach(data => {
						if(checker_arr.indexOf((data.termName+"@#$"+data.termGroup+"@#$"+data.termSource).trim().toLowerCase()) !== -1) return;
						let obj = {};
						obj.termName = data.termName;
						obj.termGroup = data.termGroup;
						obj.termSource = data.termSource;
						tmp[ncitids[idx]].synonyms.push(obj);
						checker_arr.push((data.termName+"@#$"+data.termGroup+"@#$"+data.termSource).trim().toLowerCase());
					});
					if (d.additionalProperties !== undefined) {
						tmp[ncitids[idx]].additionalProperties = [];
						d.additionalProperties.forEach(data => {
							let obj = {};
							obj.name = data.name;
							obj.value = data.value;
							tmp[ncitids[idx]].additionalProperties.push(obj);
						});
					}
					let str = {};
					str[ncitids[idx]] = syns;
					fs.appendFile("./server/data_files/ncit_details.js", JSON.stringify(tmp), err => {
						if (err) return logger.error(err);
					});
				} else {
					logger.debug("!!!!!!!!!!!! no synonyms for " + ncitids[idx]);
				}

			}
			syns[ncitids[idx]] = syn;
			idx++;
			synchronziedLoadSynonmysfromNCIT(ncitids, idx, next);
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

const loadSynonymsCtcae = next => {
	let ncitids = [];
	//load cde ncit codes
	let cde = shared.readCDEData();
	//load concept codes
	let concept = shared.readConceptCode();
	//load ICD-0 codes
	let icdo = shared.readGDCValues();
	for (let c in cde) {
		let arr = cde[c];
		if (arr.length !== 0) {
			arr.forEach(pv => {
				if (pv.pvc && pv.pvc !== "") {
					if (pv.pvc.indexOf(':') >= 0) {
						let cs = pv.pvc.split(":");
						cs.forEach(c => {
							if (ncitids.indexOf(c) === -1) {
								ncitids.push(c);
							}
						});
					} else {
						if (ncitids.indexOf(pv.pvc) === -1) {
							ncitids.push(pv.pvc);
						}
					}
				}
			});
		}
	}
	for (let cc in concept) {
		let dict = concept[cc];
		for (let v in dict) {
			if (dict[v] !== "" && ncitids.indexOf(dict[v]) == -1) {
				ncitids.push(dict[v]);
			}
		}
	}
	for (let ic in icdo) {
		let arr = icdo[ic];
		arr.forEach(dict => {
			if (dict.n_c !== "" && ncitids.indexOf(dict.n_c) == -1) {
				ncitids.push(dict.n_c);
			}
		});
	}
	let ctcae = [];

	ncitids.forEach(id => {
		if (id.indexOf('E') >= 0) {
			ctcae.push(id);
		}
	});

	if (ctcae.length > 0) {
		fs.truncate('./server/data_files/synonyms_ctcae.js', 0, () => {
			console.log('synonyms_ctcae.js truncated')
		});
		logger.debug(ctcae);
		synchronziedLoadSynonmysfromCTCAE(ctcae, 0, data => {
			return next(data);
		});
	} else {
		logger.debug('Already up to date');
		return next('Success');
	}
};

const loadCtcaeSynonyms_continue = next => {
	let ncitids = [];
	let synonyms = shared.readSynonyms();
	//load concept codes
	let cc = shared.readConceptCode();
	for (let c in cc) {
		let vs = cc[c];
		for (let v in vs) {
			let code = vs[v];
			if (code !== "" && ncitids.indexOf(code) == -1) {
				ncitids.push(code);
			}
		}

	}
	let ctcae = [];
	ncitids.forEach(id => {
		if (!(id in synonyms)) {
			if (id.indexOf('E') >= 0) {
				ctcae.push(id);
			}
		}
	});

	if (ctcae.length > 0) {
		logger.debug(ctcae);
		synchronziedLoadSynonmysfromCTCAE(ctcae, 0, data => {
			return next(data);
		});
	} else {
		logger.debug('Already up to date');
		return next('Success');
	}
};

const synchronziedLoadSynonmysfromCTCAE = (ids, idx, next) => {
	if (idx >= ids.length) {
		return;
	}
	logger.debug("searching synonyms using CTCAE code (#" + idx + ") total = " + ids.length + ": " + ids[idx]);

	let syn = [];
	https.get(config.NCIt_url[3] + ids[idx], (rsp) => {
		let html = '';
		rsp.on('data', (dt) => {
			html += dt;
		});
		rsp.on('end', () => {
			if (html.trim() !== '') {
				let sub = html;
				let index = 0;
				let pool = [];
				while (true) {
					index = sub.indexOf("<td class=\"dataCellText\" scope=\"row\">");
					if (index === -1) {
						break;
					}
					sub = sub.substr(index + 37);
					index = sub.indexOf("</td>");
					if (index !== -1) {
						let s = sub.substr(0, index).trim();
						s = decodeHtmlEntity(s);
						if (pool.indexOf(s) === -1) {
							pool.push(s);
							syn.push(s);
						}
						sub = sub.substr(index + 5);
					} else {
						break;
					}
				}
				if (syn.length > 0) {
					let str = {};
					str[ids[idx]] = syn;
					fs.appendFile("./server/data_files/synonyms_ctcae.js", JSON.stringify(str), err => {
						if (err) return logger.error(err);
					});
				} else {
					logger.debug("!!!!!!!!!!!! no synonyms for " + ids[idx]);
				}

			}
			syns[ids[idx]] = syn;
			idx++;
			synchronziedLoadSynonmysfromCTCAE(ids, idx, next);
			if (ids.length == idx) {
				return next('Success');
			} else {
				return next("CTCAE finished number: " + idx + " of " + ids.length + "\n");
			}
		});

	}).on('error', (e) => {
		logger.debug(e);
	});
};

const decodeHtmlEntity = str => {
	return str.replace(/&#(\d+);/g, (match, dec) => {
		return String.fromCharCode(dec);
	});
};

const getData = () => {
	return datas;
};


const getSynonyms = () => {
	return syns;
};

module.exports = {
	loadData,
	loadDataType,
	loadSynonyms,
	loadSynonymsCtcae,
	loadNcitSynonyms_continue,
	loadCtcaeSynonyms_continue,
	getData,
	getSynonyms
};
