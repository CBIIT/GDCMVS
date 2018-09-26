import func from './search-bar/';
import dialog from './dialog/';
import render from './render';
import api from './api';
import { onResize, onScroll, setHeight } from './shared';

window.onload = () => {

  const init = () => {

    const $window = $(window);
    const $document = $(document);

    const $search = $("#search");
    const $keywords = $("#keywords");
    const $searchClear = $('#searchclear');

    const $docsContainer = $('#docs-container');
    const $parentContainer = $('.parent-container');

    $search.click(func.search);

    $keywords.bind("keypress", func.gotoSearch);

    $keywords.bind("keydown", func.selectSuggestion);

    $keywords.bind("input", func.suggest);

    $document.on('click', func.removeBox);

    $searchClear.click((event) => {
      event.preventDefault();
      $(this).hide();
      $keywords.val('').focus();
    });

    setHeight($docsContainer, $parentContainer);

    $window.scroll(() => { onScroll($window) });

    $window.resize(() => { onResize($docsContainer, $parentContainer) });
  }

  init();
}

function getGDCData(prop, target, keyword) {
  let uid = prop.replace(/@/g, '/');
  dialog.getGDCData(uid, target, keyword);
}

window.getGDCData = getGDCData;

function getGDCTerms(prop, targets) {
  let uid = prop.replace(/@/g, '/');
  dialog.getGDCTerms(uid, targets);
};

window.getGDCTerms = getGDCTerms;

function toCompare(prop) {
  let uid = prop.replace(/@/g, '/');
  dialog.toCompare(uid);
};

window.toCompare = toCompare;

function compare(gv) {
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
};

window.compare = compare;

function generateCompareResult(fromV, toV, option) {
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
};

window.generateCompareResult = generateCompareResult;

function generateCompareGDCResult(fromV, toV, option) {
  let v_lowercase = [], v_matched = [];
  let from_num = 0;
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
    + '<div class="table__th col-xs-6">GDC Values</div>'
    + '<div class="table__th col-xs-6">Matched caDSR Values</div>'
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
      + '<div class="table__td  table__td--slim col-xs-6"><div style="color:red;">--</div></div>'
      + '<div class="table__td table__td--slim col-xs-6">' + toV[i] + '</div>'
      + '</div>';
  }
  table += '</div></div>'

  return table;
};

window.generateCompareGDCResult = generateCompareGDCResult;

function getCDEData(cdeId, targets) {
  dialog.getCDEData(cdeId, targets);
}

window.getCDEData = getCDEData;

function compareGDC(prop, cdeId) {
  let uid = prop.replace(/@/g, '/');
  dialog.compareGDC(uid, cdeId);
};

window.compareGDC = compareGDC;

function getNCITDetails(uid) {
  dialog.getNCITDetails(uid);
}

window.getNCITDetails = getNCITDetails;

//find the word with the first character capitalized
function findWord(words) {
  let word = "";
  if (words.length == 1) {
    return words[0];
  }
  words.forEach(function (w) {
    if (word !== "") {
      return;
    }
    let idx_space = w.indexOf(" ");
    let idx_comma = w.indexOf(",");
    if (idx_space == -1 && idx_comma == -1) {
      if (/^[A-Z][a-z0-9]{0,}$/.test(w)) {
        word = w;
      }
    }
    else if (idx_space !== -1 && idx_comma == -1) {
      if (/^[A-Z][a-z0-9]{0,}$/.test(w.substr(0, idx_space))) {
        word = w;
      }
    }
    else if (idx_space == -1 && idx_comma !== -1) {
      if (/^[A-Z][a-z0-9]{0,}$/.test(w.substr(0, idx_comma))) {
        word = w;
      }
    }
    else {
      if (idx_comma > idx_space) {
        if (/^[A-Z][a-z0-9]{0,}$/.test(w.substr(0, idx_space))) {
          word = w;
        }
      }
      else {
        if (/^[A-Z][a-z0-9]{0,}$/.test(w.substr(0, idx_comma))) {
          word = w;
        }
      }
    }

  });
  if (word == "") {
    word = words[0];
  }
  return word;
};

window.findWord = findWord;

$(function () {

  $('#body a[href^="http"]').each(function () {
    let anchor = $(this);
    anchor.removeClass('external-link');
    anchor.html($.trim(anchor[0].innerText));
  });

  if (localStorage.hasOwnProperty('keyword') &&
    localStorage.hasOwnProperty('option') &&
    localStorage.hasOwnProperty('items')) {

    $('#gdc-loading-icon').show();

    setTimeout(function () {

      let keyword = localStorage.getItem('keyword');
      let option = JSON.parse(localStorage.getItem('option'));
      let items = JSON.parse(localStorage.getItem('items'));

      if (keyword != null || option != null || items != null) {

        $("#keywords").val(keyword);

        if (option.match != 'partial') {
          $("#i_ematch").prop('checked', true);
        }
        if (option.desc != false) {
          $("#i_desc").prop('checked', true);
        }
        if (option.syn != false) {
          $("#i_syn").prop('checked', true);
        }

        $('#searchclear').show();

        render(keyword, option, items);
        //todo: close progress bar
        $('#gdc-loading-icon').fadeOut('fast');
      }

    }, 100);
  }
});
