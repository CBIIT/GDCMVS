import tmpl from './view';
import api from '../../api';
import shared from '../../shared';

export default function getGDCTerms(uid, tgts) {
  api.getGDCDataById(uid, function (id, items) {
    if ($('#gdc_terms_data').length) {
      $('#gdc_terms_data').remove();
    }

    let targets = [];
    let icdo = false;
    let windowEl = $(window);
    let new_items = [];
    let tmp_obj = {};
    if (tgts !== null && tgts !== undefined) {
      targets = tgts.split("#");
    }

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
      if (item.i_c !== undefined) {
        if (item.i_c.c in tmp_obj) {
          if (tmp_obj[item.i_c.c].checker_n_c.indexOf(item.n_c) == -1) {
            if(item.n_c !== "" && item.s.length !== 0) {
              tmp_obj[item.i_c.c].n_syn.push({
                n_c: item.n_c,
                s: item.s,
                s_r: item.s_r
              });
              tmp_obj[item.i_c.c].checker_n_c.push(item.n_c);
            }
          }
          tmp_obj[item.i_c.c].n.push(item.n);
        } else {
          tmp_obj[item.i_c.c] = {
            c: item.i_c.c,
            have: item.i_c.have,
            n: [item.n],
            n_syn: [{
              n_c: item.n_c,
              s: item.s,
              s_r: item.s_r
            }],
            checker_n_c: [item.n_c]
          };
        }
      }
    });
    items.forEach(function (item) {
      if (item.i_c !== undefined) {
        icdo = true;
      }
      if (item.gdc_d === true) {
        let tmp_data = {};
        if (tmp_obj[item.n] !== undefined) {
          tmp_data.n = item.n;
          tmp_data.i_c = tmp_obj[item.n];
          tmp_data.n_c = item.n_c;
          tmp_data.s = item.s;
          tmp_data.s_r = item.s_r;
        } else {
          if (item.i_c !== undefined) {
            tmp_data.i_c = tmp_obj[item.i_c.c];
          }
          tmp_data.n = item.n;
          tmp_data.n_c = item.n_c;
          tmp_data.s = item.s;
          tmp_data.s_r = item.s_r;
        }
        if (targets.indexOf(item.n) !== -1) {
          tmp_data.e = true;
        }
        if (tmp_data.i_c !== undefined && tmp_data.i_c.checker_n_c) {
          delete tmp_data.i_c.checker_n_c;
        }
        new_items.push(tmp_data);
      }
    });

    items = new_items;

    let header = $.templates(tmpl.header).render({
      targets: targets,
      icdo: icdo,
      items_length: items.length
    })
    let html = $.templates({
      markup: tmpl.body,
      allowCode: true
    }).render({
      targets: targets,
      icdo: icdo,
      items: items
    });
    let tp = (window.innerHeight * 0.2 < shared.headerOffset()) ? shared.headerOffset() +
      20 : window.innerHeight * 0.2;

    //display result in a table
    $(document.body).append(html);

    $("#gdc_terms_data").dialog({
      modal: false,
      position: {
        my: "center top+" + tp,
        at: "center top",
        of: $('#docs-container')
      },
      width: 900,
      height: 'auto',
      minWidth: 900,
      maxWidth: 1000,
      minHeight: 300,
      maxHeight: 600,
      open: function () {
        //add new custom header
        $(this).prev('.ui-dialog-titlebar').css('padding-top',
          '7.5em').html(header);
        var target = $(this).parent();
        if ((target.offset().top - windowEl.scrollTop()) < shared.headerOffset()) {
          target.css('top', (windowEl.scrollTop() + shared.headerOffset() +
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
          $('#gdc-syn-data-list div.table__row[style="display: none;"]')
            .each(function () {
              $(this).css("display", "block");
            });
        } else {
          $(
            '#gdc-syn-data-list div.table__row[style="display: block;"]'
          ).each(function () {
            $(this).css("display", "none");
          });
        }
      });
    }

  }, function() {
    //show the notification alert error
    let alertError = $('#alert-error');
    alertError.removeClass('animated fadeInDownUp').css({'display': 'none'});
    let animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    alertError.css({'display': 'block', 'top': (shared.headerOffset() + 20 ) + 'px'}).addClass('animated fadeInDownUp').one(animationEnd, function() {
      alertError.css({'display': 'none'})
    });
  });
}
