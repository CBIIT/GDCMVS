import tmpl from './to-compare.html';
import { compare, showCompareResult } from '../dialog'
import { apiGetGDCDataById } from '../../api';
import { getHeaderOffset, getScrollTop, htmlChildContent, searchFilter, searchFilterCR, getAllSyn, sortAlphabetically } from '../../shared';

const toCompare = (uid) => {
  uid = uid.replace(/@/g, '/');
  apiGetGDCDataById(uid, function (id, items) {
    if ($('#compare_dialog').length) {
      $('#compare_dialog').remove();
    }

    let header_template = htmlChildContent('HeaderTemplate', tmpl);
    let body_template = htmlChildContent('BodyTemplate', tmpl);
    let bottom_template = htmlChildContent('BottomTemplate', tmpl);

    // Collecting all synonyms and ncit code in one array for particular ICDO3 code
    if(items[0]._source.enum !== undefined){
      items = getAllSyn(items[0]._source.enum);
    }

    //open loading animation
    let isAnimated = false;
    if (items.length > 1000 ) isAnimated = true;
    if (isAnimated) $('#gdc-loading-icon').show();

    // Sort the list alphabetical order.
    items = sortAlphabetically(items);
    let header = $.templates(header_template).render();
    let html = $.templates(body_template).render({ items: items });
    let bottom = $.templates(bottom_template).render();

    setTimeout(() => {
      //display result in a table
      $(document.body).append(html);

      $("#compare_dialog").dialog({
        modal: false,
        width: 1200,
        height: 590,
        minWidth: 1200,
        maxWidth: 1200,
        minHeight: 590,
        maxHeight: 810,
        title: "Compare Your Values with GDC Values",
        open: function () {

          let previous_keyword = '';

          $(this).prev('.ui-dialog-titlebar').css('padding-top', '7.8em').html(header);
          $(this).after(bottom);

          let target = $(this).parent();
          if ((target.offset().top - getScrollTop()) < getHeaderOffset()) {
            target.css('top', (getScrollTop() + getHeaderOffset() + 10) + 'px');
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
            if (previous_keyword === keyword) return;
            previous_keyword = keyword;
            let keywordCase = $('#compare-input').val().trim().replace(/[\ ]+/g, " ");
            if (keyword.length >= 3) {
              if (isAnimated) $('#compare-input-icon').html('<i class="fa fa-spinner fa-pulse"></i>');
              setTimeout(() => {
                let new_item = searchFilter(items, keyword);
                $('#pagination-compare').pagination({
                  dataSource: new_item,
                  pageSize: 50,
                  callback: function(data, pagination) {
                    let html = templateList(data, keywordCase);
                    $('#cp_right').html(html);
                    if (isAnimated) $('#compare-input-icon').html('<i class="fa fa-search"></i>');
                  }
                });
              }, 100);
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
            if (prev_keyword === keyword) return;
            prev_keyword = keyword;
            let keywordCase = $('#compare-matched').val().trim().replace(/[\ ]+/g, " ");
            let isAnimatedMatch = false;
            if (keyword.length >= 3) {
              const items = $('#compare-matched').data('compareResult');
              const options = $('#compare-matched').data('options');

              if (items.length > 1000 ) isAnimatedMatch = true;
              if (isAnimatedMatch) $('#compare-input-icon').html('<i class="fa fa-spinner fa-pulse"></i>');

              setTimeout(() => {
                const new_item = searchFilterCR(items, keyword);
                $('#pagination-matched').pagination({
                  dataSource: new_item,
                  pageSize: 50,
                  callback: function(data, pagination) {
                    const html = showCompareResult(data, options, keywordCase);
                    $('#compare_result').html(html);
                    if (isAnimatedMatch) $('#compare-input-icon').html('<i class="fa fa-search"></i>');
                  }
                });
              }, 100);
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
          if (isAnimated) $('#gdc-loading-icon').hide()
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
            <div class="compare-form__ic_enum">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th class="table__th--term">Term</th>
                    <th class="table__th--source">Source</th>
                    <th class="table__th--type">Type</th>
                  </tr>
                </thead>
                ${item.ic_enum.map((ic_enum) =>`
                  <tr>
                    <td class="table__td--term">${ic_enum.n}</td>
                    <td class="table__td--source">ICD-O-3</td>
                    <td class="table__td--type">${ic_enum.term_type}</td>
                  </tr>
                `.trim()).join('')}
              </table>
            </div>
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
                        <th class="table__th--term">Term</th>
                        <th class="table__th--source"><a class="getSourceDetails" href="#">Source</a></th>
                        <th class="table__th--type"><a class="getTypeDetails" href="#">Type</a></th>
                      </tr>
                    </thead>
                    ${n_syn.s.map((s_r) =>`
                      <tr>
                        <td class="table__td--term">${s_r.termName}</td>
                        <td class="table__td--source">${s_r.termSource !== undefined && s_r.termSource !== null ? `${s_r.termSource}`: ``}</td>
                        <td class="table__td--type">${s_r.termGroup !== undefined && s_r.termGroup !== null? `${s_r.termGroup}`: ``}</td>
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
                          <th class="table__th--term">Term</th>
                          <th class="table__th--source"><a class="getSourceDetails" href="#">Source</a></th>
                          <th class="table__th--type"><a class="getTypeDetails" href="#">Type</a></th>
                        </tr>
                      </thead>
                      ${item.s.map((s_r) =>`
                        <tr>
                          <td class="table__td--term">${s_r.termName}</td>
                          <td class="table__td--source">${s_r.termSource !== undefined && s_r.termSource !== null ? `${s_r.termSource}`: ``}</td>
                          <td class="table__td--type">${s_r.termGroup !== undefined && s_r.termGroup !== null? `${s_r.termGroup}`: ``}</td>
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
