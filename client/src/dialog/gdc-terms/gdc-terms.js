import tmpl from './gdc-terms.html';
import { apiGetGDCDataById } from '../../api';
import { getHeaderOffset, htmlChildContent, searchFilter, getAllSyn } from '../../shared';

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
    if (tgts !== null && tgts !== undefined) {
      targets = tgts.split("#");
    }
    let header_template = htmlChildContent('HeaderTemplate', tmpl);
    let footer_template = htmlChildContent('FooterTemplate', tmpl);
    let all_syns = getAllSyn(items);
    items.forEach(item => {
      if(new_item_checker[item.n]) return;
      if (item.i_c !== undefined) {
        icdo = true;
      }
      if (item.gdc_d === true) {
        if(item.i_c !== undefined){
          if(all_syns[item.i_c.c] !== undefined){
            if(item.n_c) delete item.n_c;
            if(item.s) delete item.s;
            item.n_syn = all_syns[item.i_c.c].n_syn;
            item.all_syn = all_syns[item.i_c.c].all_syn;
            new_items.push(item);
          }
        }else{
          new_items.push(item);
        }
      }
      new_item_checker[item.n] = item;
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
    });

    let html = '<div id="gdc_terms_data"></div>';
    let tp = (window.innerHeight * 0.2 < getHeaderOffset()) ? getHeaderOffset() +
      20 : window.innerHeight * 0.2;

    setTimeout(() => {
      //display result in a table
      $(document.body).append(html);

      let dialog_width = {
        width: 800,
        minWidth: 700,
        maxWidth: 900
      }

      if (icdo) {
        dialog_width.width = 1000;
        dialog_width.minWidth = 1050;
        dialog_width.maxWidth = 1150;
      }

      $("#gdc_terms_data").dialog({
        modal: false,
        position: {
          my: "center top+" + tp,
          at: "center top",
          of: $('#docs-container')
        },
        width: dialog_width.width,
        height: 550,
        minWidth: dialog_width.minWidth,
        maxWidth: dialog_width.maxWidth,
        minHeight: 550,
        maxHeight: 600,
        open: function () {
          let previous_keyword = "";
          //add new custom header
          $(this).prev('.ui-dialog-titlebar').css('padding-top', '7.8em').html(header);
          var target = $(this).parent();
          if ((target.offset().top - windowEl.scrollTop()) < getHeaderOffset()) {
            target.css('top', (windowEl.scrollTop() + getHeaderOffset() + 20) + 'px');
          } else {
            target.css('top', (target.offset().top - 50) + 'px');
          }

          $('#close_gdc_terms_data').bind('click', function () {
            $("#gdc_terms_data").dialog('close');
          });
          $('#gdc-data-invariant').bind('click', function () {
            let v = $(this).prop("checked");
            if (v) {
              $("#gdc-syn-data-list").find('div[name="syn_area"]').each(function () {
                $(this).hide();
              });
              $("#gdc-syn-data-list").find('div[name="syn_invariant"]').each(function () {
                $(this).show();
              });
            } else {
              $("#gdc-syn-data-list").find('div[name="syn_area"]').each(function () {
                $(this).show();
              });
              $("#gdc-syn-data-list").find('div[name="syn_invariant"]').each(function () {
                $(this).hide();
              });
            }
          });

          $(this).after(footer_template);

          $('#pagination-container').pagination({
            dataSource: items,
            pageSize: 50,
            callback: function(data, pagination) {
              let html = templateList(data, icdo);
              $('#gdc_terms_data').html(html);
            }
          });

          $('#gdc-values-input').bind('mousedown', (e) => {
            $(e.currentTarget).focus();
            target.draggable('disable');
          });

          target.bind('mousedown', (e) => {
            $(e.currentTarget).draggable('enable');
          });

          // Add Search Filter functionality
          $('#gdc-values-input').on('input', () => {
            let keyword = $('#gdc-values-input').val().trim().replace(/[\ ]+/g, " ").toLowerCase();
            if(previous_keyword === keyword) return;
            previous_keyword = keyword;
            let keywordCase = $('#gdc-values-input').val().trim().replace(/[\ ]+/g, " ");
            if(keyword.length >= 3) {
              let new_item = searchFilter(items, keyword);
              $('#pagination-container').pagination({
                dataSource: new_item,
                pageSize: 50,
                callback: function(data, pagination) {
                  let html = templateList(data, icdo, keywordCase);
                  $('#gdc_terms_data').html(html);
                }
              });
            } else {
              $('#pagination-container').pagination({
                dataSource: items,
                pageSize: 50,
                callback: function(data, pagination) {
                  let html = templateList(data, icdo, keywordCase);
                  $('#gdc_terms_data').html(html);
                }
              });
            }
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

const isEmpty = (myObject) => {
  for (var key in myObject) {
    if (myObject.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

const templateList = (items, icdo, keywordCase) => {
  return `${items.length !== 0 ? `
    <div id="gdc-syn-data-list" class="table__container">
      <div class="table__body row">
        <div id="gdc-syn-container" class="col-xs-12">
          ${items.map((item, i) => `
          <div id="gdc_term_item" class="table__row row gdc-term__item--show">
          ${icdo ? `
            <div class="table__td col-xs-2">${item.n}</div>
            <div class="table__td col-xs-2">${item.i_c ? `${item.i_c.c}`:``}</div>
            <div class="table__td col-xs-3">${item.i_c ? `${item.ic_enum ? `
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th class="table__th--term">Term</th>
                    <th class="table__th--source">Source</th>
                    <th class="table__th--type">Type</th>
                  </tr>
                </thead>
                ${item.ic_enum.map((n) =>`
                  <tr>
                    <td class="table__td--term"><p class="table_td-term">${n.n}</p></td>
                    <td class="table__td--source">ICD-O-3</td>
                    <td class="table__td--type">${n.term_type}</td>
                  </tr>
                `.trim()).join('')}`:``}`:``}
              </table>
            </div>
            <div class="col-xs-5">
            ${item.n_syn ? `
              ${item.n_syn.map((n_syn) =>`
              <div class="row">
                <div class="table__td col-xs-4">
                  ${n_syn.n_c !== undefined && n_syn.n_c !== "" ? `<a class="getNCITDetails" href="#" data-uid="${n_syn.n_c}">${n_syn.n_c}</a>`:``}
                </div>
                <div name="syn_area" class="table__td col-xs-8">
                ${n_syn.s !== undefined ? `
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th class="table__th--term">Term</th>
                        <th class="table__th--source"><a class="getSourceDetails" href="#">Source</a></th>
                        <th class="table__th--type"><a class="getTypeDetails" href="#">Type</a></th>
                      </tr>
                    </thead>
                    ${n_syn.s.map((s) =>`
                      <tr>
                        <td class="table__td--term"><p class="table_td-term">${s.termName}</p></td>
                        <td class="table__td--source">${s.termSource !== undefined && s.termSource !== null ? s.termSource : ``}</td>
                        <td class="table__td--type">${s.termGroup !== undefined && s.termGroup !== null ? s.termGroup : ``}</td>
                      </tr>
                    `.trim()).join('')}
                    </table>
                  `:``}
                </div>
              </div>
              `.trim()).join('')}
            `:`
              <div class="row">
                <div class="table__td col-xs-4">
                  ${item.n_c !== undefined && item.n_c !== "" ? `<a class="getNCITDetails" href="#" data-uid="${item.n_c}">${item.n_c}</a>`:``}
                </div>
                <div name="syn_area" class="table__td col-xs-8">
                  ${item.s !== undefined && item.n_c !== undefined && item.n_c !== "" ? `
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th class="table__th--term">Term</th>
                          <th class="table__th--source"><a class="getSourceDetails" href="#">Source</a></th>
                          <th class="table__th--type"><a class="getTypeDetails" href="#">Type</a></th>
                        </tr>
                      </thead>
                      ${item.s.map((s) =>`
                        <tr>
                          <td class="table__td--term"><p class="table_td-term">${s.termName}</p></td>
                          <td class="table__td--source">${s.termSource !== undefined && s.termSource !== null ? s.termSource : ``}</td>
                          <td class="table__td--type">${s.termGroup !== undefined && s.termGroup !== null ? s.termGroup : ``}</td>
                        </tr>
                      `.trim()).join('')}
                    </table>
                  `:``}
                </div>
              </div>
            `}
            </div>
          ` : `
            <div class="table__td col-xs-5">${item.n}</div>
            <div class="col-xs-7">
            ${item.n_syn ? `
              ${item.n_syn.map((n_syn) =>`
                <div class="row">
                  <div class="table__td col-xs-4">
                    ${n_syn.n_c !== undefined && n_syn.n_c !== "" ? `<a class="getNCITDetails" href="#" data-uid="${n_syn.n_c}">${n_syn.n_c}</a>`:``}
                  </div>
                  <div name="syn_area" class="table__td col-xs-8">
                  ${n_syn.s !== undefined ? `
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th class="table__th--term">Term</th>
                          <th class="table__th--source"><a class="getSourceDetails" href="#">Source</a></th>
                          <th class="table__th--type"><a class="getTypeDetails" href="#">Type</a></th>
                        </tr>
                      </thead>
                      ${n_syn.s.map((s) =>`
                        <tr>
                          <td class="table__td--term"><p class="table_td-term">${s.termName}</p></td>
                          <td class="table__td--source">${s.termSource !== undefined && s.termSource !== null ? s.termSource : ``}</td>
                          <td class="table__td--type">${s.termGroup !== undefined && s.termGroup !== null ? s.termGroup : ``}</td>
                        </tr>
                    `.trim()).join('')}
                    </table>
                  `:``}
                  </div>
                </div>
              `.trim()).join('')}
            `:`
              <div class="row">
                <div class="table__td col-xs-4">
                  ${item.n_c !== undefined && item.n_c !== "" ? `<a class="getNCITDetails" href="#" data-uid="${item.n_c}">${item.n_c}</a>`:``}
                </div>
                <div name="syn_area" class="table__td col-xs-8">
                  ${item.s !== undefined && item.n_c !== undefined && item.n_c !== "" ? `
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th class="table__th--term">Term</th>
                          <th class="table__th--source"><a class="getSourceDetails" href="#">Source</a></th>
                          <th class="table__th--type"><a class="getTypeDetails" href="#">Type</a></th>
                        </tr>
                      </thead>
                      ${item.s.map((s) =>`
                        <tr>
                          <td class="table__td--term"><p class="table_td-term">${s.termName}</p></td>
                          <td class="table__td--source">${s.termSource !== undefined && s.termSource !== null ? s.termSource : ``}</td>
                          <td class="table__td--type">${s.termGroup !== undefined && s.termGroup !== null ? s.termGroup : ``}</td>
                        </tr>
                      `.trim()).join('')}
                    </table>
                  `:``}
                </div>
              </div>
            `}
            </div>
          `}
          </div>`.trim()).join('')}
        </div>
      </div>
    </div>
  `: `
    <div  class="dialog__indicator">
      <div class="dialog__indicator-content">
        Sorry, no results found for keyword: <span class="dialog__indicator-term">${keywordCase}</span>
      </div>
    </div>
  `} `
}

export default GDCTerms;
