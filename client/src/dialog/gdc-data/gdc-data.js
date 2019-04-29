import { header_template, body_template } from './gdc-data-view';
import { apiGetGDCDataById } from '../../api';
import { getHeaderOffset, getScrollTop, sortAlphabetically} from '../../shared';

const gdcData = (prop, tgt, keyword) => {
  apiGetGDCDataById(prop, function (id, items) {
    if ($('#gdc_data').length) {
      $('#gdc_data').remove();
    }

    let icdo = false;
    let new_items = [];
    let reg_key = new RegExp(tgt.replace(/<b>/g, "").replace(/<\/b>/g, ""), "ig");

    items.forEach(function (item) {
      let source = item._source;
      source.enum.forEach(value => {
        let value_obj = {};
        value_obj.n = tgt !== null && tgt !== undefined && value.n === tgt.replace(/<b>/g, "").replace(/<\/b>/g, "") ? tgt.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>") : value.n;
        if(value.i_c !== undefined) icdo = true;
        if(value.i_c !== undefined) value_obj.i_c = {};
        if(value.i_c !== undefined) value_obj.i_c.c = value.i_c.c;
        if(value.ic_enum !== undefined) value_obj.ic_enum = value.ic_enum;
        new_items.push(value_obj);
      });
    });
    items = new_items;

    //open loading animation
    let isAnimated = false;
    if (items.length > 1000 ) isAnimated = true;
    if (isAnimated) $('#gdc-loading-icon').show();

    // Sort the list alphabetical order.
    items = sortAlphabetically(items);

    let target = tgt === null || tgt === undefined ? tgt : tgt.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>");

    let header = header_template(target, icdo, items.length);
    let html = body_template(target, icdo, items);

    setTimeout(() => {
      //display result in a table
      $(document.body).append(html);

      let dialog_width = {
        width: 450,
        minWidth: 400,
        maxWidth: 700
      }

      if (icdo) {
        dialog_width.width = 700;
        dialog_width.minWidth = 600;
        dialog_width.maxWidth = 900;
      }

      $('#gdc_data').dialog({
        modal: false,
        width: dialog_width.width,
        minWidth: dialog_width.minWidth,
        maxWidth: dialog_width.maxWidth,
        height: 550,
        minHeight: 350,
        maxHeight: 650,
        open: function () {
          //add new custom header
          if (icdo) {
            $(this).prev('.ui-dialog-titlebar').css('padding-top','7.8em').html(header);
          } else {
            $(this).prev('.ui-dialog-titlebar').css('padding-top','3.8em').html(header);
          }

          let target = $(this).parent();
          if ((target.offset().top - getScrollTop()) < getHeaderOffset()) {
            target.css('top', (getScrollTop() + getHeaderOffset() + 10) + 'px');
          }

          $('#close_gdc_data').bind('click', function () {
            $("#gdc_data").dialog('close');
          });

          //remove loading animation
          if (isAnimated) $('#gdc-loading-icon').hide();
        },
        close: function () {
          $(this).remove();
        }
      }).parent().draggable({
        containment: '#docs-container'
      });

      if ($('#show_all_gdc_data') !== undefined) {
        $('#show_all_gdc_data').bind('click', function () {
          let v = $(this).prop("checked");
          if (v) {
            $('#gdc-data-list .gdc-data__item--hide').each(function () {
              $(this).removeClass('gdc-data__item--hide').addClass('gdc-data__item--show');
            });
            var setScroll = $('#gdc_data_match').offset().top - $('#gdc_data').offset().top;
            $('#gdc_data').scrollTop(setScroll - 120);
          } else {
            $('#gdc-data-list .gdc-data__item--show').each(function () {
              if(!$(this).is('#gdc_data_match')){
                $(this).removeClass('gdc-data__item--show').addClass('gdc-data__item--hide');
              }
              });
          }
        });
      }
    }, 100);
  });
}

export default gdcData;
