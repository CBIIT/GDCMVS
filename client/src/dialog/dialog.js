import getCDEData from './cde-data/cde-data';
import gdcData from './gdc-data/gdc-data';
import toCompare from './to-compare/to-compare';
import compareGDC from './compare-gdc/compare-gdc';
import GDCTerms from './gdc-terms/gdc-terms';
import getNCITDetails from './ncit-details/ncit-details'

export const dialogEvents = ($root, $body) => {
  $root.on('click', '.getCDEData', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    getCDEData(data.cdeid, data.targets);
  });

  $root.on('click', '.getGDCData', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref.replace(/@/g, '/');
    gdcData(uid, data.tgt, data.keyword);
  });

  $root.on('click', '.toCompare', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref.replace(/@/g, '/');
    toCompare(uid);
  });

  $root.on('click', '.compareGDC', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref.replace(/@/g, '/');
    compareGDC(uid, data.cdeid);
  });

  $root.on('click', '.getGDCTerms', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref.replace(/@/g, '/');
    GDCTerms(uid, data.targets);
  });

  $body.on('click', '.getNCITDetails', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    getNCITDetails(data.uid);
  });

  $body.on('click', '.compare-form__toggle', (event) => {
    event.preventDefault();
    const $this = $(event.currentTarget);
    const $target = $this.closest('.compare-form__values, .table__gdc-match').find('.compare-form__synm');
    $target.slideToggle(350, () => {
      if ($target.is(":visible")) {
        $this.attr('title', 'collapse');
        $this.attr('aria-label', 'collapse');
        $this.attr('aria-expanded', 'true');
        $this.html('<i class="fa fa-minus"></i>');
      } else {
        $this.attr('title', 'expand');
        $this.attr('aria-label', 'expand');
        $this.attr('aria-expanded', 'false');
        $this.html('<i class="fa fa-plus"></i>');
      }
    });
  });
}

