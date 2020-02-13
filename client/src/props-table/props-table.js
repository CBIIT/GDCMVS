import template from './props-table-view';
import { getHighlightObj } from '../shared';

export default (items, keyword) => {
  // data preprocessing
  let props = [];
  // options render
  let options = {};
  // RegExp Keyword
  // keyword = keyword.trim().replace(/[\ ,:_-]+/g, " ");
  // let reg_key = new RegExp(keyword, "ig");

  items.forEach(item => {
    if (item.highlight === undefined) return;
    let source = item._source;
    let highlight = item.highlight;

    let highlightProperty = ('property' in highlight) || ('property.have' in highlight) ? highlight['property'] || highlight['property.have'] : undefined;
    let highlightPropertyObj = getHighlightObj(highlightProperty);

    let highlightPropertyDesc = ('property_desc' in highlight) ? highlight['property_desc'] : undefined;
    let highlightPropertyDescObj = {};
    if (highlightPropertyDesc !== undefined) {
      highlightPropertyDesc.forEach(val => {
        if (highlightPropertyDescObj[source.property] === undefined) highlightPropertyDescObj[source.property] = val;
      });
    }

    let highlightCdeId = ('cde.id' in highlight) ? highlight['cde.id'] : undefined;
    let highlightCdeIdObj = getHighlightObj(highlightCdeId);

    let propObj = {};
    propObj.category = source.category;
    propObj.node = source.node;
    propObj.id = source.id;
    propObj.property = highlightPropertyObj[source.property] ? highlightPropertyObj[source.property] : source.property;
    propObj.property_desc = highlightPropertyDescObj[source.property] ? highlightPropertyDescObj[source.property] : source.property_desc;
    if (source.type !== undefined && source.type !== '' && source.type !== 'enum') propObj.type = source.type;
    if (source.enum !== undefined) propObj.enum = source.enum;
    if (source.cde !== undefined) {
      propObj.cdeId = highlightCdeIdObj[source.cde.id] ? highlightCdeIdObj[source.cde.id] : source.cde.id;
      propObj.cdeUrl = source.cde.url;
    }
    props.push(propObj);
  });

  let html = '';
  if (props.length === 0) {
    let searchedKeyword = $('#keywords').val();
    html = '<div class="indicator"><div class="indicator__content">Sorry, no results found for keyword: <span class="indicator__term">' + searchedKeyword + '</span></div></div>';
  } else {
    let offset = $('#root').offset().top;
    let h = window.innerHeight - offset - 310;
    options.height = (h < 430) ? 430 : h;
    html = template(props, options);
  }

  let result = {};
  result.len = props.length;
  result.html = html;
  return result;
};
