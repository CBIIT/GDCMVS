import tmpl from './gdc-terms.html';
import { apiGetGDCDataById } from '../../api';
import { getHeaderOffset, htmlChildContent, findWord } from '../../shared';

const GDCTerms = (uid, tgts) => {
  uid = uid.replace(/<b>/g, "").replace(/<\/b>/g, "");

  apiGetGDCDataById(uid, function (id, items) {
    if ($('#gdc_terms_data').length) {
      $('#gdc_terms_data').remove();
    }

    let targets = [];
    let icdo = false;
    let windowEl = $(window);
    let new_items = [];
    let new_item_checker = {};
    let tmp_obj = {};
    if (tgts !== null && tgts !== undefined) {
      targets = tgts.split("#");
    }
    let header_template = htmlChildContent('HeaderTemplate', tmpl);
    let body_template = htmlChildContent('BodyTemplate', tmpl);

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

    items.forEach(function (item) {
      let tt = item.term_type !== undefined ? item.term_type : "";
      let term_type = "";
      if (tt !== "") {
        term_type = tt === 'PT' ? '<b>(' + tt + ')</b>' : '(' + tt + ')';
      }
      if (item.i_c !== undefined) {
        if (item.i_c.c in tmp_obj) {
          if (tmp_obj[item.i_c.c].checker_n_c.indexOf(item.n_c) == -1) {
            if (item.n_c !== "" && item.s !== undefined && item.s.length !== 0) {
              tmp_obj[item.i_c.c].n_syn.push({
                n_c: item.n_c,
                s: item.s,
                s_r: item.s_r
              });
              tmp_obj[item.i_c.c].checker_n_c.push(item.n_c);
            }
          }
          if (item.n !== item.i_c.c) {
            if (tt === 'PT') {
              tmp_obj[item.i_c.c].n.unshift(item.n + " " + term_type);
            } else {
              tmp_obj[item.i_c.c].n.push(item.n + " " + term_type);
            }
          }
        } else {
          tmp_obj[item.i_c.c] = {
            c: item.i_c.c,
            have: item.i_c.have,
            n: [],
            n_syn: [{
              n_c: item.n_c,
              s: item.s,
              s_r: item.s_r
            }],
            checker_n_c: [item.n_c]
          };
          if (item.n !== item.i_c.c) {
            if (tt === 'PT') {
              tmp_obj[item.i_c.c].n.unshift(item.n + " " + term_type);
            } else {
              tmp_obj[item.i_c.c].n.push(item.n + " " + term_type);
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
        let tmp_data = {};
        if (tmp_obj[item.n] !== undefined && !new_item_checker[item.n]) {
          tmp_data.n = item.n;
          tmp_data.i_c = tmp_obj[item.n];
          tmp_data.n_c = item.n_c;
          tmp_data.s = item.s;
          tmp_data.s_r = item.s_r;
          if (targets.indexOf(item.n) !== -1) {
            tmp_data.e = true;
          }
          new_item_checker[item.n] = tmp_data;
        } else if (!new_item_checker[item.n]) {
          if (item.i_c !== undefined) {
            tmp_data.i_c = tmp_obj[item.i_c.c];
          }
          tmp_data.n = item.n;
          tmp_data.n_c = item.n_c;
          tmp_data.s = item.s;
          tmp_data.s_r = item.s_r;
          if (targets.indexOf(item.n) !== -1) {
            tmp_data.e = true;
          }
          new_item_checker[item.n] = tmp_data;
        }
        if (tmp_data.i_c !== undefined && tmp_data.i_c.checker_n_c) {
          delete tmp_data.i_c.checker_n_c;
        }
        if (isEmpty(tmp_data) === false) new_items.push(tmp_data);
      }
    });

    items = new_items;

    //open loading animation
    if (items.length > 500 ) {
      $('#gdc-loading-icon').show()
    }

    // Sort the list alphabetical order.
    items.sort((a, b) => (a.n.toLowerCase() > b.n.toLowerCase()) ? 1 : ((b.n.toLowerCase() > a.n.toLowerCase()) ? -1 : 0));

    let header = $.templates(header_template).render({
      targets: targets,
      icdo: icdo,
      items_length: items.length
    })
    let html = $.templates({
      markup: body_template,
      allowCode: true
    }).render({
      targets: targets,
      icdo: icdo,
      items: items
    });
    let tp = (window.innerHeight * 0.2 < getHeaderOffset()) ? getHeaderOffset() +
      20 : window.innerHeight * 0.2;

    //display result in a table
    $(document.body).append(html);


    let dialog_width = {
      width: 750,
      minWidth: 650,
      maxWidth: 900
    }

    if (icdo) {
      dialog_width.width = 900;
      dialog_width.minWidth = 900;
      dialog_width.maxWidth = 1000;
    }

    setTimeout(() => {
      $("#gdc_terms_data").dialog({
        modal: false,
        position: {
          my: "center top+" + tp,
          at: "center top",
          of: $('#docs-container')
        },
        width: dialog_width.width,
        height: 'auto',
        minWidth: dialog_width.minWidth,
        maxWidth: dialog_width.maxWidth,
        minHeight: 300,
        maxHeight: 600,
        open: function () {
          //add new custom header
          $(this).prev('.ui-dialog-titlebar').css('padding-top',
            '7.5em').html(header);
          var target = $(this).parent();
          if ((target.offset().top - windowEl.scrollTop()) < getHeaderOffset()) {
            target.css('top', (windowEl.scrollTop() + getHeaderOffset() +
              20) + 'px');
          }
          $('#close_gdc_terms_data').bind('click', function () {
            $("#gdc_terms_data").dialog('close');
          });
          $('#gdc-data-invariant').bind('click', function () {
            $("#gdc-syn-data-list").find('div[name="syn_area"]').each(
              function () {
                let rp = $(this).html();
                let invariant = $(this).parent().children(
                  'div[name="syn_invariant"]');
                $(this).html(invariant[0].innerHTML);
                invariant[0].innerHTML = rp;
              });
          });

          //remove loading animation
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

      if ($('#show_all_gdc_syn') !== undefined) {
        $('#show_all_gdc_syn').bind('click', function () {
          let v = $(this).prop("checked");
          if (v) {
            $('#gdc-syn-data-list .gdc-term__item--hide')
              .each(function () {
                $(this).removeClass('gdc-term__item--hide').addClass('gdc-term__item--show');
              });
          } else {
            $(
              '#gdc-syn-data-list .gdc-term__item--show'
            ).each(function () {
              if (!$(this).is('#gdc_term_item')) {
                $(this).removeClass('gdc-term__item--show').addClass('gdc-term__item--hide');
              }
            });
          }
        });
      }
    }, 100);
  });
}
function isEmpty(myObject) {
  for (var key in myObject) {
    if (myObject.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

export default GDCTerms;
