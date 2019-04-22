import template from './dict-table-view';
import { getHighlightObj } from '../shared';

const treeviewToggleHandle = (event) => {
  event.preventDefault();
  const  $this = $(event.currentTarget);
  const $target = $this.closest('.treeview__parent');
  $target.find('>ul.treeview__ul').toggle();
  if ($target.hasClass('treeview__parent--open')) {
    $target.removeClass('treeview__parent--open');
    $this.attr('aria-label', 'expand');
    $this.html('<i class="fa fa-angle-down"></i>');
  } else {
    $target.addClass('treeview__parent--open');
    $this.attr('aria-label', 'collapse');
    $this.html('<i class="fa fa-angle-up"></i>');
  }
}

const treeviewShowAllValuesHandle = (event) => {
  const target = event.currentTarget;
  const $treeviewHl = $('.treeview__ul--hl');
  const $treeviewAll = $('.treeview__ul--all');
  if (target.checked) {
    $treeviewAll.addClass('treeview__ul').each((index, event) => {
      const $this = $(event);
      const $prev = $this.prev('.treeview__ul--hl');
      if ($prev.is(':visible')) {
        $this.show();
        $prev.hide();
      }
    });
    $treeviewHl.removeClass('treeview__ul');
  } else {
    $treeviewHl.addClass('treeview__ul').each((index, event) => {
      const $this = $(event);
      const $next = $this.next('.treeview__ul--all');
      if ($next.is(':visible')) {
        $this.show();
        $next.hide();
      }
    });
    $treeviewAll.removeClass('treeview__ul');
  }
}

const treeviewToggleAllHandle = (event) => {
  const $this = $(event.currentTarget);
  const $tview_ul = $('.treeview .treeview__ul');
  const $tview_li = $('.treeview .treeview__parent');
  const $tview_trigger = $('.treeview .treeview__toggle');
  if ($this.hasClass('active')) {
    $tview_ul.hide();
    $tview_li.removeClass('treeview__parent--open');
    $tview_trigger.attr('aria-label', 'expand');
    $tview_trigger.html('<i class="fa fa-angle-down"></i>');
    $this.html('<i class="fa fa-angle-down"></i> Expand All');
  } else {
    $tview_ul.show();
    $tview_li.addClass('treeview__parent--open');
    $tview_trigger.attr('aria-label', 'collapse');
    $tview_trigger.html('<i class="fa fa-angle-up"></i>');
    $this.html('<i class="fa fa-angle-up"></i>  Collapse All');
  }
}

