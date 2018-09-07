'use strict';

var elastic = require('../../components/elasticsearch');
var handleError = require('../../components/handleError');
var config = require('../../config');
var fs = require('fs');
var path = require('path');
var yaml = require('yamljs');
const excel = require('node-excel-export');
var _ = require('lodash');

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

	let ICDO3_content = fs.readFileSync("./server/data_files/gdc_values.js").toString();
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
	let content_1 = fs.readFileSync("./server/data_files/conceptCode.js").toString();
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
	let folderPath = path.join(__dirname, '../..', 'data');
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
var export2Excel = function (req, res) {
	let deprecated_properties = [];
	let deprecated_enum = [];
	var folderPath = path.join(__dirname, '..', '..', 'data');
	fs.readdirSync(folderPath).forEach(file => {
		if (file.indexOf('_') !== 0) {
			let fileJson = yaml.load(folderPath + '/' + file);
			let category = fileJson.category;
			let node = fileJson.id;

			if (fileJson.deprecated) {
				fileJson.deprecated.forEach(function (d_p) {
					let tmp_d_p = category + "." + node + "." + d_p;
					deprecated_properties.push(tmp_d_p);
				})
			}

			for (let keys in fileJson.properties) {
				if (fileJson.properties[keys].deprecated_enum) {
					fileJson.properties[keys].deprecated_enum.forEach(function (d_e) {
						let tmp_d_e = category + "." + node + "." + keys + "." + d_e;
						deprecated_enum.push(tmp_d_e);
					});
				}
			}
		}
	});
	let pv = fs.readFileSync("./server/data_files/ncit_details.js").toString();
	pv = pv.replace(/}{/g, ",");
	let ncit_pv = JSON.parse(pv);
	let cdeData = fs.readFileSync("./server/data_files/cdeData.js").toString();
	cdeData = cdeData.replace(/}{/g, ",");
	let file_cde = JSON.parse(cdeData);
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
			let vs = entry._source.enum;
			if (vs) {
				let cde = entry._source.cde;
				let cde_pv = entry._source.cde_pv;
				if (cde && cde_pv) {
					let common_values = [];
					vs.forEach(function (v) {
						cde_pv.forEach(function (cpv) {
							if (v.n.trim().toLowerCase() == cpv.n.trim().toLowerCase()) {
								let c_n_p = entry._source.category + "." + entry._source.node + "." + entry._source.name;
								let c_vs = entry._source.category + "." + entry._source.node + "." + entry._source.name + "." + v.n;

								if (deprecated_properties.indexOf(c_n_p) == -1 && deprecated_enum.indexOf(c_vs) == -1) {
									let c_vs = entry._source.category + "." + entry._source.node + "." + entry._source.name + "." + v.n;
									common_values.push(c_vs.trim().toLowerCase());
									let tmp = {};
									tmp.c = entry._source.category;
									tmp.n = entry._source.node;
									tmp.p = entry._source.name;
									tmp.gdc_v = v.n;
									if (v.n_c) {
										tmp.ncit_v = ncit_pv[v.n_c].preferredName;
										tmp.ncit_cc = v.n_c;
									} else {
										tmp.ncit_v = "";
										tmp.ncit_cc = "";
									}
									tmp.cpv = cpv.m;
									let all_cpvc = "";
									if (cpv.ss.length > 0) {
										for (let tmp_index in cpv.ss) {
											if (tmp_index == 0) {
												all_cpvc = all_cpvc + cpv.ss[tmp_index].c;
											} else {
												all_cpvc = all_cpvc + ":" + cpv.ss[tmp_index].c;
											}
										}
									} else {
										if (file_cde[cde.id]) {
											file_cde[cde.id].forEach(function (cde_pvs) {
												if (cde_pvs.pv === tmp.gdc_v) {
													all_cpvc = all_cpvc + cde_pvs.pvc;
												}
											});
										}
									}
									tmp.cpvc = all_cpvc;
									tmp.cid = cde.id;
									ds.push(tmp);
								}
							}
						});
					});

					vs.forEach(function (v) {
						let c_n_p = entry._source.category + "." + entry._source.node + "." + entry._source.name;
						let c_vs = entry._source.category + "." + entry._source.node + "." + entry._source.name + "." + v.n;
						if (deprecated_properties.indexOf(c_n_p) == -1 && deprecated_enum.indexOf(c_vs) == -1) {
							if (common_values.indexOf(c_vs.trim().toLowerCase()) == -1) {
								let tmp = {};
								tmp.c = entry._source.category;
								tmp.n = entry._source.node;
								tmp.p = entry._source.name;
								tmp.gdc_v = v.n;
								if (v.n_c) {
									tmp.ncit_v = ncit_pv[v.n_c].preferredName;
									tmp.ncit_cc = v.n_c;
								} else {
									tmp.ncit_v = "";
									tmp.ncit_cc = "";
								}
								tmp.cpv = "";
								tmp.cpvc = "";
								tmp.cid = cde.id;
								ds.push(tmp);
							}
						}
					});
					cde_pv.forEach(function (cpv) {
						let c_n_p = entry._source.category + "." + entry._source.node + "." + entry._source.name;
						let c_vs = entry._source.category + "." + entry._source.node + "." + entry._source.name + "." + cpv.n;
						if (deprecated_properties.indexOf(c_n_p) == -1 && deprecated_enum.indexOf(c_vs) == -1) {
							if (common_values.indexOf(c_vs.trim().toLowerCase()) == -1) {
								let tmp = {};
								tmp.c = entry._source.category;
								tmp.n = entry._source.node;
								tmp.p = entry._source.name;
								//Fix this Part
								tmp.gdc_v = "";
								tmp.gdc_v1 = cpv.n;
								tmp.ncit_v = "";
								tmp.ncit_cc = "";
								tmp.cpv = cpv.m;
								let all_cpvc = "";
								if (cpv.ss.length > 0) {
									for (let tmp_index in cpv.ss) {
										if (tmp_index == 0) {
											all_cpvc = all_cpvc + cpv.ss[tmp_index].c;
										} else {
											all_cpvc = all_cpvc + ":" + cpv.ss[tmp_index].c;
										}
									}
								} else {
									if (file_cde[cde.id]) {
										file_cde[cde.id].forEach(function (cde_pvs) {
											if (cde_pvs.pv === tmp.gdc_v1) {
												all_cpvc = all_cpvc + cde_pvs.pvc;
											}
										});
									}
								}
								tmp.cpvc = all_cpvc;
								tmp.cid = cde.id;
								ds.push(tmp);
							}
						}
					});
				} else {
					vs.forEach(function (v) {
						let c_n_p = entry._source.category + "." + entry._source.node + "." + entry._source.name;
						let c_vs = entry._source.category + "." + entry._source.node + "." + entry._source.name + "." + v.n;
						if (deprecated_properties.indexOf(c_n_p) == -1 && deprecated_enum.indexOf(c_vs) == -1) {
							let tmp = {};
							tmp.c = entry._source.category;
							tmp.n = entry._source.node;
							tmp.p = entry._source.name;
							tmp.gdc_v = v.n;
							if (v.n_c) {
								tmp.ncit_v = ncit_pv[v.n_c].preferredName;
								tmp.ncit_cc = v.n_c;
							} else {
								tmp.ncit_v = "";
								tmp.ncit_cc = "";
							}
							tmp.cpv = "";
							tmp.cpvc = "";
							if (cde) {
								tmp.cid = cde.id;
							} else {
								tmp.cid = "";
							}
							ds.push(tmp);
						}
					})
				}
			}
		});
		let cnpv = [];
		let new_ds = [];

		for (let temp_data in ds) {
			let c_n_p_v = ds[temp_data].c + "." + ds[temp_data].n + "." + ds[temp_data].p + "." + ds[temp_data].gdc_v;
			if (cnpv.indexOf(c_n_p_v) == -1) {
				cnpv.push(c_n_p_v);
				new_ds.push(ds[temp_data]);
			}

		}
		let heading = [
			['Category', 'Node', 'Property', 'GDC Values', 'NCIt PV', 'NCIt Code', 'CDE PV Meaning', 'CDE PV Meaning concept codes', 'CDE ID']
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
			gdc_v: {
				width: 200
			},
			ncit_v: {
				width: 200
			},
			ncit_cc: {
				width: 200
			},
			cpv: {
				width: 200
			},
			cpvc: {
				width: 200
			},
			cid: {
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
					data: new_ds // <-- Report data 
				}
			]
		);
		res.attachment('Report-' + new Date() + '.xlsx'); // This is sails.js specific (in general you need to set headers) 
		res.send(report);
	});
};
var exportAllValues = function (req, res) {
	let merges = [];
	let data = [];
	let heading = [
		['Category', 'Node', 'Property', 'Value']
	];
	let searchable_nodes = ["case", "demographic", "diagnosis", "exposure", "family_history", "follow_up", "molecular_test", "treatment", "slide", "sample", "read_group", "portion", "analyte",
		"aliquot", "slide_image", "analysis_metadata", "clinical_supplement", "experiment_metadata", "pathology_report", "run_metadata", "biospecimen_supplement",
		"submitted_aligned_reads", "submitted_genomic_profile", "submitted_methylation_beta_value", "submitted_tangent_copy_number", "submitted_unaligned_reads"
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
		v: {
			width: 200
		}
	};
	let new_data = {};
	let folderPath = path.join(__dirname, '../..', 'data');
	fs.readdirSync(folderPath).forEach(file => {
		if (file.indexOf('_') !== 0) {
			new_data[file.replace('.yaml', '')] = yaml.load(folderPath + '/' + file);
		}
	});
	new_data = preProcess(searchable_nodes, new_data);
	for (let key in new_data){
		let category = new_data[key].category;
		let node = new_data[key].id;
		if(new_data[key].properties){
			let properties = new_data[key].properties
			for (let property in properties) {
				if(properties[property].enum && !properties[property].deprecated_enum){
					let enums = properties[property].enum;
					enums.forEach( function(em){
						let tmp_data = {};
						tmp_data.c = category;
						tmp_data.n = node;
						tmp_data.p = property;
						tmp_data.v = em;
						data.push(tmp_data);
					})
				}else if(properties[property].deprecated_enum && properties[property].new_enum){
					let enums = properties[property].new_enum;
					enums.forEach( function(em){
						let tmp_data = {};
						tmp_data.c = category;
						tmp_data.n = node;
						tmp_data.p = property;
						tmp_data.v = em;
						data.push(tmp_data);
					})
				}
			}
		}
	}

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
	res.attachment('All_Values.xlsx'); // This is sails.js specific (in general you need to set headers) 
	res.send(report);

};
var export_difference = function (req, res) {
	const styles = {
		headerDark: {
			fill: {
				fgColor: {
					rgb: '6969e1'
				}
			},
			font: {
				color: {
					rgb: 'FFFFFF'
				},
				sz: 13,
				bold: true
			}
		},
		cellYellow: {
			fill: {
				fgColor: {
					rgb: 'ffff99'
				}
			}
		},
		cellRed: {
			fill: {
				fgColor: {
					rgb: 'ff9999'
				}
			}
		}
	};
	let specification = {
		c: {
			width: 200,
			displayName: 'Category',
			headerStyle: styles.headerDark
		},
		n: {
			width: 200,
			displayName: 'Node',
			headerStyle: styles.headerDark
		},
		p: {
			width: 200,
			displayName: 'Property',
			headerStyle: styles.headerDark,
			cellStyle: function (value, row) {
				if (deprecated_properties.indexOf((row.c + '/' + row.n + '/' + row.p).toString()) !== -1) {
					return styles.cellRed;
				} else {
					return row.p
				}
			}
		},
		value_old: {
			width: 200,
			displayName: 'Old GDC Dcitonary Value',
			headerStyle: styles.headerDark,
			cellStyle: function (value, row) {
				if (row.value_old.toString() === 'no match') {
					return styles.cellYellow;
				} else {
					return row.value_old;
				}
			}
		},
		value_new: {
			width: 200,
			displayName: 'New GDC Dcitonary Value',
			headerStyle: styles.headerDark,
			cellStyle: function (value, row) {
				if (row.value_new.toString() === 'no match') {
					return styles.cellYellow;
				} else {
					for (let dv in deprecated_values) {
						let tmp_row = {};
						tmp_row.c = row.c;
						tmp_row.n = row.n;
						tmp_row.p = row.p;
						tmp_row.v = row.value_new.toLowerCase();
						if (JSON.stringify(deprecated_values[dv]) == JSON.stringify(tmp_row)) {
							return styles.cellRed;
						}
					}
					return row.value_new
				}
			}
		}
	};
	let merges = [];
	let data = [];
	let deprecated_properties = [];
	let deprecated_values = [];
	let folderPath = path.join(__dirname, '../..', 'data');
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
						if (props_old[tmp_new.deprecated[d]].enum) {
							props_old[tmp_new.deprecated[d]].enum.forEach(function (em) {
								let temp_data = {};
								temp_data.c = tmp_new.category;
								temp_data.n = tmp_new.id;
								temp_data.p = tmp_new.deprecated[d];
								temp_data.value_old = em;
								temp_data.value_new = "no match";
								deprecated_properties.push(temp_data.c + '/' + temp_data.n + '/' + temp_data.p);
								//data.push(temp_data);
							})
						}
					}
				}
				if (tmp_new.properties) {
					for (let property in tmp_new.properties) {
						if (tmp_new.properties[property].deprecated_enum) {
							let denums = tmp_new.properties[property].deprecated_enum;
							denums.forEach(function (denum) {
								let temp_data = {};
								temp_data.c = tmp_new.category;
								temp_data.n = tmp_new.id;
								temp_data.p = property;
								temp_data.v = denum.toLowerCase();
								deprecated_values.push(temp_data);
							});
						}
					}
				}

				for (let p in props_new) {
					if (props_new[p].enum) {
						if (props_old[p] && props_old[p].enum) {
							props_new[p].enum.forEach(function (em) {
								if (props_old[p].enum.indexOf(em) >= 0) {
									let temp_data = {};
									temp_data.c = tmp_new.category;
									temp_data.n = tmp_new.id;
									temp_data.p = p;
									temp_data.value_old = em;
									if (tmp_new.deprecated && tmp_new.deprecated.indexOf(p) >= 0) {
										temp_data.value_new = "no match";
									} else {
										temp_data.value_new = em;
									}

									data.push(temp_data);
								} else if (props_old[p].enum.indexOf(em) == -1) {
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
						} else if (!props_old[p]) {
							if (props_new[p].enum) {
								props_new[p].enum.forEach(function (em) {
									let temp_data = {};
									temp_data.c = tmp_new.category;
									temp_data.n = tmp_new.id;
									temp_data.p = p;
									temp_data.value_old = "no match";
									temp_data.value_new = em;
									data.push(temp_data);
								});
							}
						}
					}
				}

			} else {
				let tmp_new = yaml.load(folderPath + '/' + file);
				let temp_property = tmp_new.properties;
				for (let property in temp_property) {
					if (property.indexOf("$") !== 0) {
						if (temp_property[property].enum) {
							let all_enums = temp_property[property].enum;
							all_enums.forEach(function (val) {
								let temp_data = {};
								temp_data.c = tmp_new.category;
								temp_data.n = tmp_new.id;
								temp_data.p = property;
								temp_data.value_old = "no match";
								temp_data.value_new = val;
								data.push(temp_data);
							})
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
				merges: merges, // <- Merge cell ranges 
				specification: specification, // <- Report specification 
				data: data // <-- Report data 
			}
		]
	);
	res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers) 
	res.send(report);

};

function preProcess(searchable_nodes, data) {
	// Remove deprecated properties and nodes
	for (let key in data) {
		if (searchable_nodes.indexOf(key) === -1) {
			delete data[key];
		} else if (searchable_nodes.indexOf(key) !== -1 && data[key].deprecated) {
			let deprecated_p = data[key].deprecated;
			deprecated_p.forEach(function (d_p) {
				delete data[key].properties[d_p];
			});
		}
	}
	// get data from $ref: "analyte.yaml#/properties/analyte_type"
	for (let key in data) {
		if (data[key].properties) {
			let p = data[key].properties;
			for (let key in p) {
				if (key !== '$ref') {
					if (p[key].$ref && p[key].$ref.indexOf("_terms.yaml") === -1 && p[key].$ref.indexOf("_definitions.yaml") === -1) {
						let ref = p[key].$ref;
						let node = ref.split('#/')[0].replace('.yaml', '');
						let remaining = ref.split('#/')[1];
						let type = remaining.split('/')[0];
						let prop = remaining.split('/')[1];
						if (data[node] && data[node][type] && data[node][type][prop]) {
							p[key] = data[node][type][prop];
						}
					}
				}
			}
		}
	}

	// remove deprecated_enum from enums
	for (let key in data) {
		if (data[key].properties) {
			let p = data[key].properties;
			for (let key in p) {
				if (p[key].deprecated_enum && p[key].enum) {
					p[key].new_enum = _.differenceWith(p[key].enum, p[key].deprecated_enum, _.isEqual);
				}
			}
		}
	}
	return data;
}

var exportDifference = function (req, res) {
	let merges = [];
	let data = [];
	let folderPath = path.join(__dirname, '../..', 'data');
	let folderPath_old = path.join(__dirname, '../..', 'data');
	let old_data = {};
	let new_data = {};
	let searchable_nodes = ["case", "demographic", "diagnosis", "exposure", "family_history", "follow_up", "molecular_test", "treatment", "slide", "sample", "read_group", "portion", "analyte",
		"aliquot", "slide_image", "analysis_metadata", "clinical_supplement", "experiment_metadata", "pathology_report", "run_metadata", "biospecimen_supplement",
		"submitted_aligned_reads", "submitted_genomic_profile", "submitted_methylation_beta_value", "submitted_tangent_copy_number", "submitted_unaligned_reads"
	];
	fs.readdirSync(folderPath).forEach(file => {
		if (file.indexOf('_') !== 0) {
			new_data[file.replace('.yaml', '')] = yaml.load(folderPath + '/' + file);
		}
	});
	fs.readdirSync(folderPath_old).forEach(file => {
		if (file.indexOf('_') !== 0) {
			old_data[file.replace('.yaml', '')] = yaml.load(folderPath_old + '/' + file);
		}
	});

	new_data = preProcess(searchable_nodes, new_data);
	old_data = preProcess(searchable_nodes, old_data);
	//checking node in new data
	for (let key in new_data) {
		// If this node doesn't exists in old data
		if (!old_data[key]) {
			console.log(key + " Doesn't exists in new Data");
			let new_p_array = new_data[key].properties;
			for (let key_p in new_p_array) {
				let category = new_data[key].category;
				let node = new_data[key].id;
				let property = key_p;
				if (new_p_array[key_p].enum && !new_p_array[key_p].deprecated_enum) {
					//if it doesn't have deprecated values
					let enums = new_p_array[key_p].enum;
					enums.forEach(function (em) {
						let temp_data = {};
						temp_data.c = category;
						temp_data.n = node;
						temp_data.p = property;
						temp_data.value_old = "no match";
						temp_data.value_new = em;
						data.push(temp_data);
					});
				} else if (new_p_array[key_p].deprecated_enum && new_p_array[key_p].new_enum) {
					// if it has deprecated values
					let enums = new_p_array[key_p].new_enum;
					enums.forEach(function (em) {
						let temp_data = {};
						temp_data.c = category;
						temp_data.n = node;
						temp_data.p = property;
						temp_data.value_old = "no match";
						temp_data.value_new = em;
						data.push(temp_data);
					});
				}
			}
		} else if (new_data[key] && new_data[key]) {
			// node exists in both old and new data
			let new_p_array = new_data[key].properties;
			let old_p_array = old_data[key].properties;

			//checking properties in new data
			for (let key_p in new_p_array) {
				let category = new_data[key].category;
				let node = new_data[key].id;
				let property = key_p;

				if (!old_p_array[property]) {
					// If this property doesn't exists in old data
					console.log("New property found!");
					if (new_p_array[property].enum && !new_p_array[property].deprecated_enum) {
						//if it doesn't have deprecated values
						let enums = new_p_array[property].enum;
						enums.forEach(function (em) {
							let temp_data = {};
							temp_data.c = category;
							temp_data.n = node;
							temp_data.p = property;
							temp_data.value_old = "no match";
							temp_data.value_new = em;
							data.push(temp_data);
						});
					} else if (new_p_array[property].deprecated_enum && new_p_array[property].new_enum) {
						// if it has deprecated values
						let enums = new_p_array[property].new_enum;
						enums.forEach(function (em) {
							let temp_data = {};
							temp_data.c = category;
							temp_data.n = node;
							temp_data.p = property;
							temp_data.value_old = "no match";
							temp_data.value_new = em;
							data.push(temp_data);
						});
					}
				} else if (old_p_array[property]) {
					//if this property exists in both old and new data.
					if (new_p_array[property].enum && !new_p_array[property].deprecated_enum) {
						//if it doesn't have deprecated values
						let old_enums_array;
						if (old_p_array[property].deprecated_enum && old_p_array[property].new_enum) {
							old_enums_array = old_p_array[property].new_enum;
						} else {
							old_enums_array = old_p_array[property].enum;
						}
						let new_enums_array = new_p_array[property].enum;
						// Loop through new values and check if they exists in old values
						new_enums_array.forEach(function (em) {
							let temp_data = {};
							temp_data.c = category;
							temp_data.n = node;
							temp_data.p = property;
							//check if this value exists in old data
							if (old_enums_array.indexOf(em) !== -1) {
								temp_data.value_old = em;
							} else {
								temp_data.value_old = "no match";
							}
							temp_data.value_new = em;
							data.push(temp_data);
						});
					}
					if (old_p_array[property].enum && !old_p_array[property].deprecated_enum) {
						// Loop through old values and check if it exists in new value
						let new_enums_array;
						if (new_p_array[property].deprecated_enum && new_p_array[property].new_enum) {
							new_enums_array = new_p_array[property].new_enum;
						} else {
							new_enums_array = new_p_array[property].enum;
						}
						let old_enums_array = old_p_array[property].enum;
						old_enums_array.forEach(function (em) {
							if (new_enums_array.indexOf(em) === -1) {
								let temp_data = {};
								temp_data.c = category;
								temp_data.n = node;
								temp_data.p = property;
								temp_data.value_old = em;
								temp_data.value_new = "no match";;
								data.push(temp_data);
							}
						});
					}
					if (old_p_array[property].deprecated_enum && old_p_array[property].new_enum) {
						// Loop through old values and check if it exists in new value
						let new_enums_array;
						if (new_p_array[property].deprecated_enum && new_p_array[property].new_enum) {
							new_enums_array = new_p_array[property].new_enum;
						} else {
							new_enums_array = new_p_array[property].enum;
						}
						let old_enums_array = old_p_array[property].new_enum;
						old_enums_array.forEach(function (em) {
							if (new_enums_array.indexOf(em) === -1) {
								let temp_data = {};
								temp_data.c = category;
								temp_data.n = node;
								temp_data.p = property;
								temp_data.value_old = em;
								temp_data.value_new = "no match";;
								data.push(temp_data);
							}
						});
					}
					if (new_p_array[property].deprecated_enum && new_p_array[property].new_enum) {
						// if it has deprecated values
						let old_enums_array;
						if (old_p_array[property].deprecated_enum && old_p_array[property].new_enum) {
							old_enums_array = old_p_array[property].new_enum;
						} else {
							old_enums_array = old_p_array[property].enum;
						}
						let new_enums_array = new_p_array[property].new_enum;
						new_enums_array.forEach(function (em) {
							let temp_data = {};
							temp_data.c = category;
							temp_data.n = node;
							temp_data.p = property;
							//check if this value exists in old data
							if (old_enums_array.indexOf(em) !== -1) {
								temp_data.value_old = em;
							} else {
								temp_data.value_old = "no match";
							}
							temp_data.value_new = em;
							data.push(temp_data);
						});
					}
				}
			}
			// checking properties in old data
			for (let key_p in old_p_array) {
				let category = new_data[key].category;
				let node = new_data[key].id;
				let property = key_p;
				if (!new_p_array[property]) {
					// if this property doesn't exist in new data
					console.log("Property deprecated: - " + property);
					if (old_p_array[key_p].enum && !old_p_array[key_p].deprecated_enum) {
						//if it doesn't have deprecated values
						let enums = old_p_array[key_p].enum;
						enums.forEach(function (em) {
							let temp_data = {};
							temp_data.c = category;
							temp_data.n = node;
							temp_data.p = property;
							temp_data.value_old = em;
							temp_data.value_new = "no match";
							data.push(temp_data);
						});
					} else if (old_p_array[key_p].deprecated_enum && old_p_array[key_p].new_enum) {
						// if it has deprecated values
						let enums = old_p_array[key_p].new_enum;
						enums.forEach(function (em) {
							let temp_data = {};
							temp_data.c = category;
							temp_data.n = node;
							temp_data.p = property;
							temp_data.value_old = em;
							temp_data.value_new = "no match";
							data.push(temp_data);
						});
					}
				}
			}
		}


	}
	let heading = [
		['Category', 'Node', 'Property', 'Old GDC Dcitonary Value', 'New GDC Dcitonary Value']
	];
	let specification = {
		c: {
			width: 200,
			displayName: 'Category'
		},
		n: {
			width: 200,
			displayName: 'Node'
		},
		p: {
			width: 200,
			displayName: 'Property'
		},
		value_old: {
			width: 200,
			displayName: 'Old GDC Dcitonary Value'
		},
		value_new: {
			width: 200,
			displayName: 'New GDC Dcitonary Value'
		}
	};
	const report = excel.buildExport(
		[ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report 
			{
				heading: heading,
				name: 'Report', // <- Specify sheet name (optional) 
				specification: specification, // <- Report specification 
				data: data // <-- Report data 
			}
		]
	);
	res.attachment('Delta.xlsx');
	res.send(report);
	//res.send('Success!!!');
}

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

	let content_1 = fs.readFileSync("./server/data_files/conceptCode.js").toString();
	let cc = JSON.parse(content_1);
	let folderPath = path.join(__dirname, '../..', 'data');
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

module.exports = {
	export_ICDO3,
	export2Excel,
	exportAllValues,
	export_difference,
	exportDifference,
	export_common
}