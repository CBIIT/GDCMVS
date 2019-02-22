import tmpl from './gdc-data.html';
import { apiGetGDCDataById } from '../../api';
import { getHeaderOffset, htmlChildContent} from '../../shared';

const gdcData = (prop, tgt, keyword) => {
  apiGetGDCDataById(prop, function (id, items) {
    if ($('#gdc_data').length) {
      $('#gdc_data').remove();
    }

    let windowEl = $(window);
    let icdo = false;
    let new_items = [];
    let new_item_checker = {};
    let tmp_obj = {};
    let header_template = htmlChildContent('HeaderTemplate', tmpl);
    let body_template = htmlChildContent('BodyTemplate', tmpl);
    // RegExp Keyword
    // Don't replace with anything, if keyword is null
    keyword = keyword === null || keyword === undefined ? '@#$%^' : keyword.trim().replace(/[\ ,:_-]+/g, " ");
    let reg_key = new RegExp(keyword.replace(/( NOT | AND | OR )/g, "|"), "ig");

    items.forEach(function (item) {
      let tt = item.term_type !== undefined ? item.term_type : "";
      let term_type = "";
      if(tt !== ""){
        term_type = tt === 'PT' ? '<b>(' + tt + ')</b>' :'(' + tt + ')';
      }
      else{
        term_type += "(*)";
      }
      if (item.i_c !== undefined) {
        if(item.i_c.c in tmp_obj){
          if(item.n !== item.i_c.c){
            if(tt === 'PT'){
              tmp_obj[item.i_c.c].n.unshift(item.n.replace(reg_key, "<b>$&</b>")+" "+term_type);
            }else{
              tmp_obj[item.i_c.c].n.push(item.n.replace(reg_key, "<b>$&</b>")+" "+term_type);
            }
          }
        }else{
          tmp_obj[item.i_c.c] = {c: item.i_c.c, have: item.i_c.have, n: []};
          if(item.n !== item.i_c.c){
            if(tt === 'PT'){
              tmp_obj[item.i_c.c].n.unshift(item.n.replace(reg_key, "<b>$&</b>")+" "+term_type);
            }else{
              tmp_obj[item.i_c.c].n.push(item.n.replace(reg_key, "<b>$&</b>")+" "+term_type);
            }
          }
        }
      }
    });
    items.forEach(function (item) {
      if (item.i_c !== undefined) {
        icdo = true;
      }
      if (item.gdc_d === true) {
        if(tmp_obj[item.n] !== undefined && !new_item_checker[item.n]){
          let tmp_data = {};
          tmp_data.n = tgt !== null && tgt !== undefined && item.n === tgt.replace(/<b>/g, "").replace(/<\/b>/g, "") ? tgt.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>") : item.n;
          tmp_data.i_c = tmp_obj[item.n];
          tmp_data.i_c.c = tmp_data.i_c.c.replace(reg_key, "<b>$&</b>");
          tmp_data.n_c = item.n_c;
          tmp_data.s = item.s;
          new_items.push(tmp_data);
          new_item_checker[item.n] = tmp_data;
        } else if(!new_item_checker[item.n]){
          let tmp_data = {};
          if (item.i_c !== undefined) {
            tmp_data.i_c = tmp_obj[item.i_c.c];
            tmp_data.i_c.c = tmp_data.i_c.c.replace(reg_key, "<b>$&</b>");
          }
          tmp_data.n = tgt !== null && tgt !== undefined && item.n === tgt.replace(/<b>/g, "").replace(/<\/b>/g, "") ? tgt.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>") : item.n;
          tmp_data.n_c = item.n_c;
          tmp_data.s = item.s;
          new_items.push(tmp_data);
          new_item_checker[item.n] = tmp_data;
        }
      }
    });
    items = new_items;

    //open loading animation
    if (items.length > 500 ) {
      $('#gdc-loading-icon').show()
    }

    // Sort the list alphabetical order.
    items.sort((a, b) => (a.n.toLowerCase() > b.n.toLowerCase()) ? 1 : ((b.n.toLowerCase() > a.n.toLowerCase()) ? -1 : 0));

    let target = tgt === null || tgt === undefined ? tgt : tgt.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>");

    let header = $.templates(header_template).render({
      target: target,
      icdo: icdo,
      items_length: items.length
    }).trim();
    let html = $.templates(body_template).render({
      target: target,
      keyword: keyword,
      icdo: icdo,
      items: items
    }).trim();

    let tp = (window.innerHeight * 0.2 < getHeaderOffset()) ? 20 :
      window.innerHeight * 0.2;

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
          if ((target.offset().top - windowEl.scrollTop()) < getHeaderOffset()) {
            target.css('top', (windowEl.scrollTop() + getHeaderOffset() + 20) + 'px');
          }

          $('#close_gdc_data').bind('click', function () {
            $("#gdc_data").dialog('close');
          });

          if (items.length > 500 ) {
            $('#gdc-loading-icon').hide()
          }
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
