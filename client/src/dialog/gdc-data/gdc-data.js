import { headerTemplate, bodyTemplate } from './gdc-data-view';
import { apiGetGDCDataById } from '../../api';
import { getHeaderOffset, getScrollTop, sortAlphabetically } from '../../shared';

const gdcData = (prop, tgt, keyword) => {
  apiGetGDCDataById(prop, function (id, items) {
    if ($('#gdc_data').length) {
      $('#gdc_data').remove();
    }

    let icdo = false;
    let newItems = [];
    let regKey = new RegExp(tgt.replace(/<b>/g, '').replace(/<\/b>/g, ''), 'ig');

    items.forEach(function (item) {
      let source = item._source;
      source.enum.forEach(value => {
        let valueObj = {};
        valueObj.n = tgt !== null && tgt !== undefined && value.n === tgt.replace(/<b>/g, '').replace(/<\/b>/g, '') ? tgt.replace(/<b>/g, '').replace(/<\/b>/g, '').replace(regKey, '<b>$&</b>') : value.n;
        if (value.i_c !== undefined) icdo = true;
        if (value.i_c !== undefined) valueObj.i_c = {};
        if (value.i_c !== undefined) valueObj.i_c.c = value.i_c.c;
        if (value.ic_enum !== undefined) valueObj.ic_enum = value.ic_enum;
        newItems.push(valueObj);
      });
    });
    items = newItems;

    // open loading animation
    let isAnimated = false;
    if (items.length > 1000) isAnimated = true;
    if (isAnimated) $('#gdc-loading-icon').show();

    // Sort the list alphabetical order.
    items = sortAlphabetically(items);

    let target = tgt === null || tgt === undefined ? tgt : tgt.replace(/<b>/g, '').replace(/<\/b>/g, '').replace(regKey, '<b>$&</b>');

    let header = headerTemplate(target, icdo, items.length);
    let html = bodyTemplate(target, icdo, items);

    setTimeout(() => {
      // display result in a table
      $(document.body).append(html);

      let dialogWidth = {
        width: 450,
        minWidth: 400,
        maxWidth: 700
      };

      if (icdo) {
        dialogWidth.width = 700;
        dialogWidth.minWidth = 600;
        dialogWidth.maxWidth = 900;
      }

      $('#gdc_data').dialog({
        modal: false,
        width: dialogWidth.width,
        minWidth: dialogWidth.minWidth,
        maxWidth: dialogWidth.maxWidth,
        height: 550,
        minHeight: 350,
        maxHeight: 650,
        open: function () {
          // add new custom header
          if (icdo) {
            $(this).prev('.ui-dialog-titlebar').css('padding-top', '7.8em').html(header);
          } else {
            $(this).prev('.ui-dialog-titlebar').css('padding-top', '3.8em').html(header);
          }

          let target = $(this).parent();
          if ((target.offset().top - getScrollTop()) < getHeaderOffset()) {
            target.css('top', (getScrollTop() + getHeaderOffset() + 10) + 'px');
          }

          $('#close_gdc_data').bind('click', function () {
            $('#gdc_data').dialog('close');
          });

          // remove loading animation
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
          let v = $(this).prop('checked');
          if (v) {
            $('#gdc-data-list .gdc-data__item--hide').each(function () {
              $(this).removeClass('gdc-data__item--hide').addClass('gdc-data__item--show');
            });
            var setScroll = $('#gdc_data_match').offset().top - $('#gdc_data').offset().top;
            $('#gdc_data').scrollTop(setScroll - 120);
          } else {
            $('#gdc-data-list .gdc-data__item--show').each(function () {
              if (!$(this).is('#gdc_data_match')) {
                $(this).removeClass('gdc-data__item--show').addClass('gdc-data__item--hide');
              }
            });
          }
        });
      }
    }, 100);
  });
};

export default gdcData;
