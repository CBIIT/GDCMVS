import template from './drug-table-view';
import { getHighlightObj, sortAlphabetically } from '../shared';

let termTypeNotAssigned = false;

export const dgRender = (items, keyword) => {
  termTypeNotAssigned = false;
  // data preprocessing
  let values = [];
  let valuesCount = 0;
  // options render
  let options = {};
  // RegExp Keyword
  // keyword = keyword.trim().replace(/[\ ,:_-]+/g, " ");
  items.forEach(data => {
    let enums = data.inner_hits.enum;
    if (enums.hits.total !== 0 && data._source.property === 'therapeutic_agents') { // If the searched term is cde id.
      let enumHits = enums.hits.hits;
      let obj = {};
      obj.category = data._source.category;
      obj.node = data._source.node;
      obj.property = data._source.property;
      obj.id = data._source.id;
      obj.cdeId = data._source.cde ? data._source.cde.id : undefined;
      obj.cdeUrl = data._source.cde ? data._source.cde.url : undefined;
      obj.vs = [];
      let highlightCdeId = data.highlight !== undefined && ('cde.id' in data.highlight) ? data.highlight['cde.id'] : undefined;
      if (highlightCdeId !== undefined) {
        if (data._source.enum !== undefined) obj.vs = getAllValues(data);
      }
      enumHits.forEach(hits => {
        let highlight = hits.highlight;

        let highlightValue = ('enum.n' in highlight) || ('enum.n.have' in highlight) ? highlight['enum.n'] || highlight['enum.n.have'] : undefined;
        let highlightValueObj = getHighlightObj(highlightValue);

        let highlightSyn = ('enum.n_syn.s.termName' in highlight) || ('enum.n_syn.s.termName.have' in highlight) ? highlight['enum.n_syn.s.termName'] || highlight['enum.n_syn.s.termName.have'] : undefined;
        let highlightSynObj = getHighlightObj(highlightSyn);

        let highlightNC = ('enum.n_syn.n_c' in highlight) || ('enum.n_syn.n_c.have' in highlight) ? highlight['enum.n_syn.n_c'] || highlight['enum.n_syn.n_c.have'] : undefined;
        let highlightNCObj = getHighlightObj(highlightNC);

        let highlightIC = ('enum.i_c.c' in highlight) || ('enum.i_c.have' in highlight) ? highlight['enum.i_c.c'] || highlight['enum.i_c.have'] : undefined;
        let highlightICObj = getHighlightObj(highlightIC);

        if (highlightCdeId === undefined) {
          let valueObj = {};
          let source = hits._source;
          let synCount = 0;
          valueObj.n = highlightValueObj[source.n] !== undefined ? highlightValueObj[source.n] : source.n;
          valueObj.src_n = source.n;
          if (source.n_syn !== undefined) {
            source.n_syn.forEach(data => {
              let newSyn = [];
              data.s.forEach(s => {
                let synObj = {};
                synObj.termName = highlightSynObj[s.termName] ? highlightSynObj[s.termName] : s.termName;
                synObj.termSource = s.termSource;
                synObj.termGroup = s.termGroup;
                newSyn.push(synObj);
              });
              synCount += data.s.length;
              data.n_c = highlightNCObj[data.n_c] ? highlightNCObj[data.n_c] : data.n_c;
              data.s = newSyn;
            });
            valueObj.n_syn = source.n_syn;
          }
          valueObj.synLen = synCount;
          valueObj.i_c = {};
          valueObj.i_c.c = source.i_c ? highlightICObj[source.i_c.c] ? highlightICObj[source.i_c.c] : source.i_c.c : undefined;
          if (source.ic_enum !== undefined) {
            valueObj.ic_enum = source.ic_enum;
            source.ic_enum.forEach(ic => {
              if (ic.term_type === '*') termTypeNotAssigned = true;
            });
          }
          obj.vs.push(valueObj);
        }
      });
      obj.vs = sortAlphabetically(obj.vs);
      valuesCount += obj.vs.length;
      values.push(obj);
    }
  });

  let html = '';
  let searchedKeyword = $('#keywords').val();
  if (termTypeNotAssigned === true) {
    $('unofficial-term').html('(*) Term type not assigned.');
  } else {
    $('#unofficial-term').html('');
  }
  if (values.length === 0 || (values.length === 1 && values[0].vs.length === 0)) {
    html =
      '<div class="indicator"><div class="indicator__content">Sorry, no results found for keyword: <span class="indicator__term">' +
      searchedKeyword + '</span></div></div>';
  } else {
    let offset = $('#root').offset().top;
    let h = window.innerHeight - offset - 310;
    options.height = (h < 430) ? 430 : h;
    options.keyword = searchedKeyword;
    html = template(values, options);
  }
  let result = {};
  result.len = valuesCount;
  result.html = html;
  return result;
};

