import { headerTemplate, bodyTemplate, footerTemplate, listTemplate, showCompareResult } from './to-compare-view';
import { apiGetGDCDataById } from '../../api';
import { getHeaderOffset, getScrollTop, searchFilter, searchFilterCR, getAllSyn, sortAlphabetically } from '../../shared';

const toCompare = (uid) => {
  uid = uid.replace(/@/g, '/');
  apiGetGDCDataById(uid, function (id, items) {
    if ($('#compare_dialog').length) {
      $('#compare_dialog').remove();
    }

    // Collecting all synonyms and ncit code in one array for particular ICDO3 code
    if (items[0]._source.enum !== undefined) {
      items = getAllSyn(items[0]._source.enum);
    }

    // open loading animation
    let isAnimated = false;
    if (items.length > 1000) isAnimated = true;
    if (isAnimated) $('#gdc-loading-icon').show();

    // Sort the list alphabetical order.
    items = sortAlphabetically(items);
    let header = headerTemplate;
    let html = bodyTemplate;
    let bottom = footerTemplate;

    setTimeout(() => {
      // display result in a table
      $(document.body).append(html);

      $('#compare_dialog').dialog({
        modal: false,
        width: 1200,
        height: 590,
        minWidth: 1200,
        maxWidth: 1200,
        minHeight: 590,
        maxHeight: 810,
        title: 'Compare Your Values with GDC Values',
        open: function () {
          let previousKeyword = '';
          let previousMatchedKeyword = '';

          $(this).prev('.ui-dialog-titlebar').css('padding-top', '7.8em').html(header);
          $(this).after(bottom);

          let target = $(this).parent();
          if ((target.offset().top - getScrollTop()) < getHeaderOffset()) {
            target.css('top', (getScrollTop() + getHeaderOffset() + 10) + 'px');
          }

          $('#cp_result').css('display', 'none');
          $('#compare').bind('click', function () {
            compare(items);
          });
          $('#cancelCompare, #close_to_compare').bind('click', function () {
            $('#compare_dialog').dialog('close');
          });

          $('#pagination-compare').pagination({
            dataSource: items,
            pageSize: 50,
            callback: function (data, pagination) {
              let html = listTemplate(data);
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
            let keyword = $('#compare-input').val().trim().replace(/[\ ]+/g, ' ').toLowerCase();
            if (previousKeyword === keyword) return;
            previousKeyword = keyword;
            let keywordCase = $('#compare-input').val().trim().replace(/[\ ]+/g, ' ');
            if (keyword.length >= 3) {
              if (isAnimated) $('#compare-input-icon').html('<i class="fa fa-spinner fa-pulse"></i>');
              setTimeout(() => {
                const newItem = searchFilter(items, keyword);
                $('#pagination-compare').pagination({
                  dataSource: newItem,
                  pageSize: 50,
                  callback: function (data, pagination) {
                    let html = listTemplate(data, keywordCase);
                    $('#cp_right').html(html);
                    if (isAnimated) $('#compare-input-icon').html('<i class="fa fa-search"></i>');
                  }
                });
              }, 100);
            } else {
              $('#pagination-compare').pagination({
                dataSource: items,
                pageSize: 50,
                callback: function (data, pagination) {
                  let html = listTemplate(data, keywordCase);
                  $('#cp_right').html(html);
                }
              });
            }
          });

          // Add Search Filter functionality for matches
          $('#compare-matched').on('input', () => {
            let keyword = $('#compare-matched').val().trim().replace(/[\ ]+/g, ' ').toLowerCase();
            if (previousMatchedKeyword === keyword) return;
            previousMatchedKeyword = keyword;
            let keywordCase = $('#compare-matched').val().trim().replace(/[\ ]+/g, ' ');
            let isAnimatedMatch = false;
            if (keyword.length >= 3) {
              const items = $('#compare-matched').data('compareResult');
              const options = $('#compare-matched').data('options');

              if (items.length > 1000) isAnimatedMatch = true;
              if (isAnimatedMatch) $('#compare-input-icon').html('<i class="fa fa-spinner fa-pulse"></i>');

              setTimeout(() => {
                const newItem = searchFilterCR(items, keyword);
                $('#pagination-matched').pagination({
                  dataSource: newItem,
                  pageSize: 50,
                  callback: function (data, pagination) {
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
                callback: function (data, pagination) {
                  const html = showCompareResult(data, options, keywordCase);
                  $('#compare_result').html(html);
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
    }, 100);
  });
};

const compare = (gv) => {
  if ($('#cp_input').val().trim() === '') {
    $('#cp_massage').html('Please type in user defined values.');
  } else {
    // open loading animation
    let isAnimated = false;
    if (gv.length > 500) isAnimated = true;
    if (isAnimated) $('#gdc-loading-icon').show();

    setTimeout(() => {
      // compare and render
      $('#cp_massage').html('');
      $('#compare_form').css('display', 'none');
      $('#compare_result').css('display', 'block');

      $('#compare-input').hide();
      $('#compare-matched').show();
      $('#compare_download').show();

      $('#compare').hide();
      $('#cancelCompare').hide();
      $('#cp_bottom-matched').show();

      let vs = $('#cp_input').val().split(/\n/);

      let options = {};

      options.partial = $('#compare_filter').prop('checked');
      options.unmatched = $('#compare_unmatched').prop('checked');
      options.synonyms = $('#compare_synonyms').prop('checked');
      const items = compareGDCvalues(vs, gv, options);
      $('#compare-matched').data('compareResult', items);
      $('#compare-matched').data('options', options);

      $('#pagination-matched').pagination({
        dataSource: items,
        pageSize: 50,
        callback: function (data, pagination) {
          const html = showCompareResult(data, options);
          $('#compare_result').html(html);
        }
      });

      $('#compare_filter').bind('click', function () {
        if (!$('#compare_result').is(':visible')) return;
        let options = {};
        options.partial = $('#compare_filter').prop('checked');
        options.unmatched = $('#compare_unmatched').prop('checked');
        options.synonyms = $('#compare_synonyms').prop('checked');

        if (isAnimated) $('#gdc-loading-icon').show();

        setTimeout(() => {
          const items = compareGDCvalues(vs, gv, options);
          $('#compare-matched').data('compareResult', items);
          $('#compare-matched').data('options', options);

          $('#pagination-matched').pagination({
            dataSource: items,
            pageSize: 50,
            callback: function (data, pagination) {
              const html = showCompareResult(data, options);
              $('#compare_result').html(html);
            }
          });

          if (isAnimated) $('#gdc-loading-icon').hide();
        }, 100);
      });

      $('#compare_unmatched').bind('click', function () {
        if (!$('#compare_result').is(':visible')) return;
        let options = {};
        options.partial = $('#compare_filter').prop('checked');
        options.unmatched = $('#compare_unmatched').prop('checked');
        options.synonyms = $('#compare_synonyms').prop('checked');

        if (isAnimated) $('#gdc-loading-icon').show();

        setTimeout(() => {
          const items = compareGDCvalues(vs, gv, options);
          $('#compare-matched').data('compareResult', items);
          $('#compare-matched').data('options', options);

          $('#pagination-matched').pagination({
            dataSource: items,
            pageSize: 50,
            callback: function (data, pagination) {
              const html = showCompareResult(data, options);
              $('#compare_result').html(html);
            }
          });

          if (isAnimated) $('#gdc-loading-icon').hide();
        }, 100);
      });

      $('#compare_synonyms').bind('click', function () {
        if (!$('#compare_result').is(':visible')) return;
        let options = {};
        options.partial = $('#compare_filter').prop('checked');
        options.unmatched = $('#compare_unmatched').prop('checked');
        options.synonyms = $('#compare_synonyms').prop('checked');

        if (isAnimated) $('#gdc-loading-icon').show();

        setTimeout(() => {
          const items = showCompareResult(vs, gv, options);
          $('#compare-matched').data('compareResult', items);
          $('#compare-matched').data('options', options);

          $('#pagination-matched').pagination({
            dataSource: items,
            pageSize: 50,
            callback: function (data, pagination) {
              const html = showCompareResult(data, options);
              $('#compare_result').html(html);
            }
          });

          if (isAnimated) $('#gdc-loading-icon').hide();
        }, 100);
      });

      $('#downloadCompareCVS').bind('click', function () {
        // open loading animation
        if (isAnimated) $('#gdc-loading-icon').show();
        setTimeout(() => {
          const items = $('#compare-matched').data('compareResult');
          downloadCompareCVS(items);
          if (isAnimated) $('#gdc-loading-icon').hide();
        }, 100);
      });

      $('#back2Compare').bind('click', function () {
        $('#compare_result').html('');
        $('#compare-matched').val('');
        $('#compare_result').css('display', 'none');
        $('#compare_form').css('display', 'block');

        $('#compare-input').show();
        $('#compare-matched').hide();
        $('#compare_download').hide();

        $('#compare').show();
        $('#cancelCompare').show();
        $('#cp_bottom-matched').hide();
      });

      if (isAnimated) $('#gdc-loading-icon').hide();
    }, 100);
  }
};

const compareGDCvalues = (fromV, toV, option) => {
  toV = JSON.parse(JSON.stringify(toV));
  let vLowercase = [];
  let vMatched = [];
  toV.forEach(function (v) {
    vLowercase.push(v.n.trim().toLowerCase());
    if (v.s && v.s.length > 0) v.s = v.s.map(function (x) { return { termName: x.termName.toLowerCase(), termSource: x.termSource, termGroup: x.termGroup }; });
    if (v.all_syn && v.all_syn.length > 0) v.all_syn = v.all_syn.map(function (x) { return x.toLowerCase(); });
  });

  let items = [];
  fromV.forEach(function (v) {
    let caseSensitiveV = v.trim().replace(/[\ ]+/g, ' ');
    v = v.trim().toLowerCase().replace(/[\ ]+/g, ' ');
    // let reg_key = new RegExp(v, "ig");
    let tmp = v;
    if (tmp === '') {
      return;
    }
    let text = [];
    if (option.partial === false) { // If exact match is checked
      let checkerN = [];
      let idx = vLowercase.indexOf(tmp);
      if (idx >= 0) {
        toV[idx].match = caseSensitiveV;
        text.push(toV[idx]);
        checkerN.push(toV[idx].n);
        vMatched.push(idx);
      }
      if (option.synonyms === true) {
        toV.forEach((em, i) => {
          if (em.all_syn) { // If it's a ICDO3 code it will have all_syn
            if (em.all_syn.indexOf(tmp) !== -1 && checkerN.indexOf(toV[i].n) === -1) {
              text.push(toV[i]);
              checkerN.push(toV[i].n);
              vMatched.push(i);
            }
          }
          if (em.s) {
            em.s.forEach(s => {
              if (s.termName.trim().toLowerCase() === tmp && checkerN.indexOf(toV[i].n) === -1) {
                text.push(toV[i]);
                checkerN.push(toV[i].n);
                vMatched.push(i);
              }
            });
          }
        });
        let checkerNC = getMatchedSynonyms(text, tmp, option);
        text.forEach(em => {
          em.match = caseSensitiveV;
          if (em.n_syn !== undefined && em.s === undefined) {
            em.n_syn.forEach(nSyn => {
              if (em.matched_s === undefined && checkerNC[nSyn.n_c] !== undefined) {
                em.matched_s = [];
                em.chk_n_c = [];
                em.chk_n_c.push(nSyn.n_c);
                em.matched_s.push({ n_c: nSyn.n_c, s: checkerNC[nSyn.n_c] });
              } else if (em.matched_s !== undefined && em.chk_n_c.indexOf(nSyn.n_c) === -1 && checkerNC[nSyn.n_c] !== undefined) {
                let tmpObj = {};
                tmpObj.n_c = nSyn.n_c;
                tmpObj.s = checkerNC[nSyn.n_c];
                em.matched_s.push(tmpObj);
                em.chk_n_c.push(nSyn.n_c);
              }
            });
          } else if (em.s !== undefined && em.n_syn === undefined && checkerNC[em.n_c] !== undefined) {
            if (em.matched_s === undefined) {
              em.matched_s = [];
              em.chk_n_c = [];
              em.chk_n_c.push(em.n_c);
              em.matched_s.push({ n_c: em.n_c, s: checkerNC[em.n_c] });
            } else if (em.matched_s !== undefined && em.chk_n_c.indexOf(em.n_c) === -1 && checkerNC[em.n_c] !== undefined) {
              let tmpObj = {};
              tmpObj.n_c = em.n_c;
              tmpObj.s = checkerNC[em.n_c];
              em.matched_s.push(tmpObj);
              em.chk_n_c.push(em.n_c);
            }
          }
        });
      }
    } else { // If it's partial match
      let checkerN = [];
      vLowercase.forEach((vTmp, index) => {
        let idx = vTmp.indexOf(tmp);
        if (idx >= 0 && checkerN.indexOf(toV[index].n) === -1) {
          toV[index].match = caseSensitiveV;
          text.push(toV[index]);
          checkerN.push(toV[index].n);
          vMatched.push(index);
        }
        if (option.synonyms === true) {
          toV.forEach((em, i) => {
            if (em.all_syn) {
              em.all_syn.forEach(syn => { // If it's a ICDO3 code it will have all_syn
                if (syn.indexOf(tmp) !== -1 && checkerN.indexOf(toV[i].n) === -1) {
                  text.push(toV[i]);
                  checkerN.push(toV[i].n);
                  vMatched.push(i);
                }
              });
            }
            if (em.s) {
              em.s.forEach(syn => {
                if (syn.termName.indexOf(tmp) !== -1 && checkerN.indexOf(toV[i].n) === -1) {
                  text.push(toV[i]);
                  checkerN.push(toV[i].n);
                  vMatched.push(i);
                }
              });
            }
          });
          let checkerNC = getMatchedSynonyms(text, tmp, option);
          text.forEach(em => {
            em.match = caseSensitiveV;
            if (em.n_syn !== undefined && em.s === undefined) {
              em.n_syn.forEach(nSyn => {
                if (em.matched_s === undefined && checkerNC[nSyn.n_c] !== undefined) {
                  em.matched_s = [];
                  em.chk_n_c = [];
                  em.chk_n_c.push(nSyn.n_c);
                  em.matched_s.push({ n_c: nSyn.n_c, s: checkerNC[nSyn.n_c] });
                } else if (em.matched_s !== undefined && em.chk_n_c.indexOf(nSyn.n_c) === -1 && checkerNC[nSyn.n_c] !== undefined) {
                  let tmpObj = {};
                  tmpObj.n_c = nSyn.n_c;
                  tmpObj.s = checkerNC[nSyn.n_c];
                  em.matched_s.push(tmpObj);
                  em.chk_n_c.push(nSyn.n_c);
                }
              });
            } else if (em.s !== undefined && em.n_syn === undefined && checkerNC[em.n_c] !== undefined) {
              if (em.matched_s === undefined) {
                em.matched_s = [];
                em.chk_n_c = [];
                em.chk_n_c.push(em.n_c);
                em.matched_s.push({ n_c: em.n_c, s: checkerNC[em.n_c] });
              } else if (em.matched_s !== undefined && em.chk_n_c.indexOf(em.n_c) === -1 && checkerNC[em.n_c] !== undefined) {
                let tmpObj = {};
                tmpObj.n_c = em.n_c;
                tmpObj.s = checkerNC[em.n_c];
                em.matched_s.push(tmpObj);
                em.chk_n_c.push(em.n_c);
              }
            }
          });
        }
      });
    }
    if (text.length > 0) text = sortAlphabetically(text);
    if (text.length === 0) text.push({ n: '', n_c: '', match: caseSensitiveV, s: [] });
    items = items.concat(JSON.parse(JSON.stringify(text)));
  });

  items = option.unmatched ? items.concat(toV.filter((v, i) => !vMatched.includes(i))) : items;
  return items;
};

const getMatchedSynonyms = (text, tmp, option) => {
  if (option.partial === false) {
    let checkerNC = {};
    text.forEach(em => {
      if (em.matched_s) em.matched_s = undefined; // remove matched_s from previous tmp
      if (em.n_syn !== undefined && em.s === undefined) {
        em.n_syn.forEach(nSyn => {
          if (nSyn.s === undefined) return;
          nSyn.s.forEach(x => {
            if (x.termName.trim().toLowerCase() === tmp) {
              if (checkerNC[nSyn.n_c] === undefined) {
                checkerNC[nSyn.n_c] = [];
                checkerNC[nSyn.n_c].push(x);
              } else if (checkerNC[nSyn.n_c] !== undefined && !_.some(checkerNC[nSyn.n_c], x)) {
                checkerNC[nSyn.n_c].push(x);
              }
            }
          });
        });
      } else if (em.s !== undefined && em.n_syn === undefined) {
        em.s.forEach(x => {
          if (x.termName.trim().toLowerCase() === tmp) {
            if (checkerNC[em.n_c] === undefined) {
              checkerNC[em.n_c] = [];
              checkerNC[em.n_c].push(x);
            } else if (checkerNC[em.n_c] !== undefined && !_.some(checkerNC[em.n_c], x)) {
              checkerNC[em.n_c].push(x);
            }
          }
        });
      }
    });
    return checkerNC;
  } else {
    let checkerNC = {};
    text.forEach(em => {
      if (em.matched_s) em.matched_s = undefined; // remove matched_s from previous tmp
      if (em.n_syn !== undefined && em.s === undefined) {
        em.n_syn.forEach(nSyn => {
          if (nSyn.s === undefined) return;
          nSyn.s = nSyn.s.map(x => { return { termName: x.termName.toLowerCase(), termGroup: x.termGroup, termSource: x.termSource }; });
          nSyn.s.forEach(tmpSyn => {
            let sIdx = tmpSyn.termName.indexOf(tmp);
            if (sIdx >= 0) {
              if (checkerNC[nSyn.n_c] === undefined) {
                checkerNC[nSyn.n_c] = [];
                checkerNC[nSyn.n_c].push(tmpSyn);
              } else if (checkerNC[nSyn.n_c] !== undefined && !_.some(checkerNC[nSyn.n_c], tmpSyn)) {
                checkerNC[nSyn.n_c].push(tmpSyn);
              }
            }
          });
        });
      } else if (em.s !== undefined && em.n_syn === undefined) {
        em.s = em.s.map(x => { return { termName: x.termName.toLowerCase(), termGroup: x.termGroup, termSource: x.termSource }; });
        em.s.forEach(tmpSyn => {
          let sIdx = tmpSyn.termName.indexOf(tmp);
          if (sIdx >= 0) {
            if (checkerNC[em.n_c] === undefined) {
              checkerNC[em.n_c] = [];
              checkerNC[em.n_c].push(tmpSyn);
            } else if (checkerNC[em.n_c] !== undefined && !_.some(checkerNC[em.n_c], tmpSyn)) {
              checkerNC[em.n_c].push(tmpSyn);
            }
          }
        });
      }
    });
    return checkerNC;
  }
};

const downloadCompareCVS = (items) => {
  let csv = 'User Defined Values, Matched GDC Values, ICDO3 code, NCIt code, ICDO3 Strings/Synonyms,' + '\n';
  items.forEach((item, i) => {
    let newLine = true;
    let match = item.match;
    if (item.match !== undefined && i !== 0 && items[i - 1].match === items[i].match) match = '';
    if (item.match === undefined) match = '--';
    csv += '"' + match + '","' + item.n + '",';
    csv += item.i_c !== undefined ? '"' + item.i_c.c + '",' : '"",';
    if (item.ic_enum) {
      item.ic_enum.forEach((ic, i) => {
        csv += i === 0 ? '"","' + ic.n + '",' : '"' + ic.n + '",';
      });
    }

    if (item.n_syn) {
      if (item.n_syn.length !== 0) {
        item.n_syn.forEach(function (syn, tmpIndex) {
          if (syn.s.length !== 0) {
            csv += tmpIndex === 0 ? '\n"","","","' + syn.n_c + '",' : '"","","","' + syn.n_c + '",';
            syn.s.forEach(function (s) {
              csv += '"' + s.termName + '",';
            });
            csv += '\n';
            newLine = false;
          }
        });
      }
    }

    if (item.s) {
      if (item.s.length !== 0) {
        csv += '"' + item.n_c + '",';
        item.s.forEach(function (s) {
          csv += '"' + s.termName + '",';
        });
        csv += '\n';
        newLine = false;
      }
    }
    if (newLine === true) {
      csv += '\n';
    }
  });

  let csvData = new Blob([csv], { type: 'data:text/csv;charset=utf-8,' });
  let csvUrl = URL.createObjectURL(csvData);
  let link = document.createElement('a');
  link.href = csvUrl;
  link.target = '_blank';
  link.download = 'Compare_Values_GDC.csv';
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default toCompare;
