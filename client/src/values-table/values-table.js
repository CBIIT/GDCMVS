import template from './values-table-view';
import { getHeaderOffset, getHighlightObj, sortAlphabetically } from '../shared'

let term_type_not_assigned = false;

const tableToggleHandle = (event) => {
  event.preventDefault();
  const $this = $(event.currentTarget);
  const $target = $this.closest('.table__gdc-values, .table__cde-values').find('.data-content');
  $target.slideToggle(400, () => {
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
}

const detailsToggleHandle = (event) => {
  event.preventDefault();
  const $this = $(event.currentTarget);
  const $target = $this.parent().find('.gdc-links');
  $target.slideToggle(350, () => {
    if ($target.is(":visible")) {
      $this.attr('aria-expanded', 'true');
    } else {
      $this.attr('aria-expanded', 'false');
    }
  });
}

const suggestNotificationHandle = (event) => {
  event.preventDefault();
  const alertSuggest = $('#alert-suggest');
  alertSuggest.css({ 'top': (getHeaderOffset() + 20) + 'px' }).addClass('alert__show');
  setTimeout(() => { alertSuggest.removeClass('alert__show') }, 3900);
}

const showMoreToggleHandle = (event) => {
  event.preventDefault();
  const $this = $(event.currentTarget);
  const $target = $this.closest('.table__values').find('.table__row--toggle');
  if ($this.hasClass('more')) {
    $this.removeClass('more');
    $this.attr('aria-expanded', 'false');
    $target.slideToggle(350);
    $this.html('<i class="fa fa-angle-down"></i> Show More (' + $this.attr('data-hidden') + ')');
  } else {
    $this.addClass('more');
    $this.attr('aria-expanded', 'true');
    $target.slideToggle(350);
    $this.html('<i class="fa fa-angle-up"></i> Show Less');
  }
}

export const vsRender = (items, keyword) => {
  term_type_not_assigned = false;
  //data preprocessing
  let values = [];
  let values_count = 0;
  //options render
  let options = {};
  // RegExp Keyword
  //keyword = keyword.trim().replace(/[\ ,:_-]+/g, " ");
  items.forEach(data => {
    let enums = data.inner_hits.enum;
    if(enums.hits.total !== 0) { // If the searched term is cde id.
      let enum_hits = enums.hits.hits;
      let synExists = false;
      let obj = {};
      obj.category = data._source.category;
      obj.node = data._source.node;
      obj.property = data._source.property;
      obj.id = data._source.id;
      obj.cdeId = data._source.cde ? data._source.cde.id : undefined;
      obj.cdeUrl = data._source.cde ? data._source.cde.url : undefined;
      obj.vs = [];
      let highlight_cdeId = data.highlight !== undefined && ("cde.id" in data.highlight) ? data.highlight["cde.id"] : undefined;
      if(highlight_cdeId !== undefined){
        if(data._source.enum !== undefined) obj.vs = getAllValues(data);
      }
      enum_hits.forEach(hits => {
        let highlight = hits.highlight;

        let highlight_value = ("enum.n" in highlight) || ("enum.n.have" in highlight) ? highlight["enum.n"] || highlight["enum.n.have"] : undefined;
        let highlight_value_obj = getHighlightObj(highlight_value);

        let highlight_syn = ("enum.n_syn.s.termName" in highlight) || ("enum.n_syn.s.termName.have" in highlight) ? highlight["enum.n_syn.s.termName"] || highlight["enum.n_syn.s.termName.have"] : undefined;
        let highlight_syn_obj = getHighlightObj(highlight_syn);

        let highlight_nc = ("enum.n_syn.n_c" in highlight) || ("enum.n_syn.n_c.have" in highlight) ? highlight["enum.n_syn.n_c"] || highlight["enum.n_syn.n_c.have"] : undefined;
        let highlight_nc_obj = getHighlightObj(highlight_nc);

        let highlight_ic = ("enum.i_c.c" in highlight) || ("enum.i_c.have" in highlight) ? highlight["enum.i_c.c"] || highlight["enum.i_c.have"] : undefined;
        let highlight_ic_obj = getHighlightObj(highlight_ic);

        if(highlight_cdeId === undefined) {
          let value_obj = {};
          let source = hits._source;
          synExists = source.n_syn ? true : false;
          value_obj.n = highlight_value_obj[source.n] !== undefined ? highlight_value_obj[source.n] : source.n;
          if(source.n_syn !== undefined){
            source.n_syn.forEach(data => {
              let new_syn = [];
              data.s.forEach(s => {
                let s_obj = {};
                s_obj.termName = highlight_syn_obj[s.termName] ? highlight_syn_obj[s.termName] : s.termName;
                s_obj.termSource = s.termSource;
                s_obj.termGroup = s.termGroup;
                new_syn.push(s_obj);
              });
              data.n_c = highlight_nc_obj[data.n_c] ? highlight_nc_obj[data.n_c] : data.n_c;
              data.s = new_syn;
            });
            value_obj.n_syn = source.n_syn;
          }
          value_obj.i_c = {};
          value_obj.i_c.c = source.i_c ? highlight_ic_obj[source.i_c.c] ? highlight_ic_obj[source.i_c.c] : source.i_c.c : undefined;
          if(source.ic_enum !== undefined){
            value_obj.ic_enum = source.ic_enum;
            source.ic_enum.forEach(ic_n => {
              if(ic_n.term_type === "*") term_type_not_assigned = true;
            })
          }
          obj.vs.push(value_obj);
        }
      });
      obj.n_syn = synExists;
      obj.vs = sortAlphabetically(obj.vs);
      values_count += obj.vs.length;
      values.push(obj);
    }
    else if(data.highlight["cde.id"] && data._source.enum !== undefined){
      let obj = {};
      obj.category = data._source.category;
      obj.node = data._source.node;
      obj.property = data._source.property;
      obj.id = data._source.id;
      obj.cdeId = data._source.cde ? data._source.cde.id : undefined;
      obj.cdeUrl = data._source.cde ? data._source.cde.url : undefined;
      obj.vs = getAllValues(data);
      values_count += obj.vs.length;
      values.push(obj);
    }
  });

  let html = "";
  let searched_keyword = $("#keywords").val();
  if (term_type_not_assigned === true)
    $("#unofficial-term").html('(*) Term type not assigned.');
  else
    $("#unofficial-term").html('');

  if (values.length === 0 || (values.length === 1 && values[0].vs.length === 0)) {
    html =
      '<div class="indicator"><div class="indicator__content">Sorry, no results found for keyword: <span class="indicator__term">' +
      searched_keyword + '</span></div></div>';
  } else {
    let offset = $('#root').offset().top;
    let h = window.innerHeight - offset - 310;
    options.height = (h < 430) ? 430 : h;
    options.keyword = searched_keyword;
    html = template(values, options);
  }
  let result = {};
  result.len = values_count;
  result.html = html;
  return result;
}

const getAllValues = (data) => {
  term_type_not_assigned = false;
  let values = [];
  let highlight_value_obj = {};
  let highlight_syn_obj = {};
  let highlight_nc_obj = {};
  let highlight_ic_obj = {};
  let inner_hits = data.inner_hits;
  if(inner_hits !== undefined && inner_hits.enum.hits.total !== 0){
    let hits = inner_hits.enum.hits.hits;
    hits.forEach(data => {
      let highlight = data.highlight;
      let highlight_value = ("enum.n" in highlight) || ("enum.n.have" in highlight) ? highlight["enum.n"] || highlight["enum.n.have"] : undefined;
      let highlight_syn = ("enum.n_syn.s.termName" in highlight) || ("enum.n_syn.s.termName.have" in highlight) ? highlight["enum.n_syn.s.termName"] || highlight["enum.n_syn.s.termName.have"] : undefined;
      let highlight_nc = ("enum.n_syn.n_c" in highlight) || ("enum.n_syn.n_c.have" in highlight) ? highlight["enum.n_syn.n_c"] || highlight["enum.n_syn.n_c.have"] : undefined;
      let highlight_ic = ("enum.i_c.c" in highlight) || ("enum.i_c.have" in highlight) ? highlight["enum.i_c.c"] || highlight["enum.i_c.have"] : undefined;
      if(highlight_value !== undefined){
        highlight_value.forEach(val => {
          let tmp = val.replace(/<b>/g, "").replace(/<\/b>/g, "");
          if(highlight_value_obj[tmp] === undefined) highlight_value_obj[tmp] = val;
        });
      }
      if(highlight_syn !== undefined){
        highlight_syn.forEach(val => {
          let tmp = val.replace(/<b>/g, "").replace(/<\/b>/g, "");
          if(highlight_syn_obj[tmp] === undefined) highlight_syn_obj[tmp] = val;
        });
      }
      if(highlight_nc !== undefined){
        highlight_nc.forEach(val => {
          let tmp = val.replace(/<b>/g, "").replace(/<\/b>/g, "");
          if(highlight_nc_obj[tmp] === undefined) highlight_nc_obj[tmp] = val;
        });
      }
      if(highlight_ic !== undefined){
        highlight_ic.forEach(val => {
          let tmp = val.replace(/<b>/g, "").replace(/<\/b>/g, "");
          if(highlight_ic_obj[tmp] === undefined) highlight_ic_obj[tmp] = val;
        });
      }
    });
  }

  data._source.enum.forEach(val => {
    let value_obj = {};
    value_obj.n = highlight_value_obj[val.n] ? highlight_value_obj[val.n] : val.n ;
    value_obj.i_c = {};
    if(val.i_c !== undefined) value_obj.i_c.c = highlight_ic_obj[val.i_c.c] ? highlight_ic_obj[val.i_c.c] : val.i_c.c;

    if(val.n_syn !== undefined) {

      val.n_syn.forEach(data => {
        let new_syn = [];
        data.s.forEach(s => {
          let s_obj = {};
          s_obj.termName = highlight_syn_obj[s.termName] ? highlight_syn_obj[s.termName] : s.termName;
          s_obj.termSource = s.termSource;
          s_obj.termGroup = s.termGroup;
          new_syn.push(s_obj);
        });
        data.n_c = highlight_nc_obj[data.n_c] ? highlight_nc_obj[data.n_c] : data.n_c;
        data.s = new_syn;
      });
      value_obj.n_syn = val.n_syn;
    }
    if(val.ic_enum !== undefined) {
      val.ic_enum.forEach(ic_n => {
        if(ic_n.term_type === "*") term_type_not_assigned = true;
      });
      value_obj.ic_enum = val.ic_enum;
    }
    values.push(value_obj);
  });
  values = sortAlphabetically(values);
  return values;
}

export const vsEvents = ($root) => {
  $root.on('click', '.table__toggle', (event) => {
    tableToggleHandle(event);
  });

  $root.on('click', '.gdc-details', (event) => {
    detailsToggleHandle(event);
  });

  $root.on('click', '.cde-suggest', (event) => {
    suggestNotificationHandle(event);
  });

  $root.on('click', '.show-more-less', (event) => {
    showMoreToggleHandle(event);
  });
}
