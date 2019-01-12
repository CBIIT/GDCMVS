'use strict';

const elastic = require('../../components/elasticsearch');
const handleError = require('../../components/handleError');
const config = require('../../config');
const searchable_nodes = require('../../config').searchable_nodes;
const fs = require('fs');
const path = require('path');
const yaml = require('yamljs');
const excel = require('node-excel-export');
const _ = require('lodash');
const xlsx = require('node-xlsx');
const shared = require('./shared');
const folderPath = path.join(__dirname, '..', '..', 'data');

const export_ICDO3 = (req, res) => {
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

	let ICDO3 = shared.readGDCValues();
	let ICDO3_1 = ICDO3["clinical.diagnosis.morphology"];
	let ICDO3_dict = {};
	let ICDO3_dict_matched = [];
	ICDO3_1.forEach(i => {
		if (!(i.i_c in ICDO3_dict)) {
			ICDO3_dict[i.i_c] = [];
		}
		ICDO3_dict[i.i_c].push(i);
	});
	let ICDO3_2 = ICDO3["clinical.diagnosis.site_of_resection_or_biopsy"];
	let ICDO3_dict_c = {};
	let ICDO3_dict_c_matched = [];
	let nm_dict_c = {};
	ICDO3_2.forEach(i => {
		if (!(i.i_c in ICDO3_dict_c)) {
			ICDO3_dict_c[i.i_c] = [];
		}
		ICDO3_dict_c[i.i_c].push(i);
		nm_dict_c[i.nm.toLowerCase()] = i;
	});
	let cc = shared.readConceptCode();
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
	enum_1.forEach(em => {
		if (em in ICDO3_dict) {
			ICDO3_dict_matched.push(em);
			let start = rows;
			let end = start + ICDO3_dict[em].length - 1;
			ICDO3_dict[em].forEach(item => {
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
			ICDO3_dict[id].forEach(item => {
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
	enum_2.forEach(em => {
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
			ICDO3_dict_c[em].forEach(item => {
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
	enum_3.forEach(em => {
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
			ICDO3_dict[em].forEach(item => {
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
			ICDO3_dict_c[em].forEach(item => {
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
			ICDO3_dict_c[idc].forEach(item => {
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
	enum_4.forEach(em => {
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
			ICDO3_dict[em].forEach(item => {
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
			ICDO3_dict_c[em].forEach(item => {
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

	// const report = excel.buildExport(content);

	// You can then return this straight 
	res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers) 
	res.send(report);
};

const export2Excel = (req, res) => {
	let deprecated_properties = [];
	let deprecated_enum = [];
	fs.readdirSync(folderPath).forEach(file => {
		if (file.indexOf('_') !== 0) {
			let fileJson = yaml.load(folderPath + '/' + file);
			let category = fileJson.category;
			let node = fileJson.id;

			if (fileJson.deprecated) {
				fileJson.deprecated.forEach(d_p => {
					let tmp_d_p = category + "." + node + "." + d_p;
					deprecated_properties.push(tmp_d_p);
				})
			}

			for (let keys in fileJson.properties) {
				if (fileJson.properties[keys].deprecated_enum) {
					fileJson.properties[keys].deprecated_enum.forEach(d_e => {
						let tmp_d_e = category + "." + node + "." + keys + "." + d_e;
						deprecated_enum.push(tmp_d_e);
					});
				}
			}
		}
	});
	
	let ncit_pv = shared.readNCItDetails();
	let file_cde = shared.readCDEData();
	let query = {
		"match_all": {}
	};

	elastic.query(config.index_p, query, null, result => {
		if (result.hits === undefined) {
			return handleError.error(res, result);
		}
		let data = result.hits.hits;
		let ds = [];
		data.forEach(entry => {
			let vs = entry._source.enum;
			if (vs) {
				let cde = entry._source.cde;
				let cde_pv = entry._source.cde_pv;
				if (cde && cde_pv) {
					let common_values = [];
					vs.forEach(v => {
						cde_pv.forEach(cpv => {
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
											file_cde[cde.id].forEach(cde_pvs => {
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

					vs.forEach(v => {
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
					cde_pv.forEach(cpv => {
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
										file_cde[cde.id].forEach(cde_pvs => {
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
					vs.forEach(v => {
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

const exportAllValues = (req, res) => {
	let merges = [];
	let data = [];
	let heading = [
		['Category', 'Node', 'Property', 'Value']
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
	for (let key in new_data) {
		let category = new_data[key].category;
		let node = new_data[key].id;
		if (new_data[key].properties) {
			let properties = new_data[key].properties
			for (let property in properties) {
				if (properties[property].enum && !properties[property].deprecated_enum) {
					let enums = properties[property].enum;
					enums.forEach(em => {
						let tmp_data = {};
						tmp_data.c = category;
						tmp_data.n = node;
						tmp_data.p = property;
						tmp_data.v = em;
						data.push(tmp_data);
					})
				} else if (properties[property].deprecated_enum && properties[property].new_enum) {
					let enums = properties[property].new_enum;
					enums.forEach(em => {
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
	res.attachment('All-Values-' + new Date() + '.xlsx'); // This is sails.js specific (in general you need to set headers) 
	res.send(report);

};

const exportMapping = (req, res) => {
	let all_gdc_values = shared.readGDCValues();
	let cdeData = shared.readCDEData();
	let cc = shared.readConceptCode();
	let ncit_pv = shared.readNCItDetails();

	let i_c_data = {};
	all_gdc_values["clinical.diagnosis.morphology"].forEach(data =>{
		if(data.nm !== data.i_c){
			if(i_c_data[data.i_c] === undefined){
				i_c_data[data.i_c] = {
					ncit_pv: [],
					n_c: [],
					nm: []
				}
				if(data.n_c) i_c_data[data.i_c].n_c.push(data.n_c);
				if(data.nm) i_c_data[data.i_c].nm.push(data.nm);
				if(ncit_pv[data.n_c]){
					i_c_data[data.i_c].ncit_pv.push(ncit_pv[data.n_c].preferredName);
				}
			}else{
				if(data.n_c && i_c_data[data.i_c].n_c.indexOf(data.n_c) === -1){
					i_c_data[data.i_c].n_c.push(data.n_c);
					if(ncit_pv[data.n_c]){
						i_c_data[data.i_c].ncit_pv.push(ncit_pv[data.n_c].preferredName);
					}
				}
				if(data.nm && i_c_data[data.i_c].nm.indexOf(data.nm) === -1){
					i_c_data[data.i_c].nm.push(data.nm);
				}
			}
		}
	});

	let merges = [];
	let data = [];
	let heading = [
		['Category', 'Node', 'Property', 'GDC Values','NCIt PV','NCIt Code','CDE PV Meaning','CDE PV Meaning concept codes','CDE ID','ICDO3 Code', 'ICDO3 Strings','Term Type']
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
		},
		ncit_v: {
			width: 200
		},
		ncit_c: {
			width: 200
		},
		cde_v: {
			width: 200
		},
		cde_c: {
			width: 200
		},
		cde_id: {
			width: 200
		},
		i_c:{
			width: 200
		},
		i_c_s:{
			width: 200
		},
		t_t:{
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
	for (let key in new_data) {
		let category = new_data[key].category;
		let node = new_data[key].id;
		if (new_data[key].properties) {
			let properties = new_data[key].properties
			for (let property in properties) {
				if (properties[property].enum && !properties[property].deprecated_enum) {
					let cde_id = "";
					if (properties[property].relation && properties[property].relation.termDef && properties[property].relation.termDef.cde_id) {
						cde_id = properties[property].relation.termDef.cde_id;
					}
					let enums = properties[property].enum;
					enums.forEach(em => {
						let tmp_data = {};
						tmp_data.c = category;
						tmp_data.n = node;
						tmp_data.p = property;
						tmp_data.v = em;
						tmp_data.cde_id = cde_id;
						tmp_data.cde_v = "";
						tmp_data.cde_c = "";
						tmp_data.ncit_v = "";
						tmp_data.ncit_c = "";
						tmp_data.i_c = "";
						tmp_data.i_c_s = "";
						tmp_data.t_t = "";
						if (cde_id !== "" && cdeData[cde_id]) {
							cdeData[cde_id].forEach(value => {
								if (value.pv === em) {
									tmp_data.cde_v = value.pvm;
									tmp_data.cde_c = value.pvc;
								}
							});
						}
						if (cc[category + "." + node + "." + property] && cc[category + "." + node + "." + property][em]) {
							tmp_data.ncit_c = cc[category + "." + node + "." + property][em];
							tmp_data.ncit_v = ncit_pv[cc[category + "." + node + "." + property][em]] ? ncit_pv[cc[category + "." + node + "." + property][em]].preferredName : "";
						}else if(property !== "morphology" && all_gdc_values[category + "." + node + "." + property]){
							all_gdc_values[category + "." + node + "." + property].forEach(data => {
								if(em === data.nm){
									tmp_data.ncit_c = data.n_c;
									tmp_data.ncit_v = ncit_pv[data.n_c] ? ncit_pv[data.n_c].preferredName : "";
									tmp_data.i_c = data.i_c;
									tmp_data.i_c_s = data.nm;
									tmp_data.t_t = data.term_type;
								}
							});
						}
						data.push(tmp_data);
					})
				} else if (properties[property].deprecated_enum && properties[property].new_enum) {
					let cde_id = "";
					if (properties[property].relation && properties[property].relation.termDef && properties[property].relation.termDef.cde_id) {
						cde_id = properties[property].relation.termDef.cde_id;
					}
					let enums = properties[property].new_enum;
					enums.forEach(em => {
						let tmp_data = {};
						tmp_data.c = category;
						tmp_data.n = node;
						tmp_data.p = property;
						tmp_data.v = em;
						tmp_data.cde_id = cde_id;
						tmp_data.cde_v = "";
						tmp_data.cde_c = "";
						tmp_data.ncit_v = "";
						tmp_data.ncit_c = "";
						tmp_data.i_c = "";
						tmp_data.i_c_s = "";
						tmp_data.t_t = "";
						if (cde_id !== "" && cdeData[cde_id]) {
							cdeData[cde_id].forEach(value => {
								if (value.pv === em) {
									tmp_data.cde_v = value.pvm;
									tmp_data.cde_c = value.pvc;
								}
							});
						}
						if (cc[category + "." + node + "." + property] && cc[category + "." + node + "." + property][em]) {
							tmp_data.ncit_c = cc[category + "." + node + "." + property][em];
							tmp_data.ncit_v = ncit_pv[cc[category + "." + node + "." + property][em]] ? ncit_pv[cc[category + "." + node + "." + property][em]].preferredName : "";
						}else if(property !== "morphology" && all_gdc_values[category + "." + node + "." + property]){
							all_gdc_values[category + "." + node + "." + property].forEach(data => {
								if(em === data.nm){
									tmp_data.ncit_c = data.n_c;
									tmp_data.ncit_v = ncit_pv[data.n_c] ? ncit_pv[data.n_c].preferredName : "";
									tmp_data.i_c = data.i_c;
									tmp_data.i_c_s = data.nm;
									tmp_data.t_t = data.term_type;
								}
							});
						}else if(property === 'morphology' && i_c_data[em]){
							tmp_data.i_c = em;
							i_c_data[em].n_c.forEach((tmp_result, index) => { 
								if(index === 0){
									tmp_data.ncit_c += tmp_result;
								}else{
									tmp_data.ncit_c += ' | ' + tmp_result;
								} 
							});
							i_c_data[em].ncit_pv.forEach((tmp_result, index) => {
								if(index === 0){
									tmp_data.ncit_v += tmp_result;
								}else{
									tmp_data.ncit_v += ' | ' + tmp_result;
								} 
							});
							i_c_data[em].nm.forEach((tmp_result, index) => {
								if(index === 0){
									tmp_data.i_c_s += tmp_result;
								}else{
									tmp_data.i_c_s += ' | ' + tmp_result;
								} 
							});
						}
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
	res.attachment('Report-' + new Date() + '.xlsx'); // This is sails.js specific (in general you need to set headers) 
	res.send(report);
	// res.send('Success');
};

const export_difference = (req, res) => {
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
			cellStyle: (value, row) => {
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
			cellStyle: (value, row) => {
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
			cellStyle: (value, row) => {
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
							props_old[tmp_new.deprecated[d]].enum.forEach(em => {
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
							denums.forEach(denum => {
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
							props_new[p].enum.forEach(em => {
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
							// props_old[p].enum.forEach(em => {
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
								props_new[p].enum.forEach(em => {
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
							all_enums.forEach(val => {
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

const preProcess = (searchable_nodes, data) => {
	let folderPath = path.join(__dirname, '../..', 'data');
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
	for (let key1 in data) {
		if (data[key1].properties) {
			let p = data[key1].properties;
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
	for (let key1 in data) {
		if (data[key1].properties) {
			let p = data[key1].properties;
			for (let key in p) {
				if (p[key].deprecated_enum && p[key].enum) {
					p[key].new_enum = _.differenceWith(p[key].enum, p[key].deprecated_enum, _.isEqual);
				}
			}
		}
	}

	// get $ref for Property
	for (let key1 in data) {
		if (data[key1].properties) {
			let p = data[key1].properties;
			for (let key in p) {
				let property_data = p[key];
				if (property_data.term && property_data.term.$ref) {
					if (property_data.term.$ref.indexOf('_terms.yaml') !== -1) {
						let ref = property_data.term.$ref;
						if (ref.indexOf('#/') !== -1) {
							let file_name = ref.split('#/')[0];
							let ref_property = ref.split('#/')[1];
							let term_definition = yaml.load(folderPath + '/' + file_name);
							if (term_definition[ref_property]) {
								property_data.relation = term_definition[ref_property]
							}
						}
					}
				}
			}
		}
	}
	return data;
}

const exportDifference = (req, res) => {
	let icdo3_prop = ["primary_diagnosis", "site_of_resection_or_biopsy", "tissue_or_organ_of_origin", "progression_or_recurrence_anatomic_site"];
	let data = [];
	let folderPath = path.join(__dirname, '../..', 'data');
	let folderPath_old = path.join(__dirname, '../..', 'data_old');
	let old_data = {};
	let new_data = {};
	let gdc_values = shared.readGDCValues();
	let cc = shared.readConceptCode();
	let ncit_pv = shared.readNCItDetails();
	let i_c_data = {};
	gdc_values["clinical.diagnosis.morphology"].forEach(data =>{
		if(data.nm !== data.i_c){
			if(i_c_data[data.i_c] === undefined){
				i_c_data[data.i_c] = {
					ncit_pv: [],
					n_c: [],
					nm: []
				}
				if(data.n_c) i_c_data[data.i_c].n_c.push(data.n_c);
				if(data.nm) i_c_data[data.i_c].nm.push(data.nm);
				if(ncit_pv[data.n_c]){
					i_c_data[data.i_c].ncit_pv.push(ncit_pv[data.n_c].preferredName);
				}
			}else{
				if(data.n_c && i_c_data[data.i_c].n_c.indexOf(data.n_c) === -1){
					i_c_data[data.i_c].n_c.push(data.n_c);
					if(ncit_pv[data.n_c]){
						i_c_data[data.i_c].ncit_pv.push(ncit_pv[data.n_c].preferredName);
					}
				}
				if(data.nm && i_c_data[data.i_c].nm.indexOf(data.nm) === -1){
					i_c_data[data.i_c].nm.push(data.nm);
				}
			}
		}
	});
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
					enums.forEach(em => {
						let temp_data = {};
						temp_data.c = category;
						temp_data.n = node;
						temp_data.p = property;
						temp_data.value_old = "no match";
						temp_data.value_new = em;
						temp_data.n_c = "";
						temp_data.n_c_pv = "";
						temp_data.i_c = "";
						temp_data.i_c_pv = "";
						data.push(temp_data);
					});
				} else if (new_p_array[key_p].deprecated_enum && new_p_array[key_p].new_enum) {
					// if it has deprecated values
					let enums = new_p_array[key_p].new_enum;
					enums.forEach(em => {
						let temp_data = {};
						temp_data.c = category;
						temp_data.n = node;
						temp_data.p = property;
						temp_data.value_old = "no match";
						temp_data.value_new = em;
						temp_data.n_c = "";
						temp_data.n_c_pv = "";
						temp_data.i_c = "";
						temp_data.i_c_pv = "";
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
					console.log("New property found! "+property);
					if (new_p_array[property].enum && !new_p_array[property].deprecated_enum) {
						//if it doesn't have deprecated values
						let enums = new_p_array[property].enum;
						enums.forEach(em => {
							let temp_data = {};
							temp_data.c = category;
							temp_data.n = node;
							temp_data.p = property;
							temp_data.value_old = "no match";
							temp_data.value_new = em;
							temp_data.n_c = "";
							temp_data.n_c_pv = "";
							temp_data.i_c = "";
							temp_data.i_c_pv = "";
							data.push(temp_data);
						});
					} else if (new_p_array[property].deprecated_enum && new_p_array[property].new_enum) {
						// if it has deprecated values
						let enums = new_p_array[property].new_enum;
						enums.forEach(em => {
							let temp_data = {};
							temp_data.c = category;
							temp_data.n = node;
							temp_data.p = property;
							temp_data.value_old = "no match";
							temp_data.value_new = em;
							temp_data.n_c = "";
							temp_data.n_c_pv = "";
							temp_data.i_c = "";
							temp_data.i_c_pv = "";
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
						new_enums_array.forEach(em => {
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
							temp_data.n_c = "";
							temp_data.n_c_pv = "";
							temp_data.i_c = "";
							temp_data.i_c_pv = "";
							let cnp = category+'.'+node+'.'+property;
							if(temp_data.value_old !== "no match" && cc[cnp] && cc[cnp][temp_data.value_old]){
								temp_data.n_c = cc[cnp][temp_data.value_old];
								temp_data.n_c_pv = ncit_pv[cc[cnp][temp_data.value_old]] ? ncit_pv[cc[cnp][temp_data.value_old]].preferredName : "";
							}
							if(icdo3_prop.indexOf(temp_data.p) !== -1){
								gdc_values[cnp].forEach(val => {
									if(val.nm === temp_data.value_old){
										temp_data.n_c = val.n_c;
										temp_data.n_c_pv = ncit_pv[val.n_c] ? ncit_pv[val.n_c].preferredName : "";
										temp_data.i_c = val.i_c;
										temp_data.i_c_pv = val.nm;
									}
								});
							}
							if(property === 'morphology' && temp_data.value_old !== "no match" && i_c_data[temp_data.value_old]){
								temp_data.i_c = temp_data.value_old;
								i_c_data[temp_data.value_old].n_c.forEach((tmp_result, index) => { 
									if(index === 0){
										temp_data.n_c += tmp_result;
									}else{
										temp_data.n_c += ' | ' + tmp_result;
									} 
								});
								i_c_data[temp_data.value_old].ncit_pv.forEach((tmp_result, index) => {
									if(index === 0){
										temp_data.n_c_pv += tmp_result;
									}else{
										temp_data.n_c_pv += ' | ' + tmp_result;
									} 
								});
								i_c_data[temp_data.value_old].nm.forEach((tmp_result, index) => {
									if(index === 0){
										temp_data.i_c_pv += tmp_result;
									}else{
										temp_data.i_c_pv += ' | ' + tmp_result;
									} 
								});
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
						old_enums_array.forEach(em => {
							if (new_enums_array.indexOf(em) === -1) {
								let temp_data = {};
								temp_data.c = category;
								temp_data.n = node;
								temp_data.p = property;
								temp_data.value_old = em;
								temp_data.value_new = "no match";
								temp_data.n_c = "";
								temp_data.n_c_pv = "";
								temp_data.i_c = "";
								temp_data.i_c_pv = "";
								let cnp = category+'.'+node+'.'+property;
								if(temp_data.value_old !== "no match" && cc[cnp] && cc[cnp][temp_data.value_old]){
									temp_data.n_c = cc[cnp][temp_data.value_old];
									temp_data.n_c_pv = ncit_pv[cc[cnp][temp_data.value_old]] ? ncit_pv[cc[cnp][temp_data.value_old]].preferredName : "";
								}
								if(icdo3_prop.indexOf(temp_data.p) !== -1){
									gdc_values[cnp].forEach(val => {
										if(val.nm === temp_data.value_old){
											temp_data.n_c = val.n_c;
											temp_data.n_c_pv = ncit_pv[val.n_c] ? ncit_pv[val.n_c].preferredName : "";
											temp_data.i_c = val.i_c;
											temp_data.i_c_pv = val.nm;
										}
									});
								}
								if(property === 'morphology' && temp_data.value_old !== "no match" && i_c_data[temp_data.value_old]){
									temp_data.i_c = temp_data.value_old;
									i_c_data[temp_data.value_old].n_c.forEach((tmp_result, index) => { 
										if(index === 0){
											temp_data.n_c += tmp_result;
										}else{
											temp_data.n_c += ' | ' + tmp_result;
										} 
									});
									i_c_data[temp_data.value_old].ncit_pv.forEach((tmp_result, index) => {
										if(index === 0){
											temp_data.n_c_pv += tmp_result;
										}else{
											temp_data.n_c_pv += ' | ' + tmp_result;
										} 
									});
									i_c_data[temp_data.value_old].nm.forEach((tmp_result, index) => {
										if(index === 0){
											temp_data.i_c_pv += tmp_result;
										}else{
											temp_data.i_c_pv += ' | ' + tmp_result;
										} 
									});
								}
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
						old_enums_array.forEach(em => {
							if (new_enums_array.indexOf(em) === -1) {
								let temp_data = {};
								temp_data.c = category;
								temp_data.n = node;
								temp_data.p = property;
								temp_data.value_old = em;
								temp_data.value_new = "no match";
								temp_data.n_c = "";
								temp_data.n_c_pv = "";
								temp_data.i_c = "";
								temp_data.i_c_pv = "";
								let cnp = category+'.'+node+'.'+property;
								if(temp_data.value_old !== "no match" && cc[cnp] && cc[cnp][temp_data.value_old]){
									temp_data.n_c = cc[cnp][temp_data.value_old];
									temp_data.n_c_pv = ncit_pv[cc[cnp][temp_data.value_old]] ? ncit_pv[cc[cnp][temp_data.value_old]].preferredName : "";
								}
								if(icdo3_prop.indexOf(temp_data.p) !== -1){
									gdc_values[cnp].forEach(val => {
										if(val.nm === temp_data.value_old){
											temp_data.n_c = val.n_c;
											temp_data.n_c_pv = ncit_pv[val.n_c] ? ncit_pv[val.n_c].preferredName : "";
											temp_data.i_c = val.i_c;
											temp_data.i_c_pv = val.nm;
										}
									});
								}
								if(property === 'morphology' && temp_data.value_old !== "no match" && i_c_data[temp_data.value_old]){
									temp_data.i_c = temp_data.value_old;
									i_c_data[temp_data.value_old].n_c.forEach((tmp_result, index) => { 
										if(index === 0){
											temp_data.n_c += tmp_result;
										}else{
											temp_data.n_c += ' | ' + tmp_result;
										} 
									});
									i_c_data[temp_data.value_old].ncit_pv.forEach((tmp_result, index) => {
										if(index === 0){
											temp_data.n_c_pv += tmp_result;
										}else{
											temp_data.n_c_pv += ' | ' + tmp_result;
										} 
									});
									i_c_data[temp_data.value_old].nm.forEach((tmp_result, index) => {
										if(index === 0){
											temp_data.i_c_pv += tmp_result;
										}else{
											temp_data.i_c_pv += ' | ' + tmp_result;
										} 
									});
								}
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
						new_enums_array.forEach(em => {
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
							temp_data.n_c = "";
							temp_data.n_c_pv = "";
							temp_data.i_c = "";
							temp_data.i_c_pv = "";
							let cnp = category+'.'+node+'.'+property;
							if(temp_data.value_old !== "no match" && cc[cnp] && cc[cnp][temp_data.value_old]){
								temp_data.n_c = cc[cnp][temp_data.value_old];
								temp_data.n_c_pv = ncit_pv[cc[cnp][temp_data.value_old]] ? ncit_pv[cc[cnp][temp_data.value_old]].preferredName : "";
							}
							if(icdo3_prop.indexOf(temp_data.p) !== -1){
								gdc_values[cnp].forEach(val => {
									if(val.nm === temp_data.value_old){
										temp_data.n_c = val.n_c;
										temp_data.n_c_pv = ncit_pv[val.n_c] ? ncit_pv[val.n_c].preferredName : "";
										temp_data.i_c = val.i_c;
										temp_data.i_c_pv = val.nm;
									}
								});
							}
							if(property === 'morphology' && temp_data.value_old !== "no match" && i_c_data[temp_data.value_old]){
								temp_data.i_c = temp_data.value_old;
								i_c_data[temp_data.value_old].n_c.forEach((tmp_result, index) => { 
									if(index === 0){
										temp_data.n_c += tmp_result;
									}else{
										temp_data.n_c += ' | ' + tmp_result;
									} 
								});
								i_c_data[temp_data.value_old].ncit_pv.forEach((tmp_result, index) => {
									if(index === 0){
										temp_data.n_c_pv += tmp_result;
									}else{
										temp_data.n_c_pv += ' | ' + tmp_result;
									} 
								});
								i_c_data[temp_data.value_old].nm.forEach((tmp_result, index) => {
									if(index === 0){
										temp_data.i_c_pv += tmp_result;
									}else{
										temp_data.i_c_pv += ' | ' + tmp_result;
									} 
								});
							}
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
						enums.forEach(em => {
							let temp_data = {};
							temp_data.c = category;
							temp_data.n = node;
							temp_data.p = property;
							temp_data.value_old = em;
							temp_data.value_new = "no match";
							temp_data.n_c = "";
							temp_data.n_c_pv = "";
							temp_data.i_c = "";
							temp_data.i_c_pv = "";
							let cnp = category+'.'+node+'.'+property;
							if(temp_data.value_old !== "no match" && cc[cnp] && cc[cnp][temp_data.value_old]){
								temp_data.n_c = cc[cnp][temp_data.value_old];
								temp_data.n_c_pv = ncit_pv[cc[cnp][temp_data.value_old]] ? ncit_pv[cc[cnp][temp_data.value_old]].preferredName : "";
							}
							if(icdo3_prop.indexOf(temp_data.p) !== -1){
								gdc_values[cnp].forEach(val => {
									if(val.nm === temp_data.value_old){
										temp_data.n_c = val.n_c;
										temp_data.n_c_pv = ncit_pv[val.n_c] ? ncit_pv[val.n_c].preferredName : "";
										temp_data.i_c = val.i_c;
										temp_data.i_c_pv = val.nm;
									}
								});
							}
							if(property === 'morphology' && temp_data.value_old !== "no match" && i_c_data[temp_data.value_old]){
								temp_data.i_c = temp_data.value_old;
								i_c_data[temp_data.value_old].n_c.forEach((tmp_result, index) => { 
									if(index === 0){
										temp_data.n_c += tmp_result;
									}else{
										temp_data.n_c += ' | ' + tmp_result;
									} 
								});
								i_c_data[temp_data.value_old].ncit_pv.forEach((tmp_result, index) => {
									if(index === 0){
										temp_data.n_c_pv += tmp_result;
									}else{
										temp_data.n_c_pv += ' | ' + tmp_result;
									} 
								});
								i_c_data[temp_data.value_old].nm.forEach((tmp_result, index) => {
									if(index === 0){
										temp_data.i_c_pv += tmp_result;
									}else{
										temp_data.i_c_pv += ' | ' + tmp_result;
									} 
								});
							}
							data.push(temp_data);
						});
					} else if (old_p_array[key_p].deprecated_enum && old_p_array[key_p].new_enum) {
						// if it has deprecated values
						let enums = old_p_array[key_p].new_enum;
						enums.forEach(em => {
							let temp_data = {};
							temp_data.c = category;
							temp_data.n = node;
							temp_data.p = property;
							temp_data.value_old = em;
							temp_data.value_new = "no match";
							temp_data.n_c = "";
							temp_data.n_c_pv = "";
							temp_data.i_c = "";
							temp_data.i_c_pv = "";
							let cnp = category+'.'+node+'.'+property;
							if(temp_data.value_old !== "no match" && cc[cnp] && cc[cnp][temp_data.value_old]){
								temp_data.n_c = cc[cnp][temp_data.value_old];
								temp_data.n_c_pv = ncit_pv[cc[cnp][temp_data.value_old]] ? ncit_pv[cc[cnp][temp_data.value_old]].preferredName : "";
							}
							if(icdo3_prop.indexOf(temp_data.p) !== -1){
								gdc_values[cnp].forEach(val => {
									if(val.nm === temp_data.value_old){
										temp_data.n_c = val.n_c;
										temp_data.n_c_pv = ncit_pv[val.n_c] ? ncit_pv[val.n_c].preferredName : "";
										temp_data.i_c = val.i_c;
										temp_data.i_c_pv = val.nm;
									}
								});
							}
							if(property === 'morphology' && temp_data.value_old !== "no match" && i_c_data[temp_data.value_old]){
								temp_data.i_c = temp_data.value_old;
								i_c_data[temp_data.value_old].n_c.forEach((tmp_result, index) => { 
									if(index === 0){
										temp_data.n_c += tmp_result;
									}else{
										temp_data.n_c += ' | ' + tmp_result;
									} 
								});
								i_c_data[temp_data.value_old].ncit_pv.forEach((tmp_result, index) => {
									if(index === 0){
										temp_data.n_c_pv += tmp_result;
									}else{
										temp_data.n_c_pv += ' | ' + tmp_result;
									} 
								});
								i_c_data[temp_data.value_old].nm.forEach((tmp_result, index) => {
									if(index === 0){
										temp_data.i_c_pv += tmp_result;
									}else{
										temp_data.i_c_pv += ' | ' + tmp_result;
									} 
								});
							}
							data.push(temp_data);
						});
					}
				}
			}
		}
	}
	let heading = [
		['Category', 'Node', 'Property', 'Old GDC Dcitonary Value', 'New GDC Dcitonary Value', 'NCIt Code', 'NCIt PV', 'ICDO3 code', 'ICDO3 String']
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
		},
		n_c: {
			width: 200
		},
		n_c_pv: {
			width: 200
		},
		i_c: {
			width: 200
		},
		i_c_pv: {
			width: 200
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
	res.attachment('Delta-' + new Date() + '.xlsx');
	res.send(report);
	//res.send('Success!!!');
}

const export_common = (req, res) => {
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
	let cc = shared.readConceptCode();
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
						props[p].enum.forEach(em => {
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
						props_old[p].enum.forEach(em => {
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
						props[p].enum.forEach(em => {
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
						props_old[p].enum.forEach(em => {
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

const addTermType = (req, res) => {
	var obj = xlsx.parse('C:\\Users\\patelbhp\\Desktop\\EVS_Mappings\\ICD-O-3.1-NCIt_Axis_Mappings.xls');
	let all_gdc_values = shared.readGDCValues();
	let data = {};
	obj.forEach((sheet, index) => {
		if(index === 0) return;
		var worksheet = sheet.data;
		worksheet.forEach((dt, index) => {
			let tmp_data = {};
			if (index === 0 ) return;
			tmp_data.code = dt[0];
			tmp_data.level = dt[1];
			tmp_data.tt = dt[2];
			tmp_data.tt_desc = dt[3];
			tmp_data.icdo_string = dt[4];
			if(data[dt[0]] == undefined){
				data[dt[0]] = [];
			}
			data[dt[0]].push(tmp_data);
		});
	});
	for(let cnp in all_gdc_values){
		all_gdc_values[cnp].forEach(em => {
			let i_c = em.i_c;
			let value = em.nm;
			if(data[i_c]){
				data[i_c].forEach(dt=>{
					if(dt.code == i_c && dt.icdo_string == value){
						em.term_type = dt.tt;
					}
				});
			}
		});
	}
	fs.writeFileSync("./server/data_files/gdc_values.js", JSON.stringify(all_gdc_values), err => {
		if (err) return logger.error(err);
	});
	res.send("Success");
}

const icdoMapping = (req, res) => {
	var obj = xlsx.parse('C:\\Users\\patelbhp\\Desktop\\EVS_Mappings\\Mappings\\new_gdc_domiains-map.2018.10.03.xlsx');
	
	let all_gdc_values = shared.readGDCValues();
	let array = ["clinical.diagnosis.tissue_or_organ_of_origin","clinical.follow_up.progression_or_recurrence_anatomic_site","clinical.diagnosis.primary_diagnosis"];
	let cc = shared.readConceptCode();
	all_gdc_values["clinical.diagnosis.tissue_or_organ_of_origin"] = [];
	all_gdc_values["clinical.follow_up.progression_or_recurrence_anatomic_site"] = [];
	all_gdc_values["clinical.diagnosis.primary_diagnosis"] = [];
	
	obj.forEach((sheet, index) => {
		if(index !== 0) return;
		var worksheet = sheet.data;
		worksheet.forEach((value, i) => {
			if (i === 0) return;
			let n_c_1 = value[2] !== undefined ? value[2] : "";
			let n_c_2 = value[5] !== undefined ? value[5] : "";
			all_gdc_values["clinical.diagnosis.tissue_or_organ_of_origin"].push({nm:value[0] ,i_c:value[1], n_c:n_c_1});
			all_gdc_values["clinical.follow_up.progression_or_recurrence_anatomic_site"].push({nm:value[3] ,i_c:value[4], n_c:n_c_2});
		});
	});
	obj.forEach((sheet, index) => {
		if(index !== 1) return;
		var worksheet = sheet.data;
		worksheet.forEach((value, i) => {
			if (i === 0) return;
			let n_c_1 = value[2] !== undefined ? value[2] : "";
			all_gdc_values["clinical.diagnosis.primary_diagnosis"].push({nm:value[0] ,i_c:value[1], n_c:n_c_1});
		});
	});
	array.forEach(cnp => {
		all_gdc_values[cnp].forEach(value => {
			let em = value.nm;
			let n_c = value.n_c;
			if(cc[cnp] && cc[cnp][em] !== undefined){
				delete cc[cnp][em];
			}
		});
	});
	// fs.writeFileSync("./server/data_files/conceptCode.js", JSON.stringify(cc), err => {
	// 	if (err) return logger.error(err);
	// });
	fs.writeFileSync("./server/data_files/gdc_values.js", JSON.stringify(all_gdc_values), err => {
		if (err) return logger.error(err);
	});
	res.send("Success");
}

const releaseNote = (req, res) => {
	let merges = [];
	let data = [];
	let heading = [
		['Category | Node | Property', 'Total values','Total Values Mapped to ICDO','Total Values Mapped to EVS']
	];
	let specification = {
	
		p: {
			width: 200
		},
		t:{
			width: 200
		},
		ti:{
			width: 200
		},
		te:{
			width: 200
		}
	};
	let all_gdc_values = shared.readGDCValues();
	let cc = shared.readConceptCode();
	let folderPath = path.join(__dirname, '../..', 'data');
	
	let tmp_array = ["clinical.diagnosis.morphology","clinical.diagnosis.site_of_resection_or_biopsy","clinical.diagnosis.tissue_or_organ_of_origin","clinical.follow_up.progression_or_recurrence_anatomic_site","clinical.diagnosis.primary_diagnosis"];

	let new_data = {};
	fs.readdirSync(folderPath).forEach(file => {
		if (file.indexOf('_') !== 0) {
			new_data[file.replace('.yaml', '')] = yaml.load(folderPath + '/' + file);
		}
	});
	new_data = preProcess(searchable_nodes, new_data);
	for(let key in cc){
		let n = key.split(".")[1];
		if(tmp_array.indexOf(key) === -1 && searchable_nodes.indexOf(n) !== -1){
			let tmp_data = {};
			tmp_data.p = key;
			tmp_data.t = Object.keys(cc[key]).length;
			tmp_data.ti = 0;
			tmp_data.te = 0;
			for(let value in cc[key]){
				if(cc[key][value]){
					tmp_data.te++;
				}
			}
			data.push(tmp_data);
		}
	}
	for(let node in new_data){
		let category = new_data[node].category;
		let n = new_data[node].id;
		if(new_data[node].properties){
			let p = new_data[node].properties;
			for(let val in p){
				if(p === '$ref') return;
				if(cc[category+"."+n+"."+val] === undefined && tmp_array.indexOf(val) == -1 && p[val].enum){
					let tmp_data = {};
					tmp_data.p = category+"."+n+"."+val;
					tmp_data.t = 0;
					tmp_data.ti = 0;
					tmp_data.te = 0;
					if(!p[val].new_enum){
						tmp_data.t = p[val].enum.length;
					}else{
						tmp_data.t = p[val].new_enum.length;
					}
					data.push(tmp_data);
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

	res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers) 
	res.send(report);
	// res.send("Success");
}

const exportMorphology = (req, res) => {
	let merges = [];
	let arr = [];
	let heading = [
		['Category', 'Node', 'Property', 'GDC Values','ICDO3 String','ICDO3 Code','NCIt PV','NCIt Code','Term Type','CDE PV Meaning','CDE PV Meaning concept codes','CDE ID']
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
		},
		i_c_s:{
			width: 200
		},
		i_c:{
			width: 200
		},
		ncit_v: {
			width: 200
		},
		ncit_c: {
			width: 200
		},
		t_t:{
			width: 200
		},
		cde_v: {
			width: 200
		},
		cde_c: {
			width: 200
		},
		cde_id: {
			width: 200
		}
	};

	let all_gdc_values = shared.readGDCValues();
	let cdeData = shared.readCDEData();
	let cc = shared.readConceptCode();
	let ncit_pv = shared.readNCItDetails();

	all_gdc_values["clinical.diagnosis.morphology"].forEach(data =>{
		if(data.nm !== data.i_c){
			let tmp_data = {};
			tmp_data.c = 'Clinical';
			tmp_data.n = 'Diagnosis';
			tmp_data.p = 'Morphology';
			tmp_data.v = data.i_c;
			tmp_data.ncit_v = ncit_pv[data.n_c] && ncit_pv[data.n_c].preferredName ? ncit_pv[data.n_c].preferredName: '';
			tmp_data.ncit_c = data.n_c;
			tmp_data.cde_v = '';
			tmp_data.cde_c = '';
			tmp_data.cde_id = '3226275';
			tmp_data.i_c = data.i_c;
			tmp_data.i_c_s = data.nm;
			tmp_data.t_t = data.term_type;
			arr.push(tmp_data);
		}
	});

	for(let val in cc['clinical.diagnosis.morphology']){
		let tmp_data = {};
			tmp_data.c = 'Clinical';
			tmp_data.n = 'Diagnosis';
			tmp_data.p = 'Morphology';
			tmp_data.v = val;
			tmp_data.ncit_v = cc["clinical.diagnosis.morphology"][val] && ncit_pv[cc["clinical.diagnosis.morphology"][val]] && ncit_pv[cc["clinical.diagnosis.morphology"][val]].preferredName ? ncit_pv[cc["clinical.diagnosis.morphology"][val]].preferredName: '';
			tmp_data.ncit_c = cc["clinical.diagnosis.morphology"][val];
			tmp_data.cde_v = '';
			tmp_data.cde_c = '';
			tmp_data.cde_id = '3226275';
			tmp_data.i_c = '';
			tmp_data.i_c_s = '';
			tmp_data.t_t = '';
			arr.push(tmp_data);
	}
	
	const report = excel.buildExport(
		[ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report 
			{
				name: 'Report', // <- Specify sheet name (optional) 
				heading: heading, // <- Raw heading array (optional) 
				merges: merges, // <- Merge cell ranges 
				specification: specification, // <- Report specification 
				data: arr // <-- Report data 
			}
		]
	);

	res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers) 
	res.send(report);
	// res.send('Success');
}

const compareDataType = (req, res) => {
	let merges = [];
	let arr = [];
	let heading = [
		['Category', 'Node', 'Property', 'CDE ID', 'GDC Data Type', 'CDE Data Type']
	];
	let cdeDataType = shared.readCDEDataType();
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
		cde_id: {
			width: 200
		},
		dt_gdc: {
			width: 200
		},
		dt_cde: {
			width: 200
		}
	};
	let query = {
		"match_all": {}
	};
	elastic.query(config.index_p, query, null, result => {
		if (result.hits === undefined) {
			return handleError.error(res, result);
		}
		let data = result.hits.hits;
		data.forEach((result) => {
			let source = result._source;
			if(source.cde !== undefined && source.cde.id !== undefined && cdeDataType[source.cde.id] !== undefined && source.enum === undefined){
				if(source.type.toString().toLowerCase() !== cdeDataType[source.cde.id].toLowerCase()){
					let temp_data = {};
					temp_data.c = source.category;
					temp_data.n = source.node;
					temp_data.p = source.name;
					temp_data.cde_id = source.cde.id;
					temp_data.dt_gdc = source.type;
					temp_data.dt_cde = cdeDataType[source.cde.id];
					arr.push(temp_data);
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
					data: arr // <-- Report data 
				}
			]
		);
		res.attachment('datatype-comparison.xlsx'); // This is sails.js specific (in general you need to set headers) 
		res.send(report);
	});
	
	// res.send('Success');
}

module.exports = {
	releaseNote,
	export_ICDO3,
	export2Excel,
	exportAllValues,
	export_difference,
	exportDifference,
	export_common,
	exportMapping,
	preProcess,
	addTermType,
	icdoMapping,
	exportMorphology,
	compareDataType
}
