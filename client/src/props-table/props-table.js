import template from './props-table-view';
import { getHighlightObj } from '../shared';

export default (items, keyword, search_option) => {
    //data preprocessing
    let props = [];
    //options render
    let options = {};
    // RegExp Keyword
    keyword = keyword.trim().replace(/[\ ,:_-]+/g, " ");
    let reg_key = new RegExp(keyword, "ig");

    items.forEach(item => {
      if(item.highlight === undefined) return;
      let source = item._source;
      let highlight = item.highlight;

      let highlight_property = ("property" in highlight) || ("property.have" in highlight) ? highlight["property"] || highlight["property.have"] : undefined;
      let highlight_property_obj = getHighlightObj(highlight_property);

      let highlight_property_desc = ("property_desc" in highlight) ? highlight["property_desc"] : undefined;
      let highlight_property_desc_obj = {};
      if(highlight_property_desc !== undefined){
        highlight_property_desc.forEach(val => {
          if(highlight_property_desc_obj[source.property] === undefined) highlight_property_desc_obj[source.property] = val;
        });
      }

      let highlight_cdeId = ("cde.id" in highlight) ? highlight["cde.id"] : undefined;
      let highlight_cdeId_obj = getHighlightObj(highlight_cdeId);

      let prop_obj = {};
      prop_obj.category = source.category;
      prop_obj.node = source.node;
      prop_obj.id = source.id;
      prop_obj.property = highlight_property_obj[source.property] ? highlight_property_obj[source.property] : source.property;
      prop_obj.property_desc = highlight_property_desc_obj[source.property] ? highlight_property_desc_obj[source.property] : source.property_desc;
      if(source.type !== undefined && source.type !== "" && source.type !== "enum") prop_obj.type = source.type;
      if(source.enum !== undefined) prop_obj.enum = source.enum;
      if(source.cde !== undefined){
        prop_obj.cdeId = highlight_cdeId_obj[source.cde.id] ? highlight_cdeId_obj[source.cde.id] : source.cde.id;
        prop_obj.cdeUrl = source.cde.url;
      }
      props.push(prop_obj);
    });



    let html = "";
    if (props.length == 0) {
      let searched_keyword = $("#keywords").val();
      html = '<div class="indicator"><div class="indicator__content">Sorry, no results found for keyword: <span class="indicator__term">' +searched_keyword + '</span></div></div>';
    }
    else {
      let offset = $('#root').offset().top;
      let h = window.innerHeight - offset - 310;
      options.height = (h < 430) ? 430 : h;
      html = template(props, options);
    }

    let result = {};
    result.len = props.length;
    result.html = html;
    return result;
  }
