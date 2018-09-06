import tmpl from './view';
import api from '../../api';
import shared from '../../shared';

export default function gdcData(prop, item) {
  api.getGDCDataById(prop, function (id, items) {

    if ($('#gdc_data').length) {
      $('#gdc_data').remove();
    }
    let windowEl = $(window);
    let icdo = false;
    let new_items = [];
    let tmp_obj ={};
    items.forEach(function (item) {
      if (item.i_c !== undefined) {
        if(item.i_c.c in tmp_obj){
          tmp_obj[item.i_c.c].n.push(item.n);
        }else{
          tmp_obj[item.i_c.c] = {c: item.i_c.c, have: item.i_c.have, n: [item.n]};
        }
      }
    });
    items.forEach(function (item) {
      if (item.i_c !== undefined) {
        icdo = true;
      }
      if (item.gdc_d === true) {
        if(tmp_obj[item.n] !== undefined){
          let tmp_data = {};
          tmp_data.n = item.n;
          tmp_data.i_c = tmp_obj[item.n];
          tmp_data.n_c = item.n_c;
          tmp_data.s = item.s;
          new_items.push(tmp_data);
        } else {
          let tmp_data = {};
          if (item.i_c !== undefined) {
            tmp_data.i_c = tmp_obj[item.i_c.c];
          }
          tmp_data.n = item.n;
          tmp_data.n_c = item.n_c;
          tmp_data.s = item.s;
          new_items.push(tmp_data);
        }
      }
    });

    items = new_items;

    let target = item == undefined ? item : item.replace(/<b>/g, "").replace(
      /<\/b>/g, "");
    let header = $.templates(tmpl.header).render({
      target: target,
      icdo: icdo,
      items_length: items.length
    });
    let html = $.templates(tmpl.body).render({
      target: target,
      icdo: icdo,
      items: items
    });

    let tp = (window.innerHeight * 0.2 < shared.headerOffset()) ? 20 :
      window.innerHeight * 0.2;

    //display result in a table
    $(document.body).append(html);

    let dialog_width = {
      width: 450,
      minWidth: 350,
      maxWidth: 700
    }

    if(icdo){
      dialog_width.width = 700;
      dialog_width.minWidth = 600;
      dialog_width.maxWidth = 900;
    }

    $('#gdc_data').dialog({
      modal: false,
      position: {
        my: 'center top+' + tp,
        at: 'center top',
        of: $('#docs-container')
      },
      width: dialog_width.width,
      minWidth: dialog_width.minWidth,
      maxWidth: dialog_width.maxWidth,
      height: 550,
      minHeight: 350,
      maxHeight: 650,
      open: function () {
        //add new custom header
        if (icdo) {
          $(this).prev('.ui-dialog-titlebar').css('padding-top',
            '7.5em').html(header);
        } else {
          $(this).prev('.ui-dialog-titlebar').css('padding-top',
            '3.8em').html(header);
        }

        var target = $(this).parent();
        if ((target.offset().top - windowEl.scrollTop()) < shared.headerOffset()) {
          target.css('top', (windowEl.scrollTop() + shared.headerOffset() +
            20) + 'px');

        }

        $('#close_gdc_data').bind('click', function () {
          $("#gdc_data").dialog('close');
        });
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
          $('#gdc-data-list div[style="display: none;"]').each(function () {
            $(this).css("display", "block");
          });
          var setScroll = $('#gdc_data_match').offset().top - $(
            '#gdc_data').offset().top;
          $('#gdc_data').scrollTop(setScroll - 120);
        } else {
          $('#gdc-data-list div[style="display: block;"]').each(
            function () {
              $(this).css("display", "none");
            });
        }
      });
    }

  });
}
