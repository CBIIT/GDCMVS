import template from './values-table-view';
import { getHeaderOffset, getHighlightObj, sortAlphabetically, sortSynonyms } from '../shared';

let termTypeNotAssigned = false;

const tableToggleHandle = (event) => {
  event.preventDefault();
  const $this = $(event.currentTarget);
  const $target = $this.closest('.table__gdc-values, .table__cde-values').find('.data-content');
  $target.slideToggle(400, () => {
    if ($target.is(':visible')) {
      $this.attr('title', 'collapse');
      $this.attr('aria-label', 'collapse');
      $this.attr('aria-expanded', 'true');
      $this.html('<i class="fa fa-minus"></i>');
    } else {
      $this.attr('title', 'expand');
      $this.attr('aria-label', 'expand');
      $this.attr('aria-expanded', 'false');
      $this.html('<i class="fa fa-plus"></i>');
    }
  });
};

const detailsToggleHandle = (event) => {
  event.preventDefault();
  const $this = $(event.currentTarget);
  const $target = $this.parent().find('.gdc-links');
  $target.slideToggle(350, () => {
    if ($target.is(':visible')) {
      $this.attr('aria-expanded', 'true');
    } else {
      $this.attr('aria-expanded', 'false');
    }
  });
};

const suggestNotificationHandle = (event) => {
  event.preventDefault();
  const alertSuggest = $('#alert-suggest');
  alertSuggest.css({ 'top': (getHeaderOffset() + 20) + 'px' }).addClass('alert__show');
  setTimeout(() => { alertSuggest.removeClass('alert__show'); }, 3900);
};

const showMoreToggleHandle = (event) => {
  event.preventDefault();
  const $this = $(event.currentTarget);
  const $target = $this.closest('.table__values').find('.table__row--toggle');
  if ($this.hasClass('more')) {
    $this.removeClass('more');
    $this.attr('aria-expanded', 'false');
    $target.slideToggle(350);
    $this.html('<i class="fa fa-angle-down"></i> Show More (' + $this.attr('data-hidden') + ')');
  } else {
    $this.addClass('more');
    $this.attr('aria-expanded', 'true');
    $target.slideToggle(350);
    $this.html('<i class="fa fa-angle-up"></i> Show Less');
  }
};

export const vsRender = (items, keyword) => {
  termTypeNotAssigned = false;
  // data preprocessing
  let values = [];
  let valuesCount = 0;
  // options render
  let options = {};
  items.forEach(data => {
    let enums = data.inner_hits.enum;
    if (enums.hits.total !== 0) { // If the searched term is cde id.
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

        let highlightSyn = ('enum.n_syn.s.tn' in highlight) || ('enum.n_syn.s.tn.have' in highlight) ? highlight['enum.n_syn.s.tn'] || highlight['enum.n_syn.s.tn.have'] : undefined;
        let highlightSynObj = getHighlightObj(highlightSyn);

        let highlightNC = ('enum.n_syn.n_c' in highlight) || ('enum.n_syn.n_c.have' in highlight) ? highlight['enum.n_syn.n_c'] || highlight['enum.n_syn.n_c.have'] : undefined;
        let highlightNCObj = getHighlightObj(highlightNC);

        let highlightIC = ('enum.i_c.c' in highlight) || ('enum.i_c.have' in highlight) ? highlight['enum.i_c.c'] || highlight['enum.i_c.have'] : undefined;
        let highlightICObj = getHighlightObj(highlightIC);

        if (highlightCdeId === undefined) {
          let valueObj = {};
          let source = hits._source;
          valueObj.n = highlightValueObj[source.n] !== undefined ? highlightValueObj[source.n] : source.n;
          valueObj.src_n = source.n;
          valueObj.drug = source.drug;
          if (source.n_syn !== undefined) {
            source.n_syn.forEach(data => {
              let newSyn = [];
              let preferredTerm;
              data.s.forEach(s => {
                if (s.ts !== 'NCI') return;
                let synObj = {};
                synObj.termName = highlightSynObj[s.tn] ? highlightSynObj[s.tn] : s.tn;
                synObj.termSource = s.ts;
                synObj.termGroup = s.tg;
                if (s.ts === 'PT' && preferredTerm === undefined) {
                  preferredTerm = s.tn;
                }
                newSyn.push(synObj);
              });
              data.n_c = highlightNCObj[data.n_c] ? highlightNCObj[data.n_c] : data.n_c;
              data.id = (obj.property + '-' + valueObj.src_n + '-' + data.n_c).replace(/[^a-zA-Z0-9-]+/gi, '');
              data.pt = preferredTerm;
              data.s = sortSynonyms(newSyn);
              if (data.def !== undefined &&
                data.def.length !== 0 &&
                data.def.find((defs) => defs.defSource === 'NCI') !== undefined) {
                data.def = data.def.find((defs) => defs.defSource === 'NCI').description;
              } else {
                data.def = undefined;
              }
              if (data.ap !== undefined && data.ap.length !== 0) {
                data.ap = data.ap.filter((aps) => {
                  return aps.name === 'CAS_Registry' || aps.name === 'FDA_UNII_Code' || aps.name === 'NSC_Code';
                });
              }
            });
            valueObj.n_syn = source.n_syn;
          }
          valueObj.i_c = {};
          valueObj.i_c.c = source.i_c ? highlightICObj[source.i_c.c] ? highlightICObj[source.i_c.c] : source.i_c.c : undefined;
          valueObj.i_c.id = source.i_c ? (obj.property + '-' + valueObj.src_n + '-' + source.i_c.c).replace(/[^a-zA-Z0-9-]+/gi, '') : undefined;
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

export const vsEvents = ($root) => {
  $root.on('click', '.table__toggle', (event) => {
    tableToggleHandle(event);
  });

  $root.on('click', '.gdc-details', (event) => {
    detailsToggleHandle(event);
  });

  $root.on('click', '.cde-suggest', (event) => {
    suggestNotificationHandle(event);
  });

  $root.on('click', '.show-more-less', (event) => {
    showMoreToggleHandle(event);
  });
};