const generateCompareResult = (fromV, toV, option) => {
  let v_lowercase = [], v_matched = [];
  if (option.sensitive) {
    toV.forEach(function (v) {
      v_lowercase.push(v.n.trim());
    });
  }
  else {
    toV.forEach(function (v) {
      v_lowercase.push(v.n.trim().toLowerCase());
    });
  }
  let table = '<div class="table__thead row">'
    + '<div class="table__th col-xs-6">User Defined Values</div>'
    + '<div class="table__th col-xs-6">Matched GDC Values</div>'
    + '</div>'
    + '<div class="table__body row">'
    + '<div class="col-xs-12">';

  fromV.forEach(function (v) {
    let tmp = $.trim(v);
    if (tmp === '') {
      return;
    }
    let text = [];
    if (option.sensitive) { // If exact match is checked
      let checker_n = [];
      let idx = v_lowercase.indexOf(tmp);
      if (idx >= 0) {
        text.push({ n: toV[idx].n, n_syn: toV[idx].n_syn ? toV[idx].n_syn : undefined });
        checker_n.push(toV[idx].n);
        v_matched.push(idx);
      }
      toV.forEach((em, i) => {
        if (em.all_syn) { // If it's a ICDO3 code it will have all_syn
          if (em.all_syn.indexOf(tmp) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
            text.push({ n: toV[i].n, n_syn: toV[i].n_syn })
            checker_n.push(toV[i].n);
            v_matched.push(i);
          }
        }
        if (em.s) {
          if (em.s.indexOf(tmp) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
            text.push({ n: toV[i].n, n_c: toV[i].n_c, s: toV[i].s });
            checker_n.push(toV[i].n);
            v_matched.push(i);
          }
        }
      });

    } else { // If exact match is not checked
      let checker_n = [];
      v_lowercase.forEach((v_tmp, index) => {
        let idx = v_tmp.indexOf(tmp.toLowerCase());
        if (idx >= 0 && checker_n.indexOf(toV[index].n) === -1) {
          text.push({ n: toV[index].n, n_syn: toV[index].n_syn ? toV[index].n_syn : undefined });
          checker_n.push(toV[index].n);
          v_matched.push(index);
        }
        toV.forEach((em, i) => {
          if (em.all_syn) {
            em.all_syn.forEach(syn => { // If it's a ICDO3 code it will have all_syn
              if (syn.toLowerCase().indexOf(tmp.toLowerCase()) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
                text.push({ n: toV[i].n, n_syn: toV[i].n_syn });
                checker_n.push(toV[i].n);
                v_matched.push(i);
              }
            });
          }
          if (em.s) {
            em.s.forEach(syn => {
              if (syn.toLowerCase().indexOf(tmp.toLowerCase()) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
                text.push({ n: toV[i].n, n_c: toV[i].n_c, s: toV[i].s });
                checker_n.push(toV[i].n);
                v_matched.push(i);
              }
            });
          }
        });
      })
    }

    if (text.length === 0) {
      text = '<div style="color:red;">--</div>';
      table += '<div class="table__row row">'
        + '<div class="table__td table__td--slim col-xs-6">' + v + '</div>'
        + '<div class="table__td table__td--slim col-xs-6">' + text + '</div>'
        + '</div>';
    } else {
      table += '<div class="table__row row">'
      text.forEach((tmp_text, index) => {
        if (index !== 0) v = "";
        table += '<div class="table__td table__td--slim col-xs-6">' + v + '</div>'

        if (tmp_text.n_syn) {
          table +='<div class="table__td table__gdc-match table__td--slim col-xs-6">'
          + '<div class="row">'
            + '<div class="col-xs-10">' + tmp_text.n + '</div>'
            + '<div class="col-xs-2 table__center">'
            if (tmp_text.n_syn.length !== 0) {
              table += '<a href="#" class="compare-form__toggle" aria-label="expand" title="expand" aria-expanded="false"><i class="fa fa-plus"></i></a>'
            }
            table +='</div>'
          +'</div>'
          + '<div class="compare-form__synm" style="display: none;">'
            if (tmp_text.n_syn.length !== 0) {
              tmp_text.n_syn.forEach(function(syn){
                if (syn.s.length !== 0) {
                  table +='<div class="row table__td">'
                  + '<div class="col-xs-2">' + syn.n_c + '</div>'
                  + '<div class="col-xs-10">'
                    syn.s.forEach(function (s_v) {
                      table += s_v + '</br>'
                    })
                  table +='</div></div>'
                }
              });
            }
        table +='</div></div>';
        }

        if (tmp_text.s) {
          table +='<div class="table__td table__gdc-match table__td--slim col-xs-6">'
            + '<div class="row">'
              + '<div class="col-xs-10">' + tmp_text.n + '</div>'
              + '<div class="col-xs-2 table__center">'
              if (tmp_text.s.length !== 0) {
                table += '<a href="#" class="compare-form__toggle" aria-label="expand" title="expand" aria-expanded="false"><i class="fa fa-plus"></i></a>'
              }
              table += '</div>'
            +'</div>'
            + '<div class="compare-form__synm" style="display: none;">'
              if (tmp_text.s.length !== 0) {
                table +='<div class="row table__td">'
                  + '<div class="col-xs-2">' + tmp_text.n_c + '</div>'
                  + '<div class="col-xs-10">'
                    tmp_text.s.forEach(function (s_v) {
                      table += s_v + '</br>'
                    })
                table +='</div></div>'
              }
          table +='</div></div>';
        }

        if (tmp_text.s === undefined && tmp_text.n_syn === undefined) {
          table +='<div class="table__td table__td--slim col-xs-6">' + tmp_text.n + '</div>'
        }

      });
      table += '</div>'
    }
  });
  for (var i = 0; i < toV.length; i++) {
    if (v_matched.indexOf(i) >= 0) {
      continue;
    }
    table += '<div class="table__row row ' + (option.unmatched ? 'table__row--undisplay' : '') + '">'
      + '<div class="table__td table__td--slim col-xs-6"><div style="color:red;">--</div></div>'

      if (toV[i].n_syn) {
        table +='<div class="table__td table__gdc-match table__td--slim col-xs-6">'
        + '<div class="row">'
          + '<div class="col-xs-10">' + toV[i].n + '</div>'
          + '<div class="col-xs-2 table__center">'
          if (toV[i].n_syn.length !== 0) {
            table += '<a href="#" class="compare-form__toggle" aria-label="expand" title="expand" aria-expanded="false"><i class="fa fa-plus"></i></a>'
          }
          table +='</div>'
        +'</div>'
        + '<div class="compare-form__synm" style="display: none;">'
          if (toV[i].n_syn.length !== 0) {
            toV[i].n_syn.forEach(function(syn){
              if (syn.s.length !== 0) {
                table +='<div class="row table__td">'
                + '<div class="col-xs-2">' + syn.n_c + '</div>'
                + '<div class="col-xs-10">'
                  syn.s.forEach(function (s_v) {
                    table += s_v + '</br>'
                  })
                table +='</div></div>'
              }
            });
          }
      table +='</div></div>';
      }

      if (toV[i].s) {
        table +='<div class="table__td table__gdc-match table__td--slim col-xs-6">'
          + '<div class="row">'
            + '<div class="col-xs-10">' + toV[i].n + '</div>'
            + '<div class="col-xs-2 table__center">'
            if (toV[i].s.length !== 0) {
              table += '<a href="#" class="compare-form__toggle" aria-label="expand" title="expand" aria-expanded="false"><i class="fa fa-plus"></i></a>'
            }
            table += '</div>'
          +'</div>'
          + '<div class="compare-form__synm" style="display: none;">'
            if (toV[i].s.length !== 0) {
              table +='<div class="row table__td">'
                + '<div class="col-xs-2">' + toV[i].n_c + '</div>'
                + '<div class="col-xs-10">'
                toV[i].s.forEach(function (s_v) {
                    table += s_v + '</br>'
                  })
              table +='</div></div>'
            }
        table +='</div></div>';
      }
      table +='</div>';
  }
  table += '</div></div>'
  return table;
}

