import { header_template, body_template, footer_template, list_template, show_compare_result } from './to-compare-view'
import { apiGetGDCDataById } from '../../api';
import { getHeaderOffset, getScrollTop, searchFilter, searchFilterCR, getAllSyn, sortAlphabetically } from '../../shared';

const toCompare = (uid) => {
  uid = uid.replace(/@/g, '/');
  apiGetGDCDataById(uid, function (id, items) {
    if ($('#compare_dialog').length) {
      $('#compare_dialog').remove();
    }

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
    let header = header_template;
    let html = body_template;
    let bottom = footer_template;

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
              let html = list_template(data);
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
                    let html = list_template(data, keywordCase);
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
                  let html = list_template(data, keywordCase);
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
                    const html = show_compare_result(data, options, keywordCase);
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
                  const html = show_compare_result(data, options, keywordCase);
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

const compare = (gv) => {

  if ($('#cp_input').val().trim() === '') {
    $('#cp_massage').html("Please type in user defined values.");
    return;
  }
  else {

    if (gv.length > 500 ) {
      $('#gdc-loading-icon').show()
    }

    setTimeout(() => {

    //compare and render
    $('#cp_massage').html("");
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

    options.partial = $("#compare_filter").prop('checked');
    options.unmatched = $("#compare_unmatched").prop('checked');
    options.synonyms = $("#compare_synonyms").prop('checked');
    const items = compareGDCvalues(vs, gv, options);
    $('#compare-matched').data('compareResult', items);
    $('#compare-matched').data('options', options);

    $('#pagination-matched').pagination({
      dataSource: items,
      pageSize: 50,
      callback: function(data, pagination) {
        const html = show_compare_result(data, options);
        $('#compare_result').html(html);
      }
    });

    $('#compare_filter').bind('click', function () {
      if(!$('#compare_result').is(':visible')) return;
      let options = {};
      options.partial = $("#compare_filter").prop('checked');
      options.unmatched = $("#compare_unmatched").prop('checked');
      options.synonyms = $("#compare_synonyms").prop('checked');

      if (gv.length > 500 ) {
        $('#gdc-loading-icon').show()
      }

      setTimeout(() => {
        const items = compareGDCvalues(vs, gv, options);
        $('#compare-matched').data('compareResult', items);
        $('#compare-matched').data('options', options);

        $('#pagination-matched').pagination({
          dataSource: items,
          pageSize: 50,
          callback: function(data, pagination) {
            const html = show_compare_result(data, options);
            $('#compare_result').html(html);
          }
        });

        if (gv.length > 500 ) {
          $('#gdc-loading-icon').hide()
        }
      },100);
    });

    $('#compare_unmatched').bind('click', function () {
      if(!$('#compare_result').is(':visible')) return;
      let options = {};
      options.partial = $("#compare_filter").prop('checked');
      options.unmatched = $("#compare_unmatched").prop('checked');
      options.synonyms = $("#compare_synonyms").prop('checked');

      if (gv.length > 500 ) {
        $('#gdc-loading-icon').show()
      }

      setTimeout(() => {
        const items = compareGDCvalues(vs, gv, options);
        $('#compare-matched').data('compareResult', items);
        $('#compare-matched').data('options', options);

        $('#pagination-matched').pagination({
          dataSource: items,
          pageSize: 50,
          callback: function(data, pagination) {
            const html = show_compare_result(data, options);
            $('#compare_result').html(html);
          }
        });

        if (gv.length > 500 ) {
          $('#gdc-loading-icon').hide()
        }
      },100);
    });

    $('#compare_synonyms').bind('click', function () {
      if(!$('#compare_result').is(':visible')) return;
      let options = {};
      options.partial = $("#compare_filter").prop('checked');
      options.unmatched = $("#compare_unmatched").prop('checked');
      options.synonyms = $("#compare_synonyms").prop('checked');

      if (gv.length > 500 ) {
        $('#gdc-loading-icon').show()
      }

      setTimeout(() => {
        const items = show_compare_result(vs, gv, options);
        $('#compare-matched').data('compareResult', items);
        $('#compare-matched').data('options', options);

        $('#pagination-matched').pagination({
          dataSource: items,
          pageSize: 50,
          callback: function(data, pagination) {
            const html = show_compare_result(data, options);
            $('#compare_result').html(html);
          }
        });

        if (gv.length > 500 ) {
          $('#gdc-loading-icon').hide()
        }
      },100);
    });

    $('#downloadCompareCVS').bind('click', function () {
      if (gv.length > 500 ) {
        $('#gdc-loading-icon').show()
      }
      setTimeout(() => {
        const items = $('#compare-matched').data('compareResult');
        downloadCompareCVS(items);
        if (gv.length > 500 ) {
          $('#gdc-loading-icon').hide()
        }
      },100);
    });

    $('#back2Compare').bind('click', function () {
      $('#compare_result').html("");
      $('#compare-matched').val('');
      $('#compare_result').css("display", "none");
      $('#compare_form').css("display", "block");

      $('#compare-input').show();
      $('#compare-matched').hide();
      $('#compare_download').hide();

      $('#compare').show();
      $('#cancelCompare').show();
      $('#cp_bottom-matched').hide();
    });

    if (gv.length > 500 ) {
      $('#gdc-loading-icon').hide()
    }

    },100);
  }
}

const compareGDCvalues = (fromV, toV, option) => {
  toV = JSON.parse(JSON.stringify(toV));
  let v_lowercase = [], v_matched = [];
  toV.forEach(function (v) {
    v_lowercase.push(v.n.trim().toLowerCase());
    if(v.s && v.s.length > 0) v.s = v.s.map(function(x){ return {termName: x.termName.toLowerCase(), termSource: x.termSource, termGroup: x.termGroup}; });
    if(v.all_syn && v.all_syn.length > 0) v.all_syn = v.all_syn.map(function(x){ return x.toLowerCase(); });
  });

  let items = [];
  fromV.forEach(function (v) {
    let caseSensitiveV = v.trim().replace(/[\ ]+/g, " ");
    v = v.trim().toLowerCase().replace(/[\ ]+/g, " ");
    let reg_key = new RegExp(v, "ig");
    let tmp = v;
    if (tmp === '') {
      return;
    }
    let text = [];
    if (option.partial === false) { // If exact match is checked
      let checker_n = [];
      let idx = v_lowercase.indexOf(tmp);
      if (idx >= 0) {
        toV[idx].match = caseSensitiveV;
        text.push(toV[idx]);
        checker_n.push(toV[idx].n);
        v_matched.push(idx);
      }
      if(option.synonyms === true){
        toV.forEach((em, i) => {
          if (em.all_syn) { // If it's a ICDO3 code it will have all_syn
            if (em.all_syn.indexOf(tmp) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
              text.push(toV[i])
              checker_n.push(toV[i].n);
              v_matched.push(i);
            }
          }
          if (em.s) {
            em.s.forEach(s => {
              if (s.termName.trim().toLowerCase() === tmp && checker_n.indexOf(toV[i].n) === -1) {
                text.push(toV[i]);
                checker_n.push(toV[i].n);
                v_matched.push(i);
              }
            });
          }
        });
        let checker_n_c = getMatchedSynonyms(text, tmp, option);
        text.forEach(em => {
          em.match = caseSensitiveV;
          if(em.n_syn !== undefined && em.s === undefined){
            em.n_syn.forEach(n_s => {
              if(em.matched_s === undefined && checker_n_c[n_s.n_c] !== undefined){
                em.matched_s = [];
                em.chk_n_c = [];
                em.chk_n_c.push(n_s.n_c);
                em.matched_s.push({n_c: n_s.n_c, s: checker_n_c[n_s.n_c]});
              }
              else if(em.matched_s !== undefined && em.chk_n_c.indexOf(n_s.n_c) === -1 && checker_n_c[n_s.n_c] !== undefined){
                let tmp_obj = {};
                tmp_obj.n_c = n_s.n_c;
                tmp_obj.s = checker_n_c[n_s.n_c];
                em.matched_s.push(tmp_obj);
                em.chk_n_c.push(n_s.n_c);
              }
            });
          }
          else if(em.s !== undefined && em.n_syn === undefined && checker_n_c[em.n_c] !== undefined){
            if(em.matched_s === undefined){
              em.matched_s = [];
              em.chk_n_c = [];
              em.chk_n_c.push(em.n_c);
              em.matched_s.push({n_c: em.n_c, s: checker_n_c[em.n_c]});
            }
            else if(em.matched_s !== undefined && em.chk_n_c.indexOf(em.n_c) === -1 && checker_n_c[em.n_c] !== undefined){
              let tmp_obj = {};
              tmp_obj.n_c = em.n_c;
              tmp_obj.s = checker_n_c[em.n_c];
              em.matched_s.push(tmp_obj);
              em.chk_n_c.push(em.n_c);
            }
          }
        });
      }
    } else { // If it's partial match
      let checker_n = [];
      v_lowercase.forEach((v_tmp, index) => {
        let idx = v_tmp.indexOf(tmp);
        if (idx >= 0 && checker_n.indexOf(toV[index].n) === -1) {
          toV[index].match = caseSensitiveV;
          text.push(toV[index]);
          checker_n.push(toV[index].n);
          v_matched.push(index);
        }
        if(option.synonyms === true){
          toV.forEach((em, i) => {
            if (em.all_syn) {
              em.all_syn.forEach(syn => { // If it's a ICDO3 code it will have all_syn
                if (syn.indexOf(tmp) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
                  text.push(toV[i]);
                  checker_n.push(toV[i].n);
                  v_matched.push(i);
                }
              });
            }
            if (em.s) {
              em.s.forEach(syn => {
                if (syn.termName.indexOf(tmp) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
                  text.push(toV[i]);
                  checker_n.push(toV[i].n);
                  v_matched.push(i);
                }
              });
            }
          });
          let checker_n_c = getMatchedSynonyms(text, tmp, option);
          text.forEach(em => {
            em.match = caseSensitiveV;
            if(em.n_syn !== undefined && em.s === undefined){
              em.n_syn.forEach(n_s => {
                if(em.matched_s === undefined && checker_n_c[n_s.n_c] !== undefined){
                  em.matched_s = [];
                  em.chk_n_c = [];
                  em.chk_n_c.push(n_s.n_c);
                  em.matched_s.push({n_c: n_s.n_c, s: checker_n_c[n_s.n_c]});
                }
                else if(em.matched_s !== undefined && em.chk_n_c.indexOf(n_s.n_c) === -1 && checker_n_c[n_s.n_c] !== undefined){
                  let tmp_obj = {};
                  tmp_obj.n_c = n_s.n_c;
                  tmp_obj.s = checker_n_c[n_s.n_c];
                  em.matched_s.push(tmp_obj);
                  em.chk_n_c.push(n_s.n_c);
                }
              });
            }
            else if(em.s !== undefined && em.n_syn === undefined && checker_n_c[em.n_c] !== undefined){
              if(em.matched_s === undefined){
                em.matched_s = [];
                em.chk_n_c = [];
                em.chk_n_c.push(em.n_c);
                em.matched_s.push({n_c: em.n_c, s: checker_n_c[em.n_c]});
              }
              else if(em.matched_s !== undefined && em.chk_n_c.indexOf(em.n_c) === -1 && checker_n_c[em.n_c] !== undefined){
                let tmp_obj = {};
                tmp_obj.n_c = em.n_c;
                tmp_obj.s = checker_n_c[em.n_c];
                em.matched_s.push(tmp_obj);
                em.chk_n_c.push(em.n_c);
              }
            }
          });
        }
      })
    }
    if(text.length > 0) text = sortAlphabetically(text);
    if(text.length === 0) text.push({n: '', n_c: '', match: caseSensitiveV, s: []});
    items = items.concat(JSON.parse(JSON.stringify(text)));
  });

  items = option.unmatched ? items.concat(toV.filter((v,i) => !v_matched.includes(i))) : items;
  return items;
}


const getMatchedSynonyms = (text, tmp, option) => {
  if(option.partial === false){
    let checker_n_c = {};
    text.forEach(em => {
      if(em.matched_s) em.matched_s = undefined; // remove matched_s from previous tmp
      if(em.n_syn !== undefined && em.s === undefined){
        em.n_syn.forEach(n_s => {
          if(n_s.s === undefined) return;
          n_s.s.forEach(x => {
            if(x.termName.trim().toLowerCase() === tmp){
              if(checker_n_c[n_s.n_c] === undefined ){
                checker_n_c[n_s.n_c] = [];
                checker_n_c[n_s.n_c].push(x);
              }
              else if(checker_n_c[n_s.n_c] !== undefined && !_.some(checker_n_c[n_s.n_c], x)){
                checker_n_c[n_s.n_c].push(x);
              }
            }
          });
        });
      }
      else if(em.s !== undefined && em.n_syn === undefined){
        em.s.forEach(x => {
          if(x.termName.trim().toLowerCase() === tmp){
            if(checker_n_c[em.n_c] === undefined ){
              checker_n_c[em.n_c] = [];
              checker_n_c[em.n_c].push(x);
            }
            else if(checker_n_c[em.n_c] !== undefined && !_.some(checker_n_c[em.n_c], x)){
              checker_n_c[em.n_c].push(x);
            }
          }
        });
      }
    });
    return checker_n_c;
  }
  else{
    let checker_n_c = {};
    text.forEach(em => {
      if(em.matched_s) em.matched_s = undefined; // remove matched_s from previous tmp
      if(em.n_syn !== undefined && em.s === undefined){
        em.n_syn.forEach(n_s => {
          if(n_s.s === undefined) return;
          n_s.s = n_s.s.map(x => {return {termName: x.termName.toLowerCase(), termGroup: x.termGroup, termSource: x.termSource}});
          n_s.s.forEach(tmp_s => {
            let s_idx = tmp_s.termName.indexOf(tmp);
            if(s_idx >= 0){
              if(checker_n_c[n_s.n_c] === undefined ){
                checker_n_c[n_s.n_c] = [];
                checker_n_c[n_s.n_c].push(tmp_s);
              }
              else if(checker_n_c[n_s.n_c] !== undefined && !_.some(checker_n_c[n_s.n_c], tmp_s)){
                checker_n_c[n_s.n_c].push(tmp_s);
              }
            }
          });
        });
      }
      else if(em.s !== undefined && em.n_syn === undefined){
        em.s = em.s.map(x => { return {termName: x.termName.toLowerCase(), termGroup: x.termGroup, termSource: x.termSource}});
        em.s.forEach(tmp_s => {
          let s_idx = tmp_s.termName.indexOf(tmp);
          if(s_idx >= 0){
            if(checker_n_c[em.n_c] === undefined ){
              checker_n_c[em.n_c] = [];
              checker_n_c[em.n_c].push(tmp_s);
            }
            else if(checker_n_c[em.n_c] !== undefined && !_.some(checker_n_c[em.n_c], tmp_s)){
              checker_n_c[em.n_c].push(tmp_s);
            }
          }
        });
      }
    });
    return checker_n_c;
  }
}

const downloadCompareCVS = (items) => {
  let csv = 'User Defined Values, Matched GDC Values, ICDO3 code, NCIt code, ICDO3 Strings/Synonyms,\n';
  items.forEach((item, i) => {
    let new_line = true;
    let match = item.match;
    if (item.match !== undefined && i !== 0 && items[i-1].match === items[i].match) match = "";
    if (item.match === undefined) match = "--";
    csv +='"' + match + '","' + item.n + '",';
    csv += item.i_c !== undefined ? '"' + item.i_c.c + '",': '"",';
    if(item.ic_enum){
      item.ic_enum.forEach((icenum, i) => {
        csv += i === 0 ? '"","' + icenum.n + '",':'"' + icenum.n + '",';
      })
    }

    if (item.n_syn) {
      if (item.n_syn.length !== 0) {
        item.n_syn.forEach(function(syn, tmp_index) {
          if (syn.s.length !== 0) {
            csv += tmp_index === 0 ? '\n"","","","' + syn.n_c + '",':'"","","","' + syn.n_c + '",';
            syn.s.forEach(function (s_v) {
              csv += '"' + s_v.termName + '",';
            });
            csv += '\n';
            new_line = false;
          }
        });
      }
    }

    if (item.s) {
      if (item.s.length !== 0) {
        csv +='"' + item.n_c + '",';
        item.s.forEach(function (s_v) {
          csv += '"' + s_v.termName + '",';
        });
        csv += '\n';
        new_line = false;
      }
    }
    if (new_line == true){
      csv += '\n';
    }
  });

  let csvData = new Blob([csv], { type: 'data:text/csv;charset=utf-8,' });
  let csvUrl = URL.createObjectURL(csvData);
  let link  = document.createElement('a');
  link.href = csvUrl;
  link.target = '_blank';
  link.download = 'Compare_Values_GDC.csv';
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


export default toCompare;
