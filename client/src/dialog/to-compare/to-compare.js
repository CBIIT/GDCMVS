import tmpl from './to-compare.html';
import { compare } from '../dialog'
import { apiGetGDCDataById } from '../../api';
import { getHeaderOffset, htmlChildContent, removeDuplicateSynonyms, searchFilter } from '../../shared';

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
        if(item.n_c !== "") all_icdo3_syn[item.i_c.c].n_syn.push({n_c: item.n_c, s: removeDuplicateSynonyms(item)});
        if(item.n_c !== "" && item.s !== undefined) all_icdo3_syn[item.i_c.c].all_syn = all_icdo3_syn[item.i_c.c].all_syn.concat(removeDuplicateSynonyms(item));
      }else if(all_icdo3_syn[item.i_c.c] !== undefined && all_icdo3_syn[item.i_c.c].checker_n_c.indexOf(item.n_c) === -1){
        if(item.n_c !== "") all_icdo3_syn[item.i_c.c].n_syn.push({n_c: item.n_c, s: removeDuplicateSynonyms(item)});
        if(item.n_c !== "" && item.s !== undefined) all_icdo3_syn[item.i_c.c].all_syn = all_icdo3_syn[item.i_c.c].all_syn.concat(removeDuplicateSynonyms(item));
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
          ic_enum: item.i_c && item.ic_enum ? item.ic_enum : undefined,
          all_syn: item.i_c && all_icdo3_syn[item.i_c.c] ? all_icdo3_syn[item.i_c.c].all_syn : undefined,
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

    setTimeout(() => {
      //display result in a table
      $(document.body).append(html);

      $("#compare_dialog").dialog({
        modal: false,
        position: {
          my: "center top+" + tp,
          at: "center top",
          of: $('#docs-container')
        },
        width: 1200,
        height: 590,
        minWidth: 1200,
        maxWidth: 1200,
        minHeight: 590,
        maxHeight: 810,
        title: "Compare Your Values with GDC Values",
        open: function () {

          let previous_keyword = '';

          $(this).prev('.ui-dialog-titlebar').css('padding-top', '7.5em').html(header);
          $(this).after(bottom);

          var target = $(this).parent();
          if ((target.offset().top - windowEl.scrollTop()) < getHeaderOffset()) {
            target.css('top', (windowEl.scrollTop() + getHeaderOffset() + 20) + 'px');
          } else {
            target.css('top', (target.offset().top - 50) + 'px');
          }

          $('#cp_result').css("display", "none");
          $('#compare').bind('click', function () {
            compare(items);
          });
          $('#cancelCompare, #close_to_compare').bind('click', function () {
            $("#compare_dialog").dialog('close');
          });

          $('#pagination-compare').pagination({
            dataSource: items,
            pageSize: 50,
            callback: function(data, pagination) {
              //let invariant = $('#gdc-data-invariant').prop("checked");
              let html = templateList(data);
              $('#cp_right').html(html);
            }
          });

          $('#compare-input').bind('mousedown', (e) => {
            $(e.currentTarget).focus();
            target.draggable('disable');
          });

          target.bind('mousedown', (e) => {
            $(e.currentTarget).draggable('enable');
          });

          // Add Search Filter functionality
          $('#compare-input').on('input', () => {
            let keyword = $('#compare-input').val().trim().replace(/[\ ]+/g, " ").toLowerCase();
            if(previous_keyword === keyword) return;
            previous_keyword = keyword;
            let keywordCase = $('#compare-input').val().trim().replace(/[\ ]+/g, " ");
            if(keyword.length >= 3) {
              let new_item = searchFilter(items, keyword);
              $('#pagination-compare').pagination({
                dataSource: new_item,
                pageSize: 50,
                callback: function(data, pagination) {
                  //let invariant = $('#gdc-data-invariant').prop("checked");
                  let html = templateList(data);
                  $('#cp_right').html(html);
                }
              });
            } else {
              $('#pagination-compare').pagination({
                dataSource: items,
                pageSize: 50,
                callback: function(data, pagination) {
                  //let invariant = $('#gdc-data-invariant').prop("checked");
                  let html = templateList(data);
                  $('#cp_right').html(html);
                }
              });
            }
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

const templateList = (items) => {
  return `${items.map((item) => `
    <div class="compare-form__values">
    ${item.n_syn !== undefined && item.n_syn.length !== 0 ? `
      <div>
        <div class="compare-form__value">${item.n}</div>
        <a class="compare-form__toggle" href="#" aria-label="expand" title="expand" aria-expanded="false">
          <i class="fa fa-plus"></i>
        </a>
      </div>
      <div class="compare-form__synm" style="display: none;">
      ${item.i_c !== undefined ? `
        <div class="compare-form__i_c">
          <div class="compare-form__ic_c">${item.i_c.c} (ICD-O-3)</div>
          <div class="compare-form__ic_enum">${item.ic_enum.map((ic_enum) => `${ic_enum}</br>`.trim()).join('')}</div>
        </div>
      `:``}
      ${item.n_syn.map((n_syn) => `
        ${n_syn.s !== undefined && n_syn.s.length !== 0 ? `
          <div class="compare-form__n_syn">
            <div class="compare-form__n_c">${n_syn.n_c} (NCIt)</div>
            <div class="compare-form__s">${n_syn.s.map((s) => `${s}</br>`.trim()).join('')}</div>
          </div>
        `:``}
      `.trim()).join('')}
      </div>
    `:`
      ${item.s !== undefined && item.s.length !== 0 ? `
        <div>
          <div class="compare-form__value">${item.n}</div>
          <a class="compare-form__toggle" href="#" aria-label="expand" title="expand" aria-expanded="false">
            <i class="fa fa-plus"></i>
          </a>
        </div>
        <div class="compare-form__synm" style="display: none;">
        ${item.s.length !== 0 ? `
          <div class="compare-form__n_syn">
            <div class="compare-form__n_c">${item.n_c} (NCIt)</div>
            <div class="compare-form__s">${item.s.map((s) => `${s}</br>`.trim()).join('')}</div>
          </div>
        `:``}
        </div>
      `:`
        <div>
          <div class="compare-form__value">${item.n}</div>
        </div>
      `}
    `}
    </div>
  `.trim()).join('')}`
}

export default toCompare;