const downloadCompareCVS = (fromV, toV, option) => {

  let v_lowercase = [], v_matched = [];
  if (option.sensitive) {
    toV.forEach(function (v) {
      v_lowercase.push(v.n.trim());
    });
  } else {
    toV.forEach(function (v) {
      v_lowercase.push(v.n.trim().toLowerCase());
    });
  }

  let csv = 'User Defined Values,Matched GDC Values\n';

  fromV.forEach(function (v) {
    let tmp = $.trim(v);
    if (tmp === '') {
      return;
    }
    let text = [];
    if (option.sensitive) { // If exact match is checked
      let checker_n = [];
      let idx = v_lowercase.indexOf(tmp);
      if (idx >= 0) {
        text.push(toV[idx].n);
        checker_n.push(toV[idx].n);
        v_matched.push(idx);
      }
      toV.forEach((em, i) => {
        if (em.all_syn) { // If it's a ICDO3 code it will have all_syn
          if (em.all_syn.indexOf(tmp) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
            text.push(toV[i].n)
            checker_n.push(toV[i].n);
            v_matched.push(i);
          }
        }
        if (em.s) {
          if (em.s.indexOf(tmp) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
            text.push(toV[i].n);
            checker_n.push(toV[i].n);
            v_matched.push(i);
          }
        }
      });

    } else { // If exact match is not checked
      let checker_n = [];
      v_lowercase.forEach((v_tmp, index) => {
        let idx = v_tmp.indexOf(tmp.toLowerCase());
        if (idx >= 0 && checker_n.indexOf(toV[index].n) === -1) {
          text.push(toV[index].n);
          checker_n.push(toV[index].n);
          v_matched.push(index);
        }
        toV.forEach((em, i) => {
          if (em.all_syn) {
            em.all_syn.forEach(syn => { // If it's a ICDO3 code it will have all_syn
              if (syn.toLowerCase().indexOf(tmp.toLowerCase()) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
                text.push(toV[i].n);
                checker_n.push(toV[i].n);
                v_matched.push(i);
              }
            });
          }
          if (em.s) {
            em.s.forEach(syn => {
              if (syn.toLowerCase().indexOf(tmp.toLowerCase()) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
                text.push(toV[i].n);
                checker_n.push(toV[i].n);
                v_matched.push(i);
              }
            });
          }
        });
      });
    }

    if (text.length === 0) {
      csv += '"' + v + ',--\n'
    } else {
      text.forEach((tmp_text, index) => {
        if (index !== 0) v = "";
        csv +='"' + v + '","' + tmp_text + '"\n'
      });
    }
  });

  for (var i = 0; i < toV.length; i++) {
    if (v_matched.indexOf(i) >= 0) {
      continue;
    }
    if(option.unmatched){
      continue;
    }

    csv += '--,"'+ toV[i].n + '"\n'
  }

  let hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = 'Compare_Values_GDC.csv';
  hiddenElement.click();
}

