import tmpl from './to-compare.html';
import { compare } from '../dialog'
import { apiGetGDCDataById } from '../../api';
import { getHeaderOffset, htmlChildContent, removeDuplicateSynonyms } from '../../shared';

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
    let all_icdo3_syn = {};
    let header_template = htmlChildContent('HeaderTemplate', tmpl);
    let body_template = htmlChildContent('BodyTemplate', tmpl);
    let bottom_template = htmlChildContent('BottomTemplate', tmpl);

    // Collecting all synonyms and ncit in one array for particular ICDO3 code
    items.forEach(item => {
      if(item.i_c === undefined) return;
      if(item.i_c.c && all_icdo3_syn[item.i_c.c] === undefined){
        all_icdo3_syn[item.i_c.c] = { n_syn: [], checker_n_c: [item.n_c], all_syn: [] };
        all_icdo3_syn[item.i_c.c].n_syn.push({n_c: item.n_c, s: removeDuplicateSynonyms(item)});
        all_icdo3_syn[item.i_c.c].all_syn = all_icdo3_syn[item.i_c.c].all_syn.concat(removeDuplicateSynonyms(item));
      }else if(all_icdo3_syn[item.i_c.c] !== undefined && all_icdo3_syn[item.i_c.c].checker_n_c.indexOf(item.n_c) === -1){
        all_icdo3_syn[item.i_c.c].n_syn.push({n_c: item.n_c, s: removeDuplicateSynonyms(item)});
        all_icdo3_syn[item.i_c.c].all_syn = all_icdo3_syn[item.i_c.c].all_syn.concat(removeDuplicateSynonyms(item));
        all_icdo3_syn[item.i_c.c].checker_n_c.push(item.n_c);
      }
    });

    items.forEach(function (item) {
      item.s = removeDuplicateSynonyms(item);
      if (item.i_c !== undefined) {
        icdo = true;
      }
      if (item.gdc_d === false) {
        return;
      }
      if (item_checker[item.n] === undefined) {
        let tmp_item = {
          n: item.n,
          i_c: item.i_c ? item.i_c : undefined,
          n_syn: item.i_c && all_icdo3_syn[item.i_c.c] ? all_icdo3_syn[item.i_c.c].n_syn : item.n_c ? [{n_c: item.n_c, s: removeDuplicateSynonyms(item)}] : [],
          all_syn: item.i_c && all_icdo3_syn[item.i_c.c] ? all_icdo3_syn[item.i_c.c].all_syn : undefined
        }
        icdo_items.push(tmp_item);
        item_checker[item.n] = item;
    }
    });
    if (icdo) {
      items = icdo_items;
    }

    //open loading animation
    if (items.length > 500 ) {
      $('#gdc-loading-icon').show()
    }

    // Sort the list alphabetical order.
    items.sort((a, b) => (a.n.toLowerCase() > b.n.toLowerCase()) ? 1 : ((b.n.toLowerCase() > a.n.toLowerCase()) ? -1 : 0));
    let header = $.templates(header_template).render();
    let html = $.templates(body_template).render({ items: items });
    let bottom = $.templates(bottom_template).render();

    let tp = (window.innerHeight * 0.2 < getHeaderOffset()) ? 20 : window.innerHeight * 0.2;
    //display result in a table
    $(document.body).append(html);

    setTimeout(() => {
      $("#compare_dialog").dialog({
        modal: false,
        position: {
          my: "center top+" + tp,
          at: "center top",
          of: $('#docs-container')
        },
        width: 885,
        height: 605,
        minWidth: 860,
        maxWidth: 950,
        minHeight: 605,
        maxHeight: 700,
        title: "Compare Your Values with GDC Values",
        open: function () {

          $(this).prev('.ui-dialog-titlebar').css('padding-top', '7.5em').html(header);
          $(this).after(bottom);

          var target = $(this).parent();
          if ((target.offset().top - windowEl.scrollTop()) <
            getHeaderOffset()) {
            target.css('top', (windowEl.scrollTop() +
              getHeaderOffset() + 20) + 'px');
          }

          $('#cp_result').css("display", "none");
          $('#compare').bind('click', function () {
            compare(items);
          });
          $('#cancelCompare, #close_to_compare').bind('click', function () {
            $("#compare_dialog").dialog('close');
          });

          //remove loading animation
          if (items.length > 500) {
            $('#gdc-loading-icon').hide()
          }
        },
        close: function () {
          $(this).remove();
        }
      }).parent().draggable({
        containment: '#docs-container'
      });
    }, 100);
  });
}

export default toCompare;
