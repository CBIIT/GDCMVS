/**
 * Client for elasticsearch
 */

'use strict';

const fs = require('fs');
const path = require('path');
const elasticsearch = require('elasticsearch');
const yaml = require('yamljs');
const config = require('../config');
const config_dev = require('../config/dev');
const logger = require('./logger');
const caDSR = require('./caDSR');
const extend = require('util')._extend;
const _ = require('lodash');
const report = require('../service/search/report');
const searchable_nodes = require('../config').searchable_nodes;
const drugs_properties = require('../config').drugs_properties;
const shared = require('../service/search/shared');
const folderPath = path.join(__dirname, '..', 'data');
var allTerm = {};
var cdeData = '';
var allProperties = [];

var esClient = new elasticsearch.Client({
  host: config_dev.elasticsearch.host,
  log: config_dev.elasticsearch.log,
  requestTimeout: config_dev.elasticsearch.timeout
});

const parseRef = (ref, termsJson, defJson) => {
  let name = ref.split('/')[1];
  if (name === undefined) {
    return {
      '$ref': ref
    };
  }
  if (ref.indexOf('_terms.yaml') === 0) {  
    return termsJson[name].common;
  } else if (ref.indexOf('_definitions.yaml') === 0) {
    return defJson[name];
  } else {
    return {
      '$ref': ref
    };
  }
};

const parseRefYaml = (ref, termsJson, defJson) => {
  let data = {};
  let fileName = ref.split('#/')[0];
  let remmainingRef = ref.split('#/')[1];
  let title = remmainingRef.split('/')[0];
  let titleValue = remmainingRef.split('/')[1];
  if (fileName.indexOf('.yaml') !== -1) {
    let refJson = yaml.load(folderPath + '/' + fileName);
    let tmp = refJson[title];
    data.enum = tmp[titleValue].enum;
    if (tmp[titleValue]) {
      data = extend(data, parseRef(tmp[titleValue].$ref[0], termsJson, defJson));
    }
    return data;
  } else {
    return {
      '$ref': ref
    };
  }
};

