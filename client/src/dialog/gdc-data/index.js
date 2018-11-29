import tmpl from './view';
import api from '../../api';
import shared from '../../shared';

export default function gdcData(prop, tgt, keyword) {
  api.getGDCDataById(prop, function (id, items) {

    if ($('#gdc_data').length) {
      $('#gdc_data').remove();
    }
    let windowEl = $(window);
    let icdo = false;
    let new_items = [];
    let new_item_checker = {};
    let tmp_obj ={};
    // RegExp Keyword
    // Don't replace with anything, if keyword is null
    keyword = keyword === null ? '@#$%^' : keyword.trim().replace(/[\ ,:_-]+/g, " ");
    let reg_key = new RegExp(keyword.replace(/( NOT | AND | OR )/g, "|"), "ig");

    items.forEach(function (item) {
      let tt = item.term_type !== undefined ? item.term_type : "";
      let term_type = "";
      if(tt !== ""){
        term_type = tt === 'PT' ? '<b>(' + tt + ')</b>' :'(' + tt + ')';
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
          tmp_data.n = item.n.replace(reg_key, "<b>$&</b>");
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
          tmp_data.n = item.n.replace(reg_key, "<b>$&</b>");
          tmp_data.n_c = item.n_c;
          tmp_data.s = item.s;
          new_items.push(tmp_data);
          new_item_checker[item.n] = tmp_data;
        }
      }
    });
    items = new_items;

    let target = tgt === null  || tgt === undefined ? tgt : tgt.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>");
    let header = $.templates(tmpl.header).render({
      target: target,
      icdo: icdo,
      items_length: items.length
    });
    let html = $.templates(tmpl.body).render({
      target: target,
      keyword: keyword,
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
          target.css('top', (windowEl.scrollTop() + shared.headerOffset() + 20) + 'px');
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

  }, function(status, errorThrown) {
      //show the notification alert error
      let alertError = $('#alert-error');
      alertError.text('Error ' + status + ': ' + errorThrown);
      alertError.removeClass('animated fadeInDownUp').css({'display': 'none'});
      let animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
      alertError.css({'display': 'block', 'top': (shared.headerOffset() + 20 ) + 'px'}).addClass('animated fadeInDownUp').one(animationEnd, function() {
        alertError.css({'display': 'none'})
      });
  });
}
