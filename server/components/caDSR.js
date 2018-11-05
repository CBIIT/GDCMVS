/**
 * loading data from caDSR into local, and write into file.
 * including load synonmys data from NCIt
 */
'use strict';

var fs = require('fs');
var https = require('https');
var http = require('http');
var config = require('../config');
var logger = require('./logger');
var datas = {};
var syns = {};

var loadData = function (ids, next) {
	if (ids.length > 0) {
		logger.debug(ids.length);
		let ncitids = [];
		let count = 0,
			has = 0;
		ids.forEach(function (uid) {
			logger.debug("request:" + config.caDSR_url[0] + uid);
			https.get(config.caDSR_url[0] + uid, (response) => {
				let info = '';
				response.on('data', (d) => {
					info += d;
				});
				response.on('end', function () {
					let parsed = JSON.parse(info);
					if (parsed.length > 0) {
						https.get(config.caDSR_url[1] + parsed[0].deIdseq, (result) => {
							let body = '';
							result.on('data', (r) => {
								body += r;
							});
							result.on('end', function () {
								let b = JSON.parse(body);
								let pvs = b.valueDomain.permissibleValues;
								let data = [];
								pvs.forEach(function (pv) {
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
											cs.forEach(function (c) {
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
								fs.appendFileSync("./server/data_files/cdeData.js", JSON.stringify(str), function (err) {
									if (err) {
										return logger.error(err);
									}

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

var loadDataType = function (ids, next) {
	let count = 0;
	if (ids.length > 0) {
		logger.debug(ids.length);
		ids.forEach(function (uid) {
			https.get(config.caDSR_url[0] + uid, (response) => {
				let info = '';
				response.on('data', (d) => {
					info += d;
				});
				response.on('end', function () {
					let parsed = JSON.parse(info);
					if (parsed.length > 0) {
						https.get(config.caDSR_url[1] + parsed[0].deIdseq, (result) => {
							let body = '';
							result.on('data', (r) => {
								body += r;
							});
							result.on('end', function () {
								let b = JSON.parse(body);
								let dataType = b.valueDomain.valueDomainDetails.dataType;
								let str = {};
								str[uid] = dataType;
								logger.debug("save to file:" + uid);
								fs.appendFile("./server/data_files/cdeDataType.js", JSON.stringify(str), function (err) {
									if (err) {
										return logger.error(err);
									}

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


var loadSynonyms = function (next) {
	let ncitids = [];
	//load cde ncit codes
	let cdeData = fs.readFileSync("./server/data_files/cdeData.js").toString();
	cdeData = cdeData.replace(/}{/g, ",");
	let cde = JSON.parse(cdeData);
	//load concept codes
	let conceptCode = fs.readFileSync("./server/data_files/conceptCode.js").toString();
	let concept = JSON.parse(conceptCode);
	//load ICD-0 codes
	let gdcValues = fs.readFileSync("./server/data_files/gdc_values.js").toString();
	let icdo = JSON.parse(gdcValues);
	for (let c in cde) {
		let arr = cde[c];
		if (arr.length !== 0) {
			arr.forEach(function (pv) {
				if (pv.pvc && pv.pvc !== "") {
					if (pv.pvc.indexOf(':') >= 0) {
						let cs = pv.pvc.split(":");
						cs.forEach(function (c) {
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
		arr.forEach(function (dict) {
			if (dict.n_c !== "" && ncitids.indexOf(dict.n_c) == -1) {
				ncitids.push(dict.n_c);
			}
		});

	}
	let ncit = [];
	let ctcae = [];

	ncitids.forEach(function (id) {
		if (id.indexOf('E') >= 0) {
			ctcae.push(id);
		} else {
			ncit.push(id);
		}
	});
	//get data
	if(ncit.length > 0){
		fs.truncate('./server/data_files/synonyms_ncit.js', 0, function () {
			console.log('synonyms_ncit.js truncated')
		});
		synchronziedLoadSynonmysfromNCIT(ncit, 0, function (data) {
			return next(data);
		});
	}else{
		logger.debug('Already up to date');
		return next('Success');
	}

};

var loadSynonymsCtcae = function (next) {
	let ncitids = [];
	//load cde ncit codes
	let cdeData = fs.readFileSync("./server/data_files/cdeData.js").toString();
	cdeData = cdeData.replace(/}{/g, ",");
	let cde = JSON.parse(cdeData);
	//load concept codes
	let conceptCode = fs.readFileSync("./server/data_files/conceptCode.js").toString();
	let concept = JSON.parse(conceptCode);
	//load ICD-0 codes
	let gdcValues = fs.readFileSync("./server/data_files/gdc_values.js").toString();
	let icdo = JSON.parse(gdcValues);
	for (let c in cde) {
		let arr = cde[c];
		if (arr.length !== 0) {
			arr.forEach(function (pv) {
				if (pv.pvc && pv.pvc !== "") {
					if (pv.pvc.indexOf(':') >= 0) {
						let cs = pv.pvc.split(":");
						cs.forEach(function (c) {
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
		arr.forEach(function (dict) {
			if (dict.n_c !== "" && ncitids.indexOf(dict.n_c) == -1) {
				ncitids.push(dict.n_c);
			}
		});

	}
	let ncit = [];
	let ctcae = [];

	ncitids.forEach(function (id) {
		if (id.indexOf('E') >= 0) {
			ctcae.push(id);
		} else {
			ncit.push(id);
		}
	});

	if (ctcae.length > 0) {
		fs.truncate('./server/data_files/synonyms_ctcae.js', 0, function () {
			console.log('synonyms_ctcae.js truncated')
		});
		logger.debug(ctcae);
		synchronziedLoadSynonmysfromCTCAE(ctcae, 0, function (data) {
			return next(data);
		});
	} else {
		logger.debug('Already up to date');
		return next('Success');
	}
};

var loadNcitSynonyms_continue = function (next) {
	let ncitids = [];
	let content_2 = fs.readFileSync("./server/data_files/synonyms.js").toString();
	content_2 = content_2.replace(/}{/g, ",");
	let synonyms = JSON.parse(content_2);
	//load concept codes
	let conceptCode = fs.readFileSync("./server/data_files/conceptCode.js").toString();
	let cc = JSON.parse(conceptCode);
	for (let c in cc) {
		let vs = cc[c];
		for (let v in vs) {
			let code = vs[v];
			if (code !== "" && ncitids.indexOf(code) == -1) {
				ncitids.push(code);
			}
		}

	}
	let ncit = [];
	let ctcae = [];
	ncitids.forEach(function (id) {
		if (!(id in synonyms)) {
			if (id.indexOf('E') >= 0) {
				ctcae.push(id);
			} else {
				ncit.push(id);
			}
		} else {
			logger.debug("in the synonyms:" + id);
		}
	});
	logger.debug(ncit);
	logger.debug("length of NCIt codes: " + ncit.length);
	if(ncit.length > 0){
		synchronziedLoadSynonmysfromNCIT(ncit, 0, function (data) {
			return next(data);
		});
	}else{
		logger.debug('Already up to date');
		return next('Success');
	}
};

var loadCtcaeSynonyms_continue = function (next) {
	let ncitids = [];
	let content_2 = fs.readFileSync("./server/data_files/synonyms.js").toString();
	content_2 = content_2.replace(/}{/g, ",");
	let synonyms = JSON.parse(content_2);
	//load concept codes
	let conceptCode = fs.readFileSync("./server/data_files/conceptCode.js").toString();
	let cc = JSON.parse(conceptCode);
	for (let c in cc) {
		let vs = cc[c];
		for (let v in vs) {
			let code = vs[v];
			if (code !== "" && ncitids.indexOf(code) == -1) {
				ncitids.push(code);
			}
		}

	}
	let ncit = [];
	let ctcae = [];
	ncitids.forEach(function (id) {
		if (!(id in synonyms)) {
			if (id.indexOf('E') >= 0) {
				ctcae.push(id);
			} else {
				ncit.push(id);
			}
		}
	});

	if (ctcae.length > 0) {
		logger.debug(ctcae);
		synchronziedLoadSynonmysfromCTCAE(ctcae, 0, function (data) {
			return next(data);
		});
	} else {
		logger.debug('Already up to date');
		return next('Success');
	}
};


var synchronziedLoadSynonmysfromNCIT = function (ncitids, idx, next) {
	if (idx >= ncitids.length) {
		return;
	}
	logger.debug("searching synonyms using NCIT code (#" + idx + "): total = " + ncitids.length + ": " + ncitids[idx]);
	let syn = [];
	https.get(config.NCIt_url[4] + ncitids[idx], (rsp) => {
		let html = '';
		rsp.on('data', (dt) => {
			html += dt;
		});
		rsp.on('end', function () {
			if (html.trim() !== '') {
				let d = JSON.parse(html);
				if (d.synonyms !== undefined) {
					let syns = d.synonyms;
					let pool = [];
					syns.forEach(function (s) {
						if (pool.indexOf(s.termName) === -1) {
							pool.push(s.termName);
							syn.push(s.termName);
						}
					});
					let str = {};
					str[ncitids[idx]] = syn;
					fs.appendFile("./server/data_files/synonyms_ncit.js", JSON.stringify(str), function (err) {
						if (err) {
							return logger.error(err);
						}

						logger.debug("#########synonyms for " + ncitids[idx] + ": " + syn.toString());
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

var synchronziedLoadSynonmysfromCTCAE = function (ids, idx, next) {
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
		rsp.on('end', function () {
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
					fs.appendFile("./server/data_files/synonyms_ctcae.js", JSON.stringify(str), function (err) {
						if (err) {
							return logger.error(err);
						}

						logger.debug("#########synonyms for " + ids[idx] + ": " + syn.toString());
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

var decodeHtmlEntity = function (str) {
	return str.replace(/&#(\d+);/g, function (match, dec) {
		return String.fromCharCode(dec);
	});
};

var getData = function () {
	return datas;
};


var getSynonyms = function () {
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