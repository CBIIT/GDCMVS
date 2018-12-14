import getCDEData from './cde-data/cde-data';
import gdcData from './gdc-data/gdc-data';
import toCompare from './to-compare/to-compare';
import compareGDC from './compare-gdc/compare-gdc';
import GDCTerms from './gdc-terms/gdc-terms';
import getNCITDetails from './ncit-details/ncit-details'

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

const generateCompareResult = (fromV, toV, option) => {
  let v_lowercase = [], v_matched = [];
  if (option.sensitive) {
    toV.forEach(function (v) {
      v_lowercase.push(v.trim());
    });
  }
  else {
    toV.forEach(function (v) {
      v_lowercase.push(v.trim().toLowerCase());
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
    let text = '';
    let idx = option.sensitive ? v_lowercase.indexOf(tmp) : v_lowercase.indexOf(tmp.toLowerCase());
    if (idx >= 0) {
      text = toV[idx];
      v_matched.push(idx);
    }
    if (text === '') {
      text = '<div style="color:red;">--</div>';
      table += '<div class="table__row row">'
        + '<div class="table__td table__td--slim col-xs-6">' + v + '</div>'
        + '<div class="table__td table__td--slim col-xs-6">' + text + '</div>'
        + '</div>';
    }
    else {
      table += '<div class="table__row row">'
        + '<div class="table__td table__td--slim col-xs-6">' + v + '</div>'
        + '<div class="table__td table__td--slim col-xs-6">' + text + '</div>'
        + '</div>';
    }
  });
  for (var i = 0; i < toV.length; i++) {
    if (v_matched.indexOf(i) >= 0) {
      continue;
    }
    table += '<div class="table__row row ' + (option.unmatched ? 'table__row--undisplay' : '') + '">'
      + '<div class="table__td table__td--slim col-xs-6"><div style="color:red;">--</div></div>'
      + '<div class="table__td table__td--slim col-xs-6">' + toV[i] + '</div>'
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

    let titleComponent = '<div class="checkbox ui-checkbox"><label class="checkbox__label checkbox__label--height"><input id="compare_filter" class="checkbox__input" type="checkbox" value=""><span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Case Sensitive</label>'
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
