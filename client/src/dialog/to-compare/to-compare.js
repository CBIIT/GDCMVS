import tmpl from './to-compare.html';
import { compare, showCompareResult } from '../dialog'
import { apiGetGDCDataById } from '../../api';
import { getHeaderOffset, htmlChildContent, searchFilter,searchFilterCR , getAllSyn } from '../../shared';

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
    let header_template = htmlChildContent('HeaderTemplate', tmpl);
    let body_template = htmlChildContent('BodyTemplate', tmpl);
    let bottom_template = htmlChildContent('BottomTemplate', tmpl);

    // Collecting all synonyms and ncit code in one array for particular ICDO3 code
    let all_icdo3_syn = getAllSyn(items);

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
          i_c: item.i_c ? item.i_c : undefined,
          n_syn: item.i_c && all_icdo3_syn[item.i_c.c] ? all_icdo3_syn[item.i_c.c].n_syn : item.n_c ? [{n_c: item.n_c, s: item.s}] : [],
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

          $('#compare-input, #compare-matched').bind('mousedown', (e) => {
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
                  let html = templateList(data, keywordCase);
                  $('#cp_right').html(html);
                }
              });
            } else {
              $('#pagination-compare').pagination({
                dataSource: items,
                pageSize: 50,
                callback: function(data, pagination) {
                  let html = templateList(data, keywordCase);
                  $('#cp_right').html(html);
                }
              });
            }
          });

          let prev_keyword = "";
          $('#compare-matched').on('input', () => {
            let keyword = $('#compare-matched').val().trim().replace(/[\ ]+/g, " ").toLowerCase();
            if(prev_keyword === keyword) return;
            prev_keyword = keyword;
            let keywordCase = $('#compare-matched').val().trim().replace(/[\ ]+/g, " ");
            if(keyword.length >= 3) {
              const items = $('#compare-matched').data('compareResult');
              const options = $('#compare-matched').data('options');
              const new_item = searchFilterCR(items, keyword);

              $('#pagination-matched').pagination({
                dataSource: new_item,
                pageSize: 50,
                callback: function(data, pagination) {
                  const html = showCompareResult(data, options, keywordCase);
                  $('#compare_result').html(html);
                }
              });

            } else {
              const items = $('#compare-matched').data('compareResult');
              const options = $('#compare-matched').data('options');

              $('#pagination-matched').pagination({
                dataSource: items,
                pageSize: 50,
                callback: function(data, pagination) {
                  const html = showCompareResult(data, options, keywordCase);
                  $('#compare_result').html(html);
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

const templateList = (items, keywordCase) => {
  return `${items.length > 0 ? `
    ${items.map((item) => `
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
              <div class="compare-form__s">
                ${n_syn.s !== undefined ? `
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>Term</th>
                        <th>Source</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    ${n_syn.s.map((s_r) =>`
                      <tr>
                        <td>${s_r.termName}</td>
                        ${s_r.termSource !== undefined && s_r.termSource !== null ? `<td>${s_r.termSource}</td>`: ``}
                        ${s_r.termGroup !== undefined && s_r.termGroup !== null? `<td>${s_r.termGroup}</td>`: ``}
                      </tr>
                    `.trim()).join('')}
                    </table>
                `:``}
              </div>
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
              <div class="compare-form__s">
                ${item.s !== undefined ? `
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th>Term</th>
                          <th>Source</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      ${item.s.map((s_r) =>`
                        <tr>
                          <td>${s_r.termName}</td>
                          ${s_r.termSource !== undefined && s_r.termSource !== null ? `<td>${s_r.termSource}</td>`: ``}
                          ${s_r.termGroup !== undefined && s_r.termGroup !== null? `<td>${s_r.termGroup}</td>`: ``}
                        </tr>
                      `.trim()).join('')}
                      </table>
                  `:``}
              </div>
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
    `.trim()).join('')}`:`
    <div  class="dialog__indicator">
      <div class="dialog__indicator-content">
        Sorry, no results found for keyword: <span class="dialog__indicator-term">${keywordCase}</span>
      </div>
    </div>
    `}`
}

export default toCompare;