const helper = (fileJson, termsJson, defJson, gdc_values, syns) => {
  let doc = {};
  let propsRaw = fileJson.properties;
  // correct properties format
  doc = extend(fileJson, {});
  delete doc['$schema'];
  doc.properties = [];
  doc.suggestion = {};
  doc.suggestion.input = [];
  for (var prop in propsRaw) {
    let entry = {};
    let p = {};
    let entryRaw = propsRaw[prop];
    // remove break line break in dictionary
    if (entryRaw.enum !== undefined && entryRaw.enum.length > 0) {
      for (let key in entryRaw.enum) {
        entryRaw.enum[key] = entryRaw.enum[key].toString().replace('\n', ' ').replace('  ', ' ');
      }
    }
    // checking type array structure
    if (entryRaw.items !== undefined) {
      entryRaw.enum = entryRaw.items.enum;
      delete entryRaw.items;
    }
    if (prop === '$ref') {
      let idx = entryRaw[0].indexOf('/');
      entry.property = entryRaw[0].substr(idx + 1);
      entry = extend(entry, parseRef(entryRaw[0], termsJson, defJson));
    } else {
      entry.property = prop;
      if (entryRaw['$ref'] !== undefined) {
        let ref = Array.isArray(entryRaw['$ref']) ? entryRaw['$ref'][0] : entryRaw['$ref'];
        if (ref.indexOf('_terms.yaml') === -1 && ref.indexOf('_definitions.yaml') === -1) {
          entry = extend(entry, parseRefYaml(ref, termsJson, defJson));
        } else {
          entry = extend(entry, parseRef(ref, termsJson, defJson));
        }
        delete entryRaw['$ref'];
        entry = extend(entry, entryRaw);

        if (entry.termDef !== undefined && entry.termDef.cde_id !== undefined && entry.termDef.cde_id !== null) {
          entry.termDef.cde_id = '' + entry.termDef.cde_id;
          if (entry.termDef.source === 'caDSR') {
            entry.syns = cdeData[entry.termDef.cde_id];
            if (entry.syns !== undefined && entry.syns.length > 0) {
              entry.cde_len = entry.syns.length;
            }
          } else if (entry.termDef.source === 'NCIt') {
            p.ncit = {};
            p.ncit.id = entry.termDef.cde_id;
            p.ncit.url = entry.termDef.term_url;
          }
        }
      } else {
        entry = extend(entry, entryRaw);
      }
    }
    if (fileJson.category === 'administrative') fileJson.category = 'case';
    let prop_full_name = fileJson.category + '.' + fileJson.id + '.' + prop;
    // add conceptcode
    if (prop_full_name in gdc_values) {
      let values = gdc_values[prop_full_name];
      let enums = [];
      entry.syns = [];
      // add additionalProperties

      values.forEach((value) => {
        enums.push(value.nm);
        let tmp = {};
        tmp.pv = value.nm;
        tmp.pvc = value.n_c;

        tmp.syn = [];
        tmp.aprop = [];
        tmp.definitions = [];

        tmp.code = value.i_c !== '' ? value.i_c : undefined;
        tmp.term_type = value.term_type !== '' ? value.term_type : undefined;
        if (value.n_c !== undefined && value.n_c !== '') {
          value.n_c.forEach((ncit, index) => {
            tmp.definitions.push(tmp.pvc[index] !== '' && syns[tmp.pvc[index]] !== undefined && syns[tmp.pvc[index]].definitions !== undefined ? syns[tmp.pvc[index]].definitions : []);
            tmp.syn.push(tmp.pvc[index] !== '' && syns[tmp.pvc[index]] ? syns[tmp.pvc[index]].synonyms : []);
            tmp.aprop.push(tmp.pvc[index] !== '' && syns[tmp.pvc[index]] && syns[tmp.pvc[index]].additionalProperties !== undefined ? syns[tmp.pvc[index]].additionalProperties : []);
          });
        }
        entry.syns.push(tmp);
      });

      if (entry.enum === undefined) {
        entry.enum = enums;
      }
    }
    doc.properties.push(entry);

    // building typeahead index
    if (entry.property in allTerm) {
      // if exist, then check if have the same type
      let t = allTerm[entry.property];
      if (t.indexOf('property') === -1) {
        t.push('property');
      }
    } else {
      let t = [];
      t.push('property');
      allTerm[entry.property] = t;
    }

    let enums = [];
    if (entry.enum !== undefined) {
      enums = entry.enum;
    } else if (entry.oneOf !== undefined && Array.isArray(entry.oneOf)) {
      entry.oneOf.forEach(em => {
        if (em.enum !== undefined) {
          enums = enums.concat(em.enum);
        }
      });
    }

    // build type ahead index for CDE ID
    if (entry.termDef !== undefined && entry.termDef.source === 'caDSR' && entry.termDef.cde_id !== undefined && entry.termDef.cde_id !== null) {
      let em = entry.termDef.cde_id.toString().trim().toLowerCase();
      if (em in allTerm) {
        // if exist, then check if have the same type
        let t = allTerm[em];
        if (t.indexOf('cde id') === -1) {
          t.push('cde id');
        }
      } else {
        let t = [];
        t.push('cde id');
        allTerm[em] = t;
      }
    }
    // generate property index
    p.property = entry.property;
    p.node = fileJson.id;
    p.node_desc = fileJson.description;
    p.category = fileJson.category;
    if (entry.description === undefined) {
      if (entry.termDef !== undefined && entry.termDef.description !== undefined) {
        p.property_desc = entry.termDef.description;
      } else {
        p.property_desc = '';
      }
    } else {
      p.property_desc = entry.description;
    }
    if (entry.termDef !== undefined && entry.termDef.source === 'caDSR' && entry.termDef.cde_id !== undefined && entry.termDef.cde_id !== null) {
      p.cde = {};
      p.cde.id = entry.termDef.cde_id;
      p.cde.v = entry.termDef.cde_version;
      p.cde.url = entry.termDef.term_url;
    }
    // generate enum
    if (entry.syns === undefined) {
      // simple enumeration
      if (entry.enum !== undefined && entry.enum.length > 0) {
        p.enum = [];
        entry.enum.forEach(item => {
          let tmp = {};
          tmp.n = item;
          p.enum.push(tmp);
        });
      }
    } else {
      // has gdc synonyms
      if ((prop_full_name in gdc_values)) {
        p.enum = [];
        entry.enum.forEach(item => {
          let tmp = {};
          let syn = entry.syns.find(s => s.pv === item);

          if (syn !== undefined) {
            if (syn.term_type) {
              tmp.term_type = syn.term_type;
            }
            tmp.n = syn.pv;
            if (syn.code !== undefined) {
              tmp.i_c = {};
              tmp.i_c.c = syn.code;
              let ts = [];

              if (syn.code.indexOf('C') >= 0) {
                // ICD-O-3 code with C
                // check if it's a range in level 2
                if (syn.code.indexOf('-') >= 0) {
                  let r = syn.code.split('-');
                  let start = parseInt(r[0].substr(1));
                  let end = parseInt(r[1].substr(1));
                  for (let i = start; i <= end; i++) {
                    if (i < 10) {
                      ts.push('C0' + i);
                    } else {
                      ts.push('C' + i);
                    }
                  }
                } else if (syn.code.indexOf('.') >= 0) {
                  // check if it has '/' in the code
                  let idx = syn.code.indexOf('.');
                  let l2 = syn.code.substr(0, idx);
                  let l3 = syn.code;
                  ts.push(l2);
                  ts.push(l3);
                } else {
                  ts.push(syn.code);
                }
              } else {
                // regular ICD-O-3 code
                // check if it's a range in level 2
                if (syn.code.indexOf('-') >= 0) {
                  let r = syn.code.split('-');
                  let start = parseInt(r[0]);
                  let end = parseInt(r[1]);
                  for (let i = start; i <= end; i++) {
                    ts.push(i);
                  }
                } else if (syn.code.indexOf('/') >= 0) {
                  // check if it has '/' in the code
                  let idx = syn.code.indexOf('/');
                  let l3 = syn.code.substr(0, idx);
                  let l4 = syn.code;
                  let l2 = l3.substr(0, l3.length - 1);
                  ts.push(l2);
                  ts.push(l3);
                  ts.push(l4);
                } else {
                  ts.push(syn.code);
                }
              }

              tmp.i_c.have = ts;
              tmp.i_c.have = ts;
              tmp.i_c.have = ts;
            }
            tmp.n_c = syn.pvc;
            tmp.s = syn.syn;
            tmp.ap = syn.aprop;
            tmp.def = syn.definitions;
          } else {
            tmp.n = item;
          }
          p.enum.push(tmp);
        });
      } else {
        if (entry.enum !== undefined && entry.enum.length > 0) {
          p.enum = [];
          entry.enum.forEach(item => {
            let tmp = {};
            tmp.n = item;
            p.enum.push(tmp);
          });
        }
      }
    }
    // property type
    if (entry.enum !== undefined && entry.enum.length > 0) {
      if (entry.type === 'array') {
        p.type = 'array';
      } else {
        p.type = 'enum';
      }
    } else if (entry.type === undefined && entry.oneOf !== undefined && entry.oneOf.length > 0) {
      let types = [];
      entry.oneOf.forEach(elem => {
        types.push(elem.type);
      });
      p.type = types.join(' | ');
    } else {
      let type = typeof (entry.type);
      let isArray = Array.isArray(entry.type);
      p.type = '';
      if (type === 'string') p.type = entry.type;
      if (type === 'object' && !isArray) p.type = entry.type.type;
      if (type === 'object' && isArray) p.type = entry.type;
    }
    allProperties.push(p);
  }
  return doc;
};