export const dtRender = (items, keyword, search_option) => {
  // Final data
  let dictionary = [];
  // final result
  let result = {};
  result.len = 0;
  // options render
  let options = {};
  // RegExp Keyword
  keyword = keyword.trim().replace(/[\ ,:_-]+/g, " ");
  let reg_key = new RegExp(keyword, "ig");
  let main_obj = {};
  items.forEach(item => {
    let source = item._source;
    let enum_hits = item.inner_hits.enum.hits;
    let highlight = item.highlight ? item.highlight : undefined;

    if(main_obj[source.category] === undefined) { // category doesn't exists, add it
      let category_obj = {
        category: source.category,
        type: "category",
        length: 0,
        nodes_obj: {},
        nodes: []
      };

      let node_obj = {
        node: source.node,
        node_desc: source.node_desc,
        type: "node",
        length: 0,
        properties_obj: {},
        properties: []
      }

      let property_obj = {
        type: "property",
        length: 0,
        hl_values: [],
        all_values: []
      }
      let highlight_cdeId;
      // Add highlight to property
      if(highlight !== undefined){
        let highlight_prop = ("property" in highlight) || ("property.have" in highlight) ? highlight["property"] || highlight["property.have"] : undefined;
        let highlight_prop_obj = getHighlightObj(highlight_prop);

        highlight_cdeId = ("cde.id" in highlight) ? highlight["cde.id"] : undefined;

        let highlight_prop_desc = ("property_desc" in highlight) ? highlight["property_desc"] : undefined;
        let highlight_prop_desc_obj = {};
        if(highlight_prop_desc !== undefined){
          highlight_prop_desc.forEach(val => {
            if(highlight_prop_desc_obj[source.property] === undefined) highlight_prop_desc_obj[source.property] = val;
          });
        }
        property_obj.property = highlight_prop_obj[source.property] ? highlight_prop_obj[source.property] : source.property;
        property_obj.property_desc = highlight_prop_desc_obj[source.property] ? highlight_prop_desc_obj[source.property] : source.property_desc;
        property_obj.length += highlight_prop_desc !== undefined || highlight_prop !== undefined || highlight_cdeId !== undefined ? 1 : 0;
      }
      else{
        property_obj.property = source.property;
        property_obj.property_desc = source.property_desc;
      }

      property_obj.all_values = source.enum ? source.enum.map(function(x){ return x.n;}) : [];
      property_obj.all_values.sort();

      if(enum_hits.total !== 0 && highlight_cdeId === undefined){
        enum_hits.hits.forEach(hl_em => {
          let em_source = hl_em._source;
          let em_highlight = hl_em.highlight;
          let highlight_value = ("enum.n" in em_highlight) || ("enum.n.have" in em_highlight) ? em_highlight["enum.n"] || em_highlight["enum.n.have"] : undefined;
          let highlight_value_obj = getHighlightObj(highlight_value);
          let value_obj = highlight_value_obj[em_source.n] ? highlight_value_obj[em_source.n] : em_source.n;
          if(property_obj.hl_values.indexOf(value_obj) === -1) property_obj.hl_values.push(value_obj);
        });
      }
      else if(enum_hits.total !== 0 && highlight_cdeId !== undefined){
        let highlight_value_obj = getAllValueHighlight(enum_hits);
        property_obj.hl_values = source.enum ? source.enum.map(function(x){ return highlight_value_obj[x.n] ? highlight_value_obj[x.n] : x.n; })  : [];
        property_obj.hl_values.sort();
      }
      else if(enum_hits.total === 0 && highlight_cdeId !== undefined){
        property_obj.hl_values = source.enum ? source.enum.map(function(x){ return x.n;})  : [];
        property_obj.hl_values.sort();
      }
      property_obj.length += property_obj.hl_values.length;
      if(node_obj.properties_obj[source.property] === undefined){
        node_obj.properties_obj[source.property] = {};
        node_obj.properties_obj[source.property] = property_obj;
        node_obj.length += property_obj.length;
      }

      if(category_obj.nodes_obj[source.node] === undefined){
        category_obj.nodes_obj[source.node] = {};
        category_obj.nodes_obj[source.node] = node_obj;
      }

      main_obj[source.category] = category_obj;
    }
    else{ // category already exists
      let node_obj = {
        node: source.node,
        node_desc: source.node_desc,
        type: "node",
        length: 0,
        properties_obj: {},
        properties: []
      }

      let property_obj = {
        type: "property",
        length: 0,
        hl_values: [],
        all_values: []
      }
      let highlight_cdeId;
      // Add highlight to property
      if(highlight !== undefined){
        let highlight_prop = ("property" in highlight) || ("property.have" in highlight) ? highlight["property"] || highlight["property.have"] : undefined;
        let highlight_prop_obj = getHighlightObj(highlight_prop);

        highlight_cdeId = ("cde.id" in highlight) ? highlight["cde.id"] : undefined;

        let highlight_prop_desc = ("property_desc" in highlight) ? highlight["property_desc"] : undefined;
        let highlight_prop_desc_obj = {};
        if(highlight_prop_desc !== undefined){
          highlight_prop_desc.forEach(val => {
            if(highlight_prop_desc_obj[source.property] === undefined) highlight_prop_desc_obj[source.property] = val;
          });
        }
        property_obj.property = highlight_prop_obj[source.property] ? highlight_prop_obj[source.property] : source.property;
        property_obj.property_desc = highlight_prop_desc_obj[source.property] ? highlight_prop_desc_obj[source.property] : source.property_desc;
        property_obj.length += highlight_prop_desc !== undefined || highlight_prop !== undefined || highlight_cdeId !== undefined ? 1 : 0;
      }
      else{
        property_obj.property = source.property;
        property_obj.property_desc = source.property_desc;
      }

      property_obj.all_values = source.enum ? source.enum.map(function(x){ return x.n;}) : [];
      property_obj.all_values.sort();

      if(enum_hits.total !== 0 && highlight_cdeId === undefined){
        enum_hits.hits.forEach(hl_em => {
          let em_source = hl_em._source;
          let em_highlight = hl_em.highlight;
          let highlight_value = ("enum.n" in em_highlight) || ("enum.n.have" in em_highlight) ? em_highlight["enum.n"] || em_highlight["enum.n.have"] : undefined;
          let highlight_value_obj = getHighlightObj(highlight_value);
          let value_obj = highlight_value_obj[em_source.n] ? highlight_value_obj[em_source.n] : em_source.n;
          if(property_obj.hl_values.indexOf(value_obj) === -1) property_obj.hl_values.push(value_obj);
        });
      }
      else if(enum_hits.total !== 0 && highlight_cdeId !== undefined){
        let highlight_value_obj = getAllValueHighlight(enum_hits);
        property_obj.hl_values = source.enum ? source.enum.map(function(x){ return highlight_value_obj[x.n] ? highlight_value_obj[x.n] : x.n; })  : [];
        property_obj.hl_values.sort();
      }
      else if(enum_hits.total === 0 && highlight_cdeId !== undefined){
        property_obj.hl_values = source.enum ? source.enum.map(function(x){ return x.n;})  : [];
        property_obj.hl_values.sort();
      }
      property_obj.length += property_obj.hl_values.length;
      if(main_obj[source.category].nodes_obj[source.node] !== undefined){ // If node already exists add new properties_obj to it.
        if(main_obj[source.category].nodes_obj[source.node].properties_obj[source.property] === undefined){
          main_obj[source.category].nodes_obj[source.node].properties_obj[source.property] = {};
          main_obj[source.category].nodes_obj[source.node].properties_obj[source.property] = property_obj;
          main_obj[source.category].nodes_obj[source.node].length += property_obj.length;
        }
      }
      else { // If node doesn't exists add new node and properties_obj.
        if(node_obj.properties_obj[source.property] === undefined){
          node_obj.properties_obj[source.property] = {};
          node_obj.properties_obj[source.property] = property_obj;
          node_obj.length += property_obj.length;
        }
        main_obj[source.category].nodes_obj[source.node] = {};
        main_obj[source.category].nodes_obj[source.node] = node_obj;
      }
    };
  });
  for(let category in main_obj){
    let category_obj = main_obj[category];
    for(let node in category_obj.nodes_obj){
      let node_obj = category_obj.nodes_obj[node];
      for(let property in node_obj.properties_obj){
        let property_obj = node_obj.properties_obj[property];
        node_obj.properties.push(property_obj);
      }
      category_obj.nodes.push(node_obj);
      category_obj.length += node_obj.length;
    }
    dictionary.push(category_obj);
    result.len += category_obj.length;
  }
  let offset = $('#root').offset().top;
  let h = window.innerHeight - offset - 313;
  options.height = (h < 430) ? 430 : h;
  let html = template(dictionary, options);
  result.html = html;
  return result;
}

const getAllValueHighlight = (enum_hits) => {
  let highlight_value_obj = {};
  enum_hits.hits.forEach(hl_em => {
    let em_highlight = hl_em.highlight;
    let highlight_value = ("enum.n" in em_highlight) || ("enum.n.have" in em_highlight) ? em_highlight["enum.n"] || em_highlight["enum.n.have"] : undefined;
    if(highlight_value !== undefined){
      highlight_value.forEach(val => {
        let tmp = val.replace(/<b>/g, "").replace(/<\/b>/g, "");
        if(highlight_value_obj[tmp] === undefined) highlight_value_obj[tmp] = val;
      });
    }
  });
  return highlight_value_obj;
}

export const dtEvents = ($root) => {
  $root.on('click', '.treeview__toggle', (event) => {
    treeviewToggleHandle(event);
  });

  $root.on('click', '#trs-checkbox', (event) => {
    treeviewShowAllValuesHandle(event);
  });

  $root.on('click', '#trs_toggle', (event) => {
    treeviewToggleAllHandle(event);
  });
}