export const compare = (gv) => {
  if ($('#cp_input').val().trim() === '') {
    $('#cp_massage').html("Please type in user defined values.");
    return;
  }
  else {
    //compare and render
    $('#cp_massage').html("");
    $('#compare_form').css("display", "none");
    $('#compare_result').css("display", "block");

    let compare_dialog = $('#compare_dialog').parent().find('.ui-dialog-titlebar');

    let titleComponent = '<div class="checkbox ui-checkbox"><label class="checkbox__label checkbox__label--height"><input id="compare_filter" class="checkbox__input" type="checkbox" value=""><span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Exact Match</label>'
      + '<label class="checkbox__label checkbox__label--height"><input id="compare_unmatched" class="checkbox__input" type="checkbox" value=""><span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Hide Unmatched Values</label>'
      +'<div class="titlebar__container-btn"><button id="downloadCompareCVS" class="btn btn-primary compare-form__button">Download</button></div>';

    compare_dialog.append(titleComponent);


    let vs = $('#cp_input').val().split(/\n/);

    let opt = {};
    opt.sensitive = false;
    opt.unmatched = false;
    let table = generateCompareResult(vs, gv, opt);
    let html = '<div id="cp_result_table" class="table__container table__container--margin-bottom">' + table + '</div>'
      + '<div id="cp_result_bottom" class="compare_result__bottom"><button id="back2Compare" class="btn btn-default compare-form__button">Back</button></div>';

    $('#compare_result').html(html);

    $('#compare_filter').bind('click', function () {
      let options = {};
      options.sensitive = $("#compare_filter").prop('checked');
      options.unmatched = $("#compare_unmatched").prop('checked');
      let table_new = generateCompareResult(vs, gv, options);
      $('#cp_result_table').html(table_new);

    });

    $('#compare_unmatched').bind('click', function () {
      let options = {};
      options.sensitive = $("#compare_filter").prop('checked');
      options.unmatched = $("#compare_unmatched").prop('checked');
      let table_new = generateCompareResult(vs, gv, options);
      $('#cp_result_table').html(table_new);
    });

    $('#downloadCompareCVS').bind('click', function () {
      let options = {};
      options.sensitive = $("#compare_filter").prop('checked');
      options.unmatched = $("#compare_unmatched").prop('checked');
      downloadCompareCVS(vs, gv, options);
    });

    $('#back2Compare').bind('click', function () {
      $('#compare_result').html("");
      $('#compare_result').css("display", "none");
      $('#compare_form').css("display", "block");
      compare_dialog.find('.ui-checkbox').remove();
    });

  }
}

export const removePopUps = () => {
  if ($('#gdc_data').length) {
    $('#gdc_data').remove();
  }

  if ($('#caDSR_data').length) {
    $('#caDSR_data').remove();
  }

  if ($('#gdc_terms_data').length) {
    $('#gdc_terms_data').remove();
  }

  if ($('#ncit_details').length) {
    $('#ncit_details').remove();
  }

  if ($('#compare_dialog').length) {
    $('#compare_dialog').remove();
  }

  if ($('#compareGDC_dialog').length) {
    $('#compareGDC_dialog').remove();
  }
}