const extendDef = (termsJson, defJson) => {
  for (var d in defJson) {
    let df = defJson[d];
    if (df.term !== undefined) {
      let idx = df.term["$ref"].indexOf('/');
      let termName = df.term["$ref"].substr(idx + 1);
      df.term = termsJson[termName];
    }
  }
}

const bulkIndex = next => {
  let deprecated_properties = [];
  let deprecated_enum = [];
  fs.readdirSync(folderPath).forEach(file => {
    if (file.indexOf('_') !== 0) {
      let fileJson = yaml.load(folderPath + '/' + file);
      if(fileJson.category === 'administrative') fileJson.category = 'case';
      let category = fileJson.category;
      let node = fileJson.id;

      if (fileJson.deprecated) {
        fileJson.deprecated.forEach(d_p => {
          let tmp_d_p = category + "." + node + "." + d_p;
          deprecated_properties.push(tmp_d_p.trim().toLowerCase());
        })
      }

      for (let keys in fileJson.properties) {
        if (fileJson.properties[keys].deprecated_enum) {
          fileJson.properties[keys].deprecated_enum.forEach(d_e => {
            let tmp_d_e = category + "." + node + "." + keys + "." + d_e;
            deprecated_enum.push(tmp_d_e.trim().toLowerCase());
          });
        }
      }
    }
  });
  
  let ccode = shared.readConceptCode();
  let gdc_values = shared.readGDCValues();
  let syns = shared.readNCItDetails();

  cdeData = shared.readCDEData();
  var termsJson = yaml.load(folderPath + '/_terms.yaml');
  var defJson = yaml.load(folderPath + '/_definitions.yaml');
  extendDef(termsJson, defJson);
  // let bulkBody = [];
  fs.readdirSync(folderPath).forEach(file => {
    if (file.indexOf('_') !== 0) {
      let fileJson = yaml.load(folderPath + '/' + file);
      if(fileJson.category === 'administrative') fileJson.category = 'case';
      if (fileJson.category !== "TBD" && fileJson.id !== "metaschema" && searchable_nodes.indexOf(fileJson.id) !== -1) {
        logger.debug(folderPath + '/' + file);
        for (let keys in fileJson.properties) {
          if (fileJson.properties[keys].deprecated_enum) {
            if (fileJson.properties[keys].items) {
              fileJson.properties[keys].items.enum = _.differenceWith(fileJson.properties[keys].items.enum, fileJson.properties[keys].deprecated_enum, _.isEqual);
            } else {
              fileJson.properties[keys].enum = _.differenceWith(fileJson.properties[keys].enum, fileJson.properties[keys].deprecated_enum, _.isEqual);
            }
          }
          if (fileJson.deprecated && deprecated_properties.indexOf(fileJson.category + "." + fileJson.id + "." + keys) !== -1) {
            delete fileJson.properties[keys];
          }
        }
        helper(fileJson, termsJson, defJson, gdc_values, syns);
      }
    }
  });
  let gdc_data = {};
  fs.readdirSync(folderPath).forEach(file => {
    gdc_data[file.replace('.yaml', '')] = yaml.load(folderPath + '/' + file);
  });
  gdc_data = report.preProcess(searchable_nodes, gdc_data);

  // build suggestion index
  let suggestionBody = [];

  // Type ahead suggestions for GDC Values
  for (let node in gdc_data) {
    if (gdc_data[node].properties !== undefined) {
      for (let propperty in gdc_data[node].properties) {
        let prop_data = gdc_data[node].properties[propperty];
        if (prop_data.enum) {
          if (prop_data.new_enum) {
            prop_data.new_enum.forEach(enm => {
              let em = enm.toString().trim().toLowerCase();
              if (em in allTerm) {
                // if exist, then check if have the same type
                let t = allTerm[em];
                if (t.indexOf("value") == -1) {
                  t.push("value");
                }
              } else {
                let t = [];
                t.push("value");
                allTerm[em] = t;
              }
            });
          } else {
            prop_data.enum.forEach(enm => {
              let em = enm.toString().trim().toLowerCase();
              if (em in allTerm) {
                // if exist, then check if have the same type
                let t = allTerm[em];
                if (t.indexOf("value") == -1) {
                  t.push("value");
                }
              } else {
                let t = [];
                t.push("value");
                allTerm[em] = t;
              }
            });
          }
        }
        if (prop_data.items !== undefined) {
          prop_data.items.enum.forEach(enm => {
            let em = enm.toString().trim().toLowerCase();
            if (em in allTerm) {
              // if exist, then check if have the same type
              let t = allTerm[em];
              if (t.indexOf("value") == -1) {
                t.push("value");
              }
            } else {
              let t = [];
              t.push("value");
              allTerm[em] = t;
            }
          });
        }
      }
    }
  }

  // type ahead suggestions for NCIt Codes.
  if (ccode) {
    for (let key in ccode) {
      for (let ncit_value in ccode[key]) {
        let ncit_code = ccode[key][ncit_value];
        if (ncit_code !== "") {
          let em = ncit_code.toString().trim().toLowerCase();
          if (em in allTerm) {
            //if exist, then check if have the same type
            let t = allTerm[em];
            if (t.indexOf("ncit code") == -1) {
              t.push("ncit code");
            }
          } else {
            let t = [];
            t.push("ncit code");
            allTerm[em] = t;
          }
        }
      }
    }
  }
  // type ahead for ICDO3 codes
  if (gdc_values) {
    for (let key in gdc_values) {
      gdc_values[key].forEach((values) => {
        let icdo3_code = values.i_c;
        let ncit_codes = values.n_c;
        if (icdo3_code !== "") {
          let em = icdo3_code.toString().trim().toLowerCase();
          if (em in allTerm) {
            // if exist, then check if have the same type
            let t = allTerm[em];
            if (t.indexOf("icdo3 code") == -1) {
              t.push("icdo3 code");
            }
          } else {
            let t = [];
            t.push("icdo3 code");
            allTerm[em] = t;
          }
        }
        if (ncit_codes !== "") {
          ncit_codes.forEach((ncit) => {
            let em = ncit.toString().trim().toLowerCase();
            if (em in allTerm) {
              // if exist, then check if have the same type
              let t = allTerm[em];
              if (t.indexOf("ncit code") == -1) {
                t.push("ncit code");
              }
            } else {
              let t = [];
              t.push("ncit code");
              allTerm[em] = t;
            }
          });
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

  let ncitDetail = [];
  for (let conceptCode in syns) {
    let doc = {};
    doc.id = conceptCode.toString();

    doc.data = {};
    doc.data.additionalProperties = syns[conceptCode].additionalProperties !== undefined ? syns[conceptCode].additionalProperties : [];
    doc.data.code = syns[conceptCode].code !== undefined ? syns[conceptCode].code : '';
    doc.data.definitions = syns[conceptCode].definitions !== undefined ? syns[conceptCode].definitions : [];
    doc.data.synonyms = syns[conceptCode].synonyms !== undefined ? syns[conceptCode].synonyms : [];
    doc.data.preferredName = syns[conceptCode].preferredName !== undefined ? syns[conceptCode].preferredName : '';

    ncitDetail.push({
      index: {
        _index: config.ncitDetails,
        _type: 'props',
        _id: doc.id
      }
    });
    ncitDetail.push(doc);
  }
  // build property index
  let propertyBody = [];

  allProperties.forEach(p => {
    let node = p.node;
    let property = p.property;
    if (gdc_data[node] && gdc_data[node].properties && gdc_data[node].properties[property] && gdc_data[node].properties[property].enum) {
      if (p.enum) {
        let checker_enum = JSON.parse(JSON.stringify(gdc_data[node].properties[property].enum)).map(ems => {return ems.trim().toLowerCase()});
        p.enum.forEach(em => {
          em.gdc_d = checker_enum.indexOf(em.n.trim().toLowerCase()) !== -1 ? true : false;
          // check if enum propeties is drug value
          em.drug = drugs_properties.indexOf(property) !== -1 ? true : false;
        });
      }
    }
  });
  let all_icdo3_syn = {};
  let all_icdo3_enums = {};
  // Collecting all enums ICDO3 code
  allProperties.forEach(result => {
    if (result.enum === undefined) return;
    result.enum.forEach(item => {
      if (item.i_c === undefined) return;
      if (item.i_c.c && all_icdo3_enums[item.i_c.c] === undefined && item.n !== item.i_c.c) {
        all_icdo3_enums[item.i_c.c] = { n: item.term_type !== undefined && item.term_type !== "" ? [item.n +" ("+item.term_type+")"] : [item.n +" (*)"], checker_n: [item.n] };
        if (item.term_type !== undefined && item.term_type !== "") {
          all_icdo3_enums[item.i_c.c].n = [{n: item.n, term_type: item.term_type}];
        } else {
          all_icdo3_enums[item.i_c.c].n = [{n: item.n, term_type: "*"}];
        }
      } else if (item.i_c.c && all_icdo3_enums[item.i_c.c] !== undefined && item.n !== item.i_c.c && all_icdo3_enums[item.i_c.c].checker_n.indexOf(item.n) === -1) {
        if (item.term_type !== undefined && item.term_type !== "") {
          if (item.term_type === "PT") all_icdo3_enums[item.i_c.c].n.unshift({n: item.n, term_type: item.term_type});
          if (item.term_type !== "PT") all_icdo3_enums[item.i_c.c].n.push({n: item.n, term_type: item.term_type});
        } else {
          all_icdo3_enums[item.i_c.c].n.push({n: item.n, term_type: "*"});
        }
        all_icdo3_enums[item.i_c.c].checker_n.push(item.n);
      }
    });
  });
  // Collecting all synonyms and ncit in one array for particular ICDO3 code
  allProperties.forEach(result => {
    if (result.enum === undefined) return;
    result.enum.forEach(item => {
      if (item.i_c !== undefined) { // If it has icdo3 code.
        if (item.i_c.c && all_icdo3_syn[item.i_c.c] === undefined) {
          all_icdo3_syn[item.i_c.c] = { n_syn: [], checker_n_c: item.n_c.lenght !== 0 ? item.n_c : [], all_syn: [] };
          if (item.n_c !== undefined && item.n_c !== '') {
            item.n_c.forEach((nc, i) => {
              all_icdo3_syn[item.i_c.c].n_syn.push({ n_c: item.n_c[i], s: item.s[i], ap: item.ap[i], def: item.def[i] });
              all_icdo3_syn[item.i_c.c].all_syn = all_icdo3_syn[item.i_c.c].all_syn.concat(item.s[i]);
            });
          }
        } else if (all_icdo3_syn[item.i_c.c] !== undefined) {
            if (item.n_c !== undefined && item.n_c !== '') {
              if (item.n_c.every(n_c => all_icdo3_syn[item.i_c.c].checker_n_c.indexOf(n_c) === -1)){
                item.n_c.forEach((nc, i) => {
                  all_icdo3_syn[item.i_c.c].n_syn.push({ n_c: item.n_c[i], s: item.s[i], ap: item.ap[i], def: item.def[i] });
                  all_icdo3_syn[item.i_c.c].checker_n_c.push(item.n_c[i]);
                  all_icdo3_syn[item.i_c.c].all_syn = all_icdo3_syn[item.i_c.c].all_syn.concat(item.s[i]);
                });
              }
            }
        }
      } else { // If it doesn't have icdo3 code
        if (item.n_c !== undefined && item.n_c !== '') {
          item.n_syn = [];
          item.n_c.forEach((nc, i) => {
            item.n_syn.push({ n_c: item.n_c[i], s: item.s[i], ap: item.ap[i], def: item.def[i] });
          });
          delete item.n_c;
          delete item.s;
          delete item.ap;
          delete item.def;
        }
      }
    });
  });

  allProperties.forEach(result => {
    if (result.enum === undefined) return;
    result.enum.forEach(item => {
      if (item.i_c === undefined) return;
      if (all_icdo3_syn[item.i_c.c]) {
        item.n_syn = [];
        item.n_syn = all_icdo3_syn[item.i_c.c].n_syn.length > 0 ? all_icdo3_syn[item.i_c.c].n_syn : undefined;
        delete item.n_c;
        delete item.s;
        delete item.ap;
        delete item.def;
      }
      if (all_icdo3_enums[item.i_c.c]) {
        item.ic_enum = [];
        item.ic_enum = all_icdo3_enums[item.i_c.c].n.length > 0 ? all_icdo3_enums[item.i_c.c].n : undefined;
      }
    });
  });

  // Removing redundant values
  let check_enums = {};
  allProperties.forEach(result => {
    if(result.enum === undefined) return;
    let id = result.property+"@"+result.node+"@"+result.category;
    let new_enum = [];
    result.enum.forEach(item => {
      if (check_enums[id] === undefined) {
        check_enums[id] = [];
        check_enums[id].push(item.n);
        new_enum.push(item);
      } else if (check_enums[id] !== undefined && check_enums[id].indexOf(item.n) === -1) {
        check_enums[id].push(item.n);
        new_enum.push(item);
      }
    });
    result.enum = new_enum;
  });

  // Remove non-gdc values
  allProperties.forEach(result => {
    if(result.enum === undefined) return;
    let new_enum = [];
    result.enum.forEach(item => {
      if(item.gdc_d === true) new_enum.push(item);
    });
    result.enum = new_enum;
  });

  allProperties.forEach(ap => {
    let doc = extend(ap, {});
    doc.id = ap.property + "/" + ap.node + "/" + ap.category;
    propertyBody.push({
      index: {
        _index: config.index_p,
        _type: 'props',
        _id: doc.id
      }
    });
    propertyBody.push(doc);
  });
  esClient.bulk({body: propertyBody}, (err_p, data_p) => {
    if (err_p) {
      return next(err_p);
    }
    let errorCount_p = 0;
    data_p.items.forEach(item => {
      if (item.index && item.index.error) {
        logger.error(++errorCount_p, item.index.error);
      }
    });
    esClient.bulk({body: suggestionBody}, (err_s, data_s) => {
      if (err_s) {
        return next(err_s);
      }
      let errorCount_s = 0;
      data_s.items.forEach(itm => {
        if (itm.index && itm.index.error) {
          logger.error(++errorCount_s, itm.index.error);
        }
      });
      esClient.bulk({body: ncitDetail}, (err_s, data_s) => {
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
          suggestion_total: suggestionBody.length,
          ncit_details: ncitDetail.length
        });
      });
    });
  });
}
exports.bulkIndex = bulkIndex;

const query = (index, dsl, highlight, next) => {
  var body = {
    size: 10000000,
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
  esClient.search({index: index, body: body}, (err, data) => {
    if (err) {
      logger.error(err);
      next(err);
    } else {
      next(data);
    }
  });
}

exports.query = query;

const ncitDetails = (index, dsl, next) => {
  let body = {};
  body.query = dsl;
  esClient.search({index: index, "_source": true, body: body}, (err, data) => {
    if (err) {
      logger.error(err);
      next(err);
    } else {
      next(data);
    }
  });
}

exports.ncitDetails = ncitDetails;

const suggest = (index, suggest, next) => {
  let body = {};
  body.suggest = suggest;
  esClient.search({index: index, "_source": true, body: body}, (err, data) => {
    if (err) {
      logger.error(err);
      next(err);
    } else {
      next(data);
    }
  });
}

exports.suggest = suggest;

const createIndexes = (params, next) => {
  esClient.indices.create(params[0], (err_2, result_2) => {
    if (err_2) {
      logger.error(err_2);
      next(err_2);
    } else {
      esClient.indices.create(params[1], (err_3, result_3) => {
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

const preloadDataFromCaDSR = next => {
  let termsJson = yaml.load(folderPath + '/_terms.yaml');
  let cdeDataJson = shared.readCDEData();

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
    caDSR.loadData(ids, data => {
      return next(data);
    });
  } else {
    return next('CDE data Refreshed!!');
  }
}

exports.preloadDataFromCaDSR = preloadDataFromCaDSR;

const preloadDataTypeFromCaDSR = next => {
  let cdeDataJson = shared.readCDEData();
  let ids = [];
  for (var term in cdeDataJson) {
    let detail = cdeDataJson[term];
    if (detail.length == 0) {
      ids.push(term);
    }
  }
  if (ids.length > 0) {
    fs.truncate('./server/data_files/cdeDataType.js', 0, () => {
      console.log('cdeDataType.js truncated')
    });
    caDSR.loadDataType(ids, data => {
      return next(data);
    });
  } else {
    return next('CDE data Refreshed!!');
  }
}

exports.preloadDataTypeFromCaDSR = preloadDataTypeFromCaDSR;

const loadSynonyms = next => {
  caDSR.loadSynonyms(data => {
    return next(data);
  });
}

const loadNcitSynonyms_list = next => {
  caDSR.loadNcitSynonyms_list(data => {
    return next(data);
  });
}

exports.loadNcitSynonyms_list = loadNcitSynonyms_list;

exports.loadSynonyms = loadSynonyms;

const loadSynonyms_continue = next => {
  caDSR.loadNcitSynonyms_continue(data => {
    return next(data);
  });
}

exports.loadSynonyms_continue = loadSynonyms_continue;

const loadSynonymsCtcae = next => {
  caDSR.loadSynonymsCtcae(data => {
    return next(data);
  });
}

exports.loadSynonymsCtcae = loadSynonymsCtcae;

const loadCtcaeSynonyms_continue = next => {
  caDSR.loadCtcaeSynonyms_continue(data => {
    return next(data);
  });
}

exports.loadCtcaeSynonyms_continue = loadCtcaeSynonyms_continue;
