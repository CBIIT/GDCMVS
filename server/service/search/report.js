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
	fs.readdirSync(folderPath).forEach(file => {
		if (file.indexOf('_') !== 0) {
			new_data[file.replace('.yaml', '')] = yaml.load(folderPath + '/' + file);
		}
	});
	new_data = preProcess(searchable_nodes, new_data);
	for (let key in new_data) {
		let category = new_data[key].category && new_data[key].category === 'administrative' ? 'case' : new_data[key].category;
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
	let gdc_values = shared.readGDCValues();
	let cdeData = shared.readCDEData();
	let ncit_details = shared.readNCItDetails();
	let merges = [];
	let data = [];
	let heading = [
		['Category', 'Node', 'Property', 'GDC Values','NCIt PV','NCIt Code','ICDO3 Code', 'ICDO3 Strings','Term Type','CDE PV Meaning','CDE PV Meaning concept codes','CDE ID']
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
		i_c:{
			width: 200
		},
		i_c_s:{
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
	let new_data = {};
	fs.readdirSync(folderPath).forEach(file => {
		if (file.indexOf('_') !== 0) {
			new_data[file.replace('.yaml', '')] = yaml.load(folderPath + '/' + file);
		}
	});
	new_data = preProcess(searchable_nodes, new_data);

	for (let key in new_data) {
		let category = new_data[key].category && new_data[key].category === 'administrative' ? 'case' : new_data[key].category;
		let node = new_data[key].id;
		if (new_data[key].properties) {
			let properties = new_data[key].properties
			for (let property in properties) {
				if (properties[property].enum) {
					let cde_id = "";
					if (properties[property].relation && properties[property].relation.termDef && properties[property].relation.termDef.cde_id) {
						cde_id = properties[property].relation.termDef.cde_id;
					}
					let enums = properties[property].enum;
					let deprecated_enum = [];
					if(properties[property].deprecated_enum) {
						deprecated_enum = properties[property].deprecated_enum;
					}
					let mappings = gdc_values[category + "." + node + "." + property] !== undefined ? gdc_values[category + "." + node + "." + property] : [];
					enums.forEach(em => {
						let tmp_data = {};
						tmp_data.c = category;
						tmp_data.n = node;
						tmp_data.p = property;
						tmp_data.v = em;
						tmp_data.cde_id = cde_id;
						tmp_data.cde_v = "";
						tmp_data.cde_c = "";
						tmp_data.ncit_v = [];
						tmp_data.ncit_c = [];
						tmp_data.i_c = "";
						tmp_data.i_c_s = [];
						tmp_data.t_t = "";
						if (cde_id !== "" && cdeData[cde_id]) {
							cdeData[cde_id].forEach(value => {
								if (value.pv === em) {
									tmp_data.cde_v = value.pvm;
									tmp_data.cde_c = value.pvc;
								}
							});
						}
						if (deprecated_enum.includes(em)) {
							return;
						}
						let map = mappings.find(({ nm }) => nm === em);
						if(map !== undefined){
						  tmp_data.ncit_c = Array.isArray(map.n_c) ? map.n_c.join('|') : map.n_c;
						  if(map.i_c !== undefined && map.i_c !== ''){
							tmp_data.i_c = map.i_c;
							tmp_data.i_c_s = Array.isArray(map.i_c_s) ? map.i_c_s.join('|') : map.i_c_s;
							tmp_data.t_t = map.term_type;
						  }
						  for(let code of map.n_c){
							tmp_data.ncit_v.push(ncit_details[code] !== undefined ? ncit_details[code].preferredName : '');
						  }
						  tmp_data.ncit_v = Array.isArray(tmp_data.ncit_v) ? tmp_data.ncit_v.join('|') : tmp_data.ncit_v;
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

const preProcess = (searchable_nodes, data) => {

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
					let ref = Array.isArray(p[key].$ref) ? p[key].$ref[0] : p[key].$ref;
					if (ref && ref.indexOf("_terms.yaml") === -1 && ref.indexOf("_definitions.yaml") === -1) {
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

	// remove break line and spaces from enums
	for (let key1 in data) {
		if (data[key1].properties) {
			let p = data[key1].properties;
			for (let key in p) {
				if (p[key].enum) {
					let enums = p[key].enum;
					for (let k in enums) {
						enums[k] = enums[k].toString().replace('\n', ' ').replace('  ', ' ');
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

	// Update type array enums
	for (let key1 in data) {
		if (data[key1].properties) {
			let p = data[key1].properties;
			for (let key in p) {
				if (p[key].items !== undefined && p[key].type === 'array') {
					p[key].enum = p[key].items.enum;
				}
			}
		}
	}

	// get all terms definition 
	let term_definition = yaml.load(folderPath + '/_terms.yaml');

	// get $ref for Property
	for (let key1 in data) {
		if (data[key1].properties) {
			let p = data[key1].properties;
			for (let key in p) {
				let property_data = p[key];
				if (property_data.$ref) {
					let ref = Array.isArray(property_data.$ref) ? property_data.$ref[0] : property_data.$ref;
					if (ref.indexOf('_terms.yaml') !== -1) {
						if (ref.indexOf('#/') !== -1) {
							// let file_name = ref.split('#/')[0];
							let ref_property = ref.split('#/')[1];
							let prop = ref_property.split('/')[0];
							// let term_definition = yaml.load(folderPath + '/' + file_name);
							if (term_definition[prop]) {
								property_data.relation = term_definition[prop].common !== undefined ? term_definition[prop].common : term_definition[prop];
							}
						}
					}
				}
			}
		}
	}
	return data;
}

const exportDelta = (req, res) => {
	let icdo3_prop = ["primary_diagnosis", "site_of_resection_or_biopsy", "tissue_or_organ_of_origin", "progression_or_recurrence_anatomic_site"];
	let data = [];
	let folderPath_old = path.join(__dirname, '../..', 'data_old');
	let old_data = {};
	let new_data = {};
	let gdc_values = shared.readGDCValues();
	let ncit_pv = shared.readNCItDetails();

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
				let category = new_data[key].category && new_data[key].category === 'administrative' ? 'case' : new_data[key].category;
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
						temp_data.n_c_pv = [];
						temp_data.i_c = "";
						temp_data.i_c_pv = "";
						// let cnp = category+'.'+node+'.'+property;
						let mappings = gdc_values[category + "." + node + "." + property] !== undefined ? gdc_values[category + "." + node + "." + property] : [];

						let map = mappings.find(({ nm }) => nm === em);

						if(temp_data.value_old === "no match" && temp_data.value_new !== "no match" && map !== undefined){
						  temp_data.n_c = Array.isArray(map.n_c) ? map.n_c.join('|') : map.n_c;
						  if(map.i_c !== undefined && map.i_c !== ''){
								temp_data.i_c = map.i_c;
								temp_data.i_c_pv = Array.isArray(map.i_c_s) ? map.i_c_s.join('|') : map.i_c_s;
								// temp_data.t_t = map.term_type;
						  }
						  for(let code of map.n_c){
								temp_data.n_c_pv.push(ncit_pv[code] !== undefined ? ncit_pv[code].preferredName : '');
						  }
						  temp_data.n_c_pv = Array.isArray(temp_data.n_c_pv) ? temp_data.n_c_pv.join('|') : tmp_data.n_c_pv;
						}

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
						temp_data.n_c_pv = [];
						temp_data.i_c = "";
						temp_data.i_c_pv = "";

						let mappings = gdc_values[category + "." + node + "." + property] !== undefined ? gdc_values[category + "." + node + "." + property] : [];

						let map = mappings.find(({ nm }) => nm === em);
						
						if(temp_data.value_old === "no match" && temp_data.value_new !== "no match" && map !== undefined){
						  temp_data.n_c = Array.isArray(map.n_c) ? map.n_c.join('|') : map.n_c;
						  if(map.i_c !== undefined && map.i_c !== ''){
								temp_data.i_c = map.i_c;
								temp_data.i_c_pv = Array.isArray(map.i_c_s) ? map.i_c_s.join('|') : map.i_c_s;
								// temp_data.t_t = map.term_type;
						  }
						  for(let code of map.n_c){
								temp_data.n_c_pv.push(ncit_pv[code] !== undefined ? ncit_pv[code].preferredName : '');
						  }
						  temp_data.n_c_pv = Array.isArray(temp_data.n_c_pv) ? temp_data.n_c_pv.join('|') : tmp_data.n_c_pv;
						}
						data.push(temp_data);
					});
				}
			}
		} else if (old_data[key] && new_data[key]) {
			// node exists in both old and new data
			let new_p_array = new_data[key].properties;
			let old_p_array = old_data[key].properties;

			//checking properties in new data
			for (let key_p in new_p_array) {
				let category =  new_data[key].category && new_data[key].category === 'administrative' ? 'case' : new_data[key].category;
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
							temp_data.n_c_pv = [];
							temp_data.i_c = "";
							temp_data.i_c_pv = "";

							let mappings = gdc_values[category + "." + node + "." + property] !== undefined ? gdc_values[category + "." + node + "." + property] : [];

							let map = mappings.find(({ nm }) => nm === em);

							if(temp_data.value_old === "no match" && temp_data.value_new !== "no match" && map !== undefined){
								temp_data.n_c = Array.isArray(map.n_c) ? map.n_c.join('|') : map.n_c;
								if(map.i_c !== undefined && map.i_c !== ''){
									temp_data.i_c = map.i_c;
									temp_data.i_c_pv = Array.isArray(map.i_c_s) ? map.i_c_s.join('|') : map.i_c_s;
									// temp_data.t_t = map.term_type;
								}
								for(let code of map.n_c){
									temp_data.n_c_pv.push(ncit_pv[code] !== undefined ? ncit_pv[code].preferredName : '');
								}
								temp_data.n_c_pv = Array.isArray(temp_data.n_c_pv) ? temp_data.n_c_pv.join('|') : tmp_data.n_c_pv;
							}

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
							temp_data.n_c_pv = [];
							temp_data.i_c = "";
							temp_data.i_c_pv = "";

							let mappings = gdc_values[category + "." + node + "." + property] !== undefined ? gdc_values[category + "." + node + "." + property] : [];

							let map = mappings.find(({ nm }) => nm === em);

							if(temp_data.value_old === "no match" && temp_data.value_new !== "no match" && map !== undefined){
								temp_data.n_c = Array.isArray(map.n_c) ? map.n_c.join('|') : map.n_c;
								if(map.i_c !== undefined && map.i_c !== ''){
									temp_data.i_c = map.i_c;
									temp_data.i_c_pv = Array.isArray(map.i_c_s) ? map.i_c_s.join('|') : map.i_c_s;
									// temp_data.t_t = map.term_type;
								}
								for(let code of map.n_c){
									temp_data.n_c_pv.push(ncit_pv[code] !== undefined ? ncit_pv[code].preferredName : '');
								}
								temp_data.n_c_pv = Array.isArray(temp_data.n_c_pv) ? temp_data.n_c_pv.join('|') : tmp_data.n_c_pv;
							}

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
							if (old_enums_array !== undefined && old_enums_array.indexOf(em) !== -1) {
								temp_data.value_old = em;
							} else {
								temp_data.value_old = "no match";
							}
							temp_data.n_c = "";
							temp_data.n_c_pv = [];
							temp_data.i_c = "";
							temp_data.i_c_pv = "";

							let mappings = gdc_values[category + "." + node + "." + property] !== undefined ? gdc_values[category + "." + node + "." + property] : [];

							let map = mappings.find(({ nm }) => nm === em);
							
							if(temp_data.value_old !== "no match" && map !== undefined){
								temp_data.n_c = Array.isArray(map.n_c) ? map.n_c.join('|') : map.n_c;
								if(map.i_c !== undefined && map.i_c !== ''){
									temp_data.i_c = map.i_c;
									temp_data.i_c_pv = Array.isArray(map.i_c_s) ? map.i_c_s.join('|') : map.i_c_s;
									// temp_data.t_t = map.term_type;
								}
								for(let code of map.n_c){
									temp_data.n_c_pv.push(ncit_pv[code] !== undefined ? ncit_pv[code].preferredName : '');
								}
								temp_data.n_c_pv = Array.isArray(temp_data.n_c_pv) ? temp_data.n_c_pv.join('|') : tmp_data.n_c_pv;
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
							if (new_enums_array !== undefined && new_enums_array.indexOf(em) === -1) {
								let temp_data = {};
								temp_data.c = category;
								temp_data.n = node;
								temp_data.p = property;
								temp_data.value_old = em;
								temp_data.value_new = "no match";
								temp_data.n_c = "";
								temp_data.n_c_pv = [];
								temp_data.i_c = "";
								temp_data.i_c_pv = "";

								let mappings = gdc_values[category + "." + node + "." + property] !== undefined ? gdc_values[category + "." + node + "." + property] : [];

								let map = mappings.find(({ nm }) => nm === em);
								
								if(temp_data.value_old !== "no match" && map !== undefined){
									temp_data.n_c = Array.isArray(map.n_c) ? map.n_c.join('|') : map.n_c;
									if(map.i_c !== undefined && map.i_c !== ''){
										temp_data.i_c = map.i_c;
										temp_data.i_c_pv = Array.isArray(map.i_c_s) ? map.i_c_s.join('|') : map.i_c_s;
										// temp_data.t_t = map.term_type;
									}
									for(let code of map.n_c){
										temp_data.n_c_pv.push(ncit_pv[code] !== undefined ? ncit_pv[code].preferredName : '');
									}
									temp_data.n_c_pv = Array.isArray(temp_data.n_c_pv) ? temp_data.n_c_pv.join('|') : tmp_data.n_c_pv;
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
							if (new_enums_array !== undefined && new_enums_array.indexOf(em) === -1) {
								let temp_data = {};
								temp_data.c = category;
								temp_data.n = node;
								temp_data.p = property;
								temp_data.value_old = em;
								temp_data.value_new = "no match";
								temp_data.n_c = "";
								temp_data.n_c_pv = [];
								temp_data.i_c = "";
								temp_data.i_c_pv = "";

								let mappings = gdc_values[category + "." + node + "." + property] !== undefined ? gdc_values[category + "." + node + "." + property] : [];

								let map = mappings.find(({ nm }) => nm === em);
								
								if(temp_data.value_old !== "no match" && map !== undefined){
									temp_data.n_c = Array.isArray(map.n_c) ? map.n_c.join('|') : map.n_c;
									if(map.i_c !== undefined && map.i_c !== ''){
										temp_data.i_c = map.i_c;
										temp_data.i_c_pv = Array.isArray(map.i_c_s) ? map.i_c_s.join('|') : map.i_c_s;
										// temp_data.t_t = map.term_type;
									}
									for(let code of map.n_c){
										temp_data.n_c_pv.push(ncit_pv[code] !== undefined ? ncit_pv[code].preferredName : '');
									}
									temp_data.n_c_pv = Array.isArray(temp_data.n_c_pv) ? temp_data.n_c_pv.join('|') : tmp_data.n_c_pv;
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
							if (old_enums_array !== undefined && old_enums_array.indexOf(em) !== -1) {
								temp_data.value_old = em;
							} else {
								temp_data.value_old = "no match";
							}
							temp_data.value_new = em;
							temp_data.n_c = "";
							temp_data.n_c_pv = [];
							temp_data.i_c = "";
							temp_data.i_c_pv = "";

							let mappings = gdc_values[category + "." + node + "." + property] !== undefined ? gdc_values[category + "." + node + "." + property] : [];

							let map = mappings.find(({ nm }) => nm === em);
							
							if(temp_data.value_old !== "no match" && map !== undefined){
								temp_data.n_c = Array.isArray(map.n_c) ? map.n_c.join('|') : map.n_c;
								if(map.i_c !== undefined && map.i_c !== ''){
									temp_data.i_c = map.i_c;
									temp_data.i_c_pv = Array.isArray(map.i_c_s) ? map.i_c_s.join('|') : map.i_c_s;
									// temp_data.t_t = map.term_type;
								}
								for(let code of map.n_c){
									temp_data.n_c_pv.push(ncit_pv[code] !== undefined ? ncit_pv[code].preferredName : '');
								}
								temp_data.n_c_pv = Array.isArray(temp_data.n_c_pv) ? temp_data.n_c_pv.join('|') : tmp_data.n_c_pv;
							}

							data.push(temp_data);
						});
					}
				}
			}
			// checking properties in old data
			for (let key_p in old_p_array) {
				let category =  new_data[key].category && new_data[key].category === 'administrative' ? 'case' : new_data[key].category;
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
							temp_data.n_c_pv = [];
							temp_data.i_c = "";
							temp_data.i_c_pv = "";
							// let cnp = category+'.'+node+'.'+property;

							let mappings = gdc_values[category + "." + node + "." + property] !== undefined ? gdc_values[category + "." + node + "." + property] : [];

							let map = mappings.find(({ nm }) => nm === em);
							
							if(temp_data.value_old !== "no match" && map !== undefined){
								temp_data.n_c = Array.isArray(map.n_c) ? map.n_c.join('|') : map.n_c;
								if(map.i_c !== undefined && map.i_c !== ''){
									temp_data.i_c = map.i_c;
									temp_data.i_c_pv = Array.isArray(map.i_c_s) ? map.i_c_s.join('|') : map.i_c_s;
									// temp_data.t_t = map.term_type;
								}
								for(let code of map.n_c){
									temp_data.n_c_pv.push(ncit_pv[code] !== undefined ? ncit_pv[code].preferredName : '');
								}
								temp_data.n_c_pv = Array.isArray(temp_data.n_c_pv) ? temp_data.n_c_pv.join('|') : tmp_data.n_c_pv;
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
							temp_data.n_c_pv = [];
							temp_data.i_c = "";
							temp_data.i_c_pv = "";
							// let cnp = category+'.'+node+'.'+property;



							let mappings = gdc_values[category + "." + node + "." + property] !== undefined ? gdc_values[category + "." + node + "." + property] : [];

							let map = mappings.find(({ nm }) => nm === em);
							
							if(temp_data.value_old !== "no match" && map !== undefined){
								temp_data.n_c = Array.isArray(map.n_c) ? map.n_c.join('|') : map.n_c;
								if(map.i_c !== undefined && map.i_c !== ''){
									temp_data.i_c = map.i_c;
									temp_data.i_c_pv = Array.isArray(map.i_c_s) ? map.i_c_s.join('|') : map.i_c_s;
									// temp_data.t_t = map.term_type;
								}
								for(let code of map.n_c){
									temp_data.n_c_pv.push(ncit_pv[code] !== undefined ? ncit_pv[code].preferredName : '');
								}
								temp_data.n_c_pv = Array.isArray(temp_data.n_c_pv) ? temp_data.n_c_pv.join('|') : tmp_data.n_c_pv;
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
	let result_data = [];
	let heading = [
		['Category | Node | Property', 'Total GDC Values','# Values Mapped to ICD-O-3','# Values Mapped to NCIt']
	];
	let specification = {
	
		cnp: {
			width: 200
		},
		v:{
			width: 200
		},
		i:{
			width: 200
		},
		s:{
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
		data.forEach(hit => {
			let source = hit._source;
			if(source.enum === undefined) return;
			let category = source.category;
			let node = source.node;
			let property = source.property;
			let enums = source.enum;
			let values_counter = enums.length;
			let ic_counter = 0;
			let syn_counter = 0;
			enums.forEach(em => {
				if(em.n_syn !== undefined) syn_counter++;
				if(em.i_c !== undefined) ic_counter++;
			});
			let result_obj = {};
			result_obj.cnp = category+"."+node+"."+property;
			result_obj.v = values_counter;
			result_obj.i = ic_counter;
			result_obj.s = syn_counter;
			result_data.push(result_obj);
		});
		const report = excel.buildExport(
			[ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report 
				{
					name: 'Report', // <- Specify sheet name (optional) 
					heading: heading, // <- Raw heading array (optional) 
					merges: merges, // <- Merge cell ranges 
					specification: specification, // <- Report specification 
					data: result_data // <-- Report data 
				}
			]
		);
		res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers) 
		res.send(report);
	});	
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
}

const ttNotAssigned = (req, res) => {
	let report_data = [];
	let heading = [
		['Category', 'Node', 'Property', 'Value', 'ICD-O-3', 'ICD-O-3 string with no term types']
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
		ic: {
			width: 200
		},
		ics: {
			width: 200
		}
	};
	const icdo3_property = [
		'morphology', 
		'primary_diagnosis', 
		'tissue_or_organ_of_origin', 
		'progression_or_recurrence_anatomic_site', 
		'site_of_resection_or_biopsy'];

	let query = {
		"match_all": {}
	}
	elastic.query(config.index_p, query, null, result => {
		if (result.hits === undefined) {
			return handleError.error(res, result);
		}
		let data = result.hits.hits;
		data.forEach(hit => {
			let source = hit._source;
			let category = source.category;
			let node = source.node;
			let property = source.property;
			if(icdo3_property.indexOf(property) !== -1){
				let enums = source.enum;
				enums.forEach(em => {
					if(em.ic_enum === undefined) return;
					em.ic_enum.forEach(ic => {
						if(ic.term_type === '*'){
							let result_obj = {};
							result_obj.c = category;
							result_obj.n = node;
							result_obj.p = property;
							result_obj.v = em.n;
							result_obj.ic = em.i_c.c;
							result_obj.ics = ic.n;
							report_data.push(result_obj);
						}
					});
				});
			}
		});
		const report = excel.buildExport(
			[ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report 
				{
					name: 'Report', // <- Specify sheet name (optional) 
					heading: heading, // <- Raw heading array (optional) 
					specification: specification, // <- Report specification 
					data: report_data // <-- Report data 
				}
			]
		);
		res.attachment('tt_not_assigned.xlsx'); // This is sails.js specific (in general you need to set headers) 
		res.send(report);
	});
}

module.exports = {
	releaseNote,
	exportAllValues,
	exportDelta,
	exportMapping,
	preProcess,
	addTermType,
	icdoMapping,
	exportMorphology,
	compareDataType,
	ttNotAssigned
}
