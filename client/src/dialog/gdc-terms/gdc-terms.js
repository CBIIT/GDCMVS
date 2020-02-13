import { headerTemplate, listTemplate, footerTemplate } from './gdc-terms-view';
import { apiGetGDCDataById } from '../../api';
import { getHeaderOffset, getScrollTop, searchFilter, getAllSyn, sortAlphabetically } from '../../shared';

const GDCTerms = (uid, tgts) => {
  uid = uid.replace(/<b>/g, '').replace(/<\/b>/g, '');

  apiGetGDCDataById(uid, function (id, items) {
    if ($('#gdc_terms_data').length) {
      $('#gdc_terms_data').remove();
    }
    let targets = [];
    let icdo = false;
    if (tgts !== null && tgts !== undefined) {
      targets = tgts.split('#');
    }

    if (items[0]._source.enum !== undefined) {
      items[0]._source.enum.forEach(value => {
        if (icdo === true) return;
        if (value.i_c !== undefined) {
          icdo = true;
        }
      });
      items = getAllSyn(items[0]._source.enum);
    }

    // open loading animation
    let isAnimated = false;
    if (items.length > 1000) isAnimated = true;
    if (isAnimated) $('#gdc-loading-icon').show();

    // Sort the list alphabetical order.
    items = sortAlphabetically(items);

    let header = headerTemplate(targets.length, icdo, items.length);
    let html = '<div id="gdc_terms_data"></div>';
    let footer = footerTemplate;

    setTimeout(() => {
      // display result in a table
      $(document.body).append(html);

      let dialogWidth = {
        width: 800,
        minWidth: 700,
        maxWidth: 900
      };

      if (icdo) {
        dialogWidth.width = 1000;
        dialogWidth.minWidth = 1050;
        dialogWidth.maxWidth = 1150;
      }

      $('#gdc_terms_data').dialog({
        modal: false,
        width: dialogWidth.width,
        height: 550,
        minWidth: dialogWidth.minWidth,
        maxWidth: dialogWidth.maxWidth,
        minHeight: 550,
        maxHeight: 600,
        open: function () {
          let previousKeyword = '';
          // add new custom header
          $(this).prev('.ui-dialog-titlebar').css('padding-top', '7.8em').html(header);

          let target = $(this).parent();
          if ((target.offset().top - getScrollTop()) < getHeaderOffset()) {
            target.css('top', (getScrollTop() + getHeaderOffset() + 10) + 'px');
          }

          $('#close_gdc_terms_data').bind('click', function () {
            $('#gdc_terms_data').dialog('close');
          });

          $('#gdc-data-invariant').bind('click', function () {
            let v = $(this).prop('checked');
            if (v) {
              $('#gdc-syn-data-list').find('div[name="syn_area"]').each(function () {
                $(this).hide();
              });
              $('#gdc-syn-data-list').find('div[name="syn_invariant"]').each(function () {
                $(this).show();
              });
            } else {
              $('#gdc-syn-data-list').find('div[name="syn_area"]').each(function () {
                $(this).show();
              });
              $('#gdc-syn-data-list').find('div[name="syn_invariant"]').each(function () {
                $(this).hide();
              });
            }
          });

          $(this).after(footer);

          $('#pagination-container').pagination({
            dataSource: items,
            pageSize: 50,
            callback: function (data, pagination) {
              let html = listTemplate(data, icdo);
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
            let keyword = $('#gdc-values-input').val().trim().replace(/[\ ]+/g, ' ').toLowerCase();
            if (previousKeyword === keyword) return;
            previousKeyword = keyword;
            let keywordCase = $('#gdc-values-input').val().trim().replace(/[\ ]+/g, ' ');
            if (keyword.length >= 3) {
              if (isAnimated) $('#gdc-values-icon').html('<i class="fa fa-spinner fa-pulse"></i>');
              setTimeout(() => {
                let newItem = searchFilter(items, keyword);
                $('#pagination-container').pagination({
                  dataSource: newItem,
                  pageSize: 50,
                  callback: function (data, pagination) {
                    let html = listTemplate(data, icdo, keywordCase);
                    $('#gdc_terms_data').html(html);
                    if (isAnimated) $('#gdc-values-icon').html('<i class="fa fa-search"></i>');
                  }
                });
              }, 100);
            } else {
              $('#pagination-container').pagination({
                dataSource: items,
                pageSize: 50,
                callback: function (data, pagination) {
                  let html = listTemplate(data, icdo, keywordCase);
                  $('#gdc_terms_data').html(html);
                }
              });
            }
          });

          // remove loading animation
          if (isAnimated) $('#gdc-loading-icon').hide();
        },
        close: function () {
          $(this).remove();
        }
      }).parent().draggable({
        containment: '#docs-container'
      });

      if ($('#show_all_gdc_syn') !== undefined) {
        $('#show_all_gdc_syn').bind('click', function () {
          let v = $(this).prop('checked');
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
};

export default GDCTerms;
