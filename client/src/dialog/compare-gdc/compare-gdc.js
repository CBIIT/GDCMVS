import { apiGetGDCandCDEDataById } from '../../api';
import { getHeaderOffset } from '../../shared';

const generateCompareGDCResult = (fromV, toV, option) => {
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
}

const compareGDC = (prop, uid) => {
  let ids = {};
  ids.local = prop;
  ids.cde = uid.replace(/<b>/g, "").replace(/<\/b>/g, "");
  apiGetGDCandCDEDataById(ids, function (ids, items) {
    if ($('#compareGDC_dialog').length) {
      $('#compareGDC_dialog').remove();
    }
    let windowEl = $(window);
    let popup = '<div id="compareGDC_dialog">'
      + '<div id="compareGDC_result"></div>'
      + '</div>';
    $(document.body).append(popup);
    let tp = (window.innerHeight * 0.2 < getHeaderOffset()) ? getHeaderOffset() + 20 : window.innerHeight * 0.2;
    let toV = [];
    let fromV = [];
    let opt = {};
    opt.sensitive = false;
    opt.unmatched = false;
    items.to.forEach(function (t) {
      toV.push(t.n);
    });
    items.from.forEach(function (f) {
      fromV.push(f.n);
    });
    let table = generateCompareGDCResult(fromV.sort(), toV.sort(), opt);
    let html = '<div id="cpGDC_result_option">'
      + '<div id="cpGDC_result_table" class="table__container">' + table + '</div>'
      + '</div>';

    let titleComponent = '<div class="checkbox ui-checkbox"><label class="checkbox__label checkbox__label--height"><input id="compareGDC_filter" class="checkbox__input" type="checkbox" value=""><span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Case Sensitive</label>'
      + '<label class="checkbox__label checkbox__label--height"><input id="compareGDC_unmatched" class="checkbox__input" type="checkbox" value=""><span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Hide Unmatched Values</label></div>';

    $('#compareGDC_result').html(html);

    $("#compareGDC_dialog").dialog({
      modal: false,
      position: {
        my: "center top+" + tp,
        at: "center top",
        of: $('#docs-container')
      },
      width: 750,
      height: 550,
      minWidth: 715,
      maxWidth: 900,
      minHeight: 300,
      maxHeight: 800,
      title: "Compare GDC Values with caDSR Values ",
      open: function () {

        var target = $(this).parent();
        target.find('.ui-dialog-titlebar').css('padding', '15px')
          .append(titleComponent);
        target.find('.ui-dialog-titlebar-close').html('');
        if ((target.offset().top - windowEl.scrollTop()) <
          getHeaderOffset()) {
          target.css('top', (windowEl.scrollTop() +
            getHeaderOffset() + 20) + 'px');
        }

        $('#compareGDC_filter').bind('click', function () {
          let options = {};
          options.sensitive = $("#compareGDC_filter").prop('checked');
          options.unmatched = $("#compareGDC_unmatched").prop('checked');
          let table_new = generateCompareGDCResult(fromV.sort(), toV.sort(), options);
          $('#cpGDC_result_table').html(table_new);
        });
        $('#compareGDC_unmatched').bind('click', function () {
          let options = {};
          options.sensitive = $("#compareGDC_filter").prop('checked');
          options.unmatched = $("#compareGDC_unmatched").prop('checked');
          let table_new = generateCompareGDCResult(fromV.sort(), toV.sort(), options);
          $('#cpGDC_result_table').html(table_new);
        });
      },
      close: function () {
        $(this).remove();
      }
    }).parent().draggable({
      containment: '#docs-container'
    });
  });
}

export default compareGDC;
