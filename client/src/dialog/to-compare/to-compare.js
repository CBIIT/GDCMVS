import tmpl from './to-compare.html';
import { compare } from '../dialog'
import { apiGetGDCDataById } from '../../api';
import { getHeaderOffset, removeDuplicateSynonyms } from '../../shared';

const toCompare = (uid) => {
  uid = uid.replace(/@/g, '/');
  apiGetGDCDataById(uid, function (id, items) {
    if ($('#compare_dialog').length) {
      $('#compare_dialog').remove();
    }

    let windowEl = $(window);
    let icdo = false;
    let icdo_items = [];
    let item_checker = {};
    let n_c_all = {};

    // Collecting all synonyms and ncit in one array for particular value
    items.forEach(item => {
      item.s = removeDuplicateSynonyms(item);
      if (item.i_c === undefined) return;
      if(item.i_c.c && item.i_c.c !== item.n) return;
      if(n_c_all[item.n] === undefined){
        n_c_all[item.n] = { n_syn: [], checker_n_c: [item.n_c] };
        n_c_all[item.n].n_syn.push({n_c: item.n_c, s: removeDuplicateSynonyms(item)});
      }
      else if(n_c_all[item.n] !== undefined && n_c_all[item.n].checker_n_c.indexOf(item.n_c) === -1){
        n_c_all[item.n].n_syn.push({n_c: item.n_c, s: removeDuplicateSynonyms(item)});
        n_c_all[item.n].checker_n_c.push(item.n_c);
      }
    });

    items.forEach(function (item) {
      if (item.i_c !== undefined) {
        icdo = true;
      }
      if (item.gdc_d === false) {
        return;
      }
      if (item_checker[item.n] === undefined) {
        let tmp_item = {
          n: item.n,
          i_c: item.i_c ? item.i_c : "",
          n_syn: n_c_all[item.n] ? n_c_all[item.n].n_syn : item.n_c ? [{n_c: item.n_c, s: removeDuplicateSynonyms(item)}] : []
        }
        icdo_items.push(tmp_item);
        item_checker[item.n] = item;
    }
    });
    if (icdo) {
      items = icdo_items;
    }

    // Sort the list alphabetical order.
    items.sort((a, b) => (a.n.toLowerCase() > b.n.toLowerCase()) ? 1 : ((b.n.toLowerCase() > a.n.toLowerCase()) ? -1 : 0));
    let html = $.templates(tmpl).render({ items: items });

    let tp = (window.innerHeight * 0.2 < getHeaderOffset()) ? 20 : window.innerHeight * 0.2;
    //display result in a table
    $(document.body).append(html);
    $("#compare_dialog").dialog({
      modal: false,
      position: {
        my: "center top+" + tp,
        at: "center top",
        of: $('#docs-container')
      },
      width: 750,
      height: 630,
      minWidth: 750,
      maxWidth: 900,
      minHeight: 542,
      maxHeight: 800,
      title: "Compare Your Values with GDC Values ",
      open: function () {

        var target = $(this).parent();
        target.find('.ui-dialog-titlebar').css('padding', '15px');
        target.find('.ui-dialog-titlebar-close').html('');
        if ((target.offset().top - windowEl.scrollTop()) <
          getHeaderOffset()) {
          target.css('top', (windowEl.scrollTop() +
            getHeaderOffset() + 20) + 'px');
        }

        $('#cp_result').css("display", "none");
        $('#compare').bind('click', function () {
          compare(items);
        });
        $('#cancelCompare').bind('click', function () {
          $("#compare_dialog").dialog('close');
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

export default toCompare;