const getAllValues = (data) => {
  termTypeNotAssigned = false;
  let values = [];
  let highlightValueObj = {};
  let highlightSynObj = {};
  let highlightNCObj = {};
  let highlightICObj = {};
  let innerHits = data.innerHits;
  if (innerHits !== undefined && innerHits.enum.hits.total !== 0) {
    let hits = innerHits.enum.hits.hits;
    hits.forEach(data => {
      let highlight = data.highlight;
      let highlightValue = ('enum.n' in highlight) || ('enum.n.have' in highlight) ? highlight['enum.n'] || highlight['enum.n.have'] : undefined;
      let highlightSyn = ('enum.n_syn.s.termName' in highlight) || ('enum.n_syn.s.termName.have' in highlight) ? highlight['enum.n_syn.s.termName'] || highlight['enum.n_syn.s.termName.have'] : undefined;
      let highlightNC = ('enum.n_syn.n_c' in highlight) || ('enum.n_syn.n_c.have' in highlight) ? highlight['enum.n_syn.n_c'] || highlight['enum.n_syn.n_c.have'] : undefined;
      let highlightIC = ('enum.i_c.c' in highlight) || ('enum.i_c.have' in highlight) ? highlight['enum.i_c.c'] || highlight['enum.i_c.have'] : undefined;
      if (highlightValue !== undefined) {
        highlightValue.forEach(val => {
          let tmp = val.replace(/<b>/g, '').replace(/<\/b>/g, '');
          if (highlightValueObj[tmp] === undefined) highlightValueObj[tmp] = val;
        });
      }
      if (highlightSyn !== undefined) {
        highlightSyn.forEach(val => {
          let tmp = val.replace(/<b>/g, '').replace(/<\/b>/g, '');
          if (highlightSynObj[tmp] === undefined) highlightSynObj[tmp] = val;
        });
      }
      if (highlightNC !== undefined) {
        highlightNC.forEach(val => {
          let tmp = val.replace(/<b>/g, '').replace(/<\/b>/g, '');
          if (highlightNCObj[tmp] === undefined) highlightNCObj[tmp] = val;
        });
      }
      if (highlightIC !== undefined) {
        highlightIC.forEach(val => {
          let tmp = val.replace(/<b>/g, '').replace(/<\/b>/g, '');
          if (highlightICObj[tmp] === undefined) highlightICObj[tmp] = val;
        });
      }
    });
  }

  data._source.enum.forEach(val => {
    let valueObj = {};
    valueObj.n = highlightValueObj[val.n] ? highlightValueObj[val.n] : val.n;
    valueObj.i_c = {};
    if (val.i_c !== undefined) valueObj.i_c.c = highlightICObj[val.i_c.c] ? highlightICObj[val.i_c.c] : val.i_c.c;
    if (val.n_syn !== undefined) {
      val.n_syn.forEach(data => {
        let newSyn = [];
        data.s.forEach(s => {
          let synObj = {};
          synObj.termName = highlightSynObj[s.termName] ? highlightSynObj[s.termName] : s.termName;
          synObj.termSource = s.termSource;
          synObj.termGroup = s.termGroup;
          newSyn.push(synObj);
        });
        data.n_c = highlightNCObj[data.n_c] ? highlightNCObj[data.n_c] : data.n_c;
        data.s = newSyn;
      });
      valueObj.n_syn = val.n_syn;
    }
    if (val.ic_enum !== undefined) {
      val.ic_enum.forEach(ic => {
        if (ic.term_type === '*') termTypeNotAssigned = true;
      });
      valueObj.ic_enum = val.ic_enum;
    }
    values.push(valueObj);
  });
  values = sortAlphabetically(values);
  return values;
};