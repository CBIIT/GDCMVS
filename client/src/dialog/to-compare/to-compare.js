import tmpl from './to-compare.html';
import { compare } from '../dialog'
import { apiGetGDCDataById } from '../../api';
import { getHeaderOffset, findWord } from '../../shared';

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
    items.forEach(function (item) {
      if (item.i_c !== undefined) {
        icdo = true;
      }
      if (item.gdc_d === false) {
        return;
      }
      if (item_checker[item.n] === undefined) icdo_items.push(item);
      item_checker[item.n] = item;
    });

    //new synonyms list without duplicates
    items.forEach(function (it) {
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
      it.s_r = tmp_s;
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
