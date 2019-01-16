import getCDEData from './cde-data/cde-data';
import gdcData from './gdc-data/gdc-data';
import toCompare from './to-compare/to-compare';
import compareGDC from './compare-gdc/compare-gdc';
import GDCTerms from './gdc-terms/gdc-terms';
import getNCITDetails from './ncit-details/ncit-details'
import { findWord } from '../shared';

export const dialogEvents = ($root, $body) => {
  $root.on('click', '.getCDEData', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    getCDEData(data.cdeid, data.targets);
  });

  $root.on('click', '.getGDCData', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref.replace(/@/g, '/');
    gdcData(uid, data.tgt, data.keyword);
  });

  $root.on('click', '.toCompare', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref.replace(/@/g, '/');
    toCompare(uid);
  });

  $root.on('click', '.compareGDC', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref.replace(/@/g, '/');
    compareGDC(uid, data.cdeid);
  });

  $root.on('click', '.getGDCTerms', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref.replace(/@/g, '/');
    GDCTerms(uid, data.targets);
  });

  $body.on('click', '.getNCITDetails', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    getNCITDetails(data.uid);
  });
}
// Remove duplicate synonyms case insensitive
const removeDuplicateSynonyms = (it) => {
    if (it.s == undefined) return;
    let cache = {};
    let tmp_s = [];
    it.s.forEach(function (s) {
      let lc = s.trim().toLowerCase();
      if (!(lc in cache)) {
        cache[lc] = [];
      }
      cache[lc].push(s);
    });
    for (let idx in cache) {
      //find the term with the first character capitalized
      let word = findWord(cache[idx]);
      tmp_s.push(word);
    }
    return tmp_s;
}
const generateCompareResult = (fromV, toV, option) => {
  let v_lowercase = [], v_matched = [], v_synonyms = {};
  if (option.sensitive) {
    toV.forEach(function (v) {
      v_lowercase.push(v.n.trim());
      if(v_synonyms[v.n.trim()] === undefined && v.s.length > 0){
        v_synonyms[v.n.trim()] = removeDuplicateSynonyms(v);
      }
    });
  }
  else {
    toV.forEach(function (v) {
      v_lowercase.push(v.n.trim().toLowerCase());
      if(v_synonyms[v.n.trim().toLowerCase()] === undefined && v.s.length > 0){
        v_synonyms[v.n.trim().toLowerCase()] = removeDuplicateSynonyms(v);
      }
    });
  }
  let table = '<div class="table__thead row">'
    + '<div class="table__th col-xs-6">User Defined Values</div>'
    + '<div class="table__th col-xs-6">Matched GDC Values</div>'
    + '</div>'
    + '<div class="table__body row">'
    + '<div class="col-xs-12">';

  fromV.forEach(function (v) {
    let tmp = $.trim(v);
    if (tmp === '') {
      return;
    }
    let text = [];
    let idx;
    if( option.sensitive){
      idx = v_lowercase.indexOf(tmp);
      if (idx >= 0) {
        text.push(toV[idx].n);
        v_matched.push(idx);
      }
    } else{
      v_lowercase.forEach((v_tmp, index) => {
        if(v_tmp.indexOf(tmp.toLowerCase()) !== -1){
          text.push(toV[index].n);
          v_matched.push(index);
        }
      })
    } 
    
    if (text.length === 0) {
      text = '<div style="color:red;">--</div>';
      table += '<div class="table__row row">'
        + '<div class="table__td table__td--slim col-xs-6">' + v + '</div>'
        + '<div class="table__td table__td--slim col-xs-6">' + text + '</div>'
        + '</div>';
    }
    else {
      table += '<div class="table__row row">'
      text.forEach((tmp_text, index) => {
        if(index !== 0 ) v = "";
        table += '<div class="table__td table__td--slim col-xs-6">' + v + '</div>'
        +'<div class="table__td table__td--slim col-xs-6">' + tmp_text + '</div>';
      });
      table += '</div>'
    }
  });
  for (var i = 0; i < toV.length; i++) {
    if (v_matched.indexOf(i) >= 0) {
      continue;
    }
    table += '<div class="table__row row ' + (option.unmatched ? 'table__row--undisplay' : '') + '">'
      + '<div class="table__td table__td--slim col-xs-6"><div style="color:red;">--</div></div>'
      + '<div class="table__td table__td--slim col-xs-6">' + toV[i].n + '</div>'
      + '</div>';
  }
  table += '</div></div>'
  return table;
}

export const compare = (gv) => {
  if ($('#cp_input').val().trim() === '') {
    $('#cp_massage').html("Please type in user defined values.");
    return;
  }
  else {
    //compare and render
    $('#cp_massage').html("");
    $('#compare_form').css("display", "none");
    $('#compare_result').css("display", "block");

    let compare_dialog = $('#compare_dialog').parent().find('.ui-dialog-titlebar');

    let titleComponent = '<div class="checkbox ui-checkbox"><label class="checkbox__label checkbox__label--height"><input id="compare_filter" class="checkbox__input" type="checkbox" value=""><span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Exact Match</label>'
      + '<label class="checkbox__label checkbox__label--height"><input id="compare_unmatched" class="checkbox__input" type="checkbox" value=""><span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Hide Unmatched Values</label>';

    compare_dialog.append(titleComponent);


    let vs = $('#cp_input').val().split(/\n/);

    let opt = {};
    opt.sensitive = false;
    opt.unmatched = false;
    let table = generateCompareResult(vs, gv, opt);
    let html = '<div id="cp_result_table" class="table__container table__container--margin-bottom">' + table + '</div>'
      + '<div id="cp_result_bottom" class="compare_result__bottom"><button id="back2Compare" class="btn btn-default compare-form__button">Back</button></div>';

    $('#compare_result').html(html);

    $('#compare_filter').bind('click', function () {
      let options = {};
      options.sensitive = $("#compare_filter").prop('checked');
      options.unmatched = $("#compare_unmatched").prop('checked');
      let table_new = generateCompareResult(vs, gv, options);
      $('#cp_result_table').html(table_new);

    });
    $('#compare_unmatched').bind('click', function () {
      let options = {};
      options.sensitive = $("#compare_filter").prop('checked');
      options.unmatched = $("#compare_unmatched").prop('checked');
      let table_new = generateCompareResult(vs, gv, options);
      $('#cp_result_table').html(table_new);

    });
    $('#back2Compare').bind('click', function () {
      $('#compare_result').html("");
      $('#compare_result').css("display", "none");
      $('#compare_form').css("display", "block");
      compare_dialog.find('.ui-checkbox').remove();
    });

  }
}

export const removePopUps = () => {
  if ($('#gdc_data').length) {
    $('#gdc_data').remove();
  }

  if ($('#caDSR_data').length) {
    $('#caDSR_data').remove();
  }

  if ($('#gdc_terms_data').length) {
    $('#gdc_terms_data').remove();
  }

  if ($('#ncit_details').length) {
    $('#ncit_details').remove();
  }

  if ($('#compare_dialog').length) {
    $('#compare_dialog').remove();
  }

  if ($('#compareGDC_dialog').length) {
    $('#compareGDC_dialog').remove();
  }
}
