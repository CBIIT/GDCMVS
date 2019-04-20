import tmpl from './dict-table.html';

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
  let trs = [];

  // final result
  let result = {};
  result.len = 0;
  // options render
  let options = {};
  // RegExp Keyword
  keyword = keyword.trim().replace(/[\ ,:_-]+/g, " ");
  let reg_key = new RegExp(keyword, "ig");

  items.forEach(item => {
    let source = item._source;
    let main_obj = {};
    main_obj.category = source.category;
    main_obj.type = "category";
    main_obj.nodes = [];
    main_obj.length = 0;
    items.forEach(nodeData => {
      let nodeSource = nodeData._source;
      if(nodeSource.category === main_obj.category){
        let node_obj = {};
        node_obj.node = nodeSource.node;
        node_obj.type = "node";
        node_obj.node_desc = nodeSource.node_desc;
        node_obj.properties = [];
        node_obj.length = 0;

        items.forEach(propertyData => {
          let propertySource = propertyData._source;
          if(propertySource.category === main_obj.category && propertySource.node === node_obj.node){
            let property_obj = {};
            property_obj.length = 0;
            let highlight_prop = [];
            let highlight_cdeId = [];
            let highlight_prop_desc = [];
            let highlight_prop_obj = {};
            let highlight_prop_desc_obj = {};
            if(propertyData.highlight !== undefined){
              let highlight = propertyData.highlight;
              highlight_prop = ("property" in highlight) || ("property.have" in highlight) ? highlight["property"] || highlight["property.have"] : undefined;
              // property_obj.length += highlight_prop !== undefined ? highlight_prop.length : 0;
              if(highlight_prop !== undefined){
                highlight_prop.forEach(val => {
                  let tmp = val.replace(/<b>/g, "").replace(/<\/b>/g, "");
                  if(highlight_prop_obj[tmp] === undefined) highlight_prop_obj[tmp] = val;
                });
              }

              highlight_cdeId = ("cde.id" in highlight) ? highlight["cde.id"] : undefined;

              highlight_prop_desc = ("property_desc" in highlight) ? highlight["property_desc"] : undefined;
              property_obj.length += highlight_prop_desc !== undefined || highlight_prop !== undefined || highlight_cdeId !== undefined ? 1 : 0;
            }
            property_obj.property = highlight_prop_obj[propertySource.property] ? highlight_prop_obj[propertySource.property] : propertySource.property;
            property_obj.type = "property";
            property_obj.node = propertySource.node;
            property_obj.property_desc = propertySource.property_desc;

            property_obj.hl_values = [];
            property_obj.all_values = [];
            items.forEach(enumData => {
              let enumSource = enumData._source;
              if(enumSource.category === main_obj.category && enumSource.node === node_obj.node && enumSource.property === property_obj.property){
                let enums = enumData.inner_hits.enum;
                if(enums.hits.total !== 0){
                  let enum_hits = enums.hits.hits;
                  enum_hits.forEach(hits => {
                    let value_obj = {};
                    let highlight = hits.highlight;
                    let highlight_value = ("enum.n" in highlight) || ("enum.n.have" in highlight) ? highlight["enum.n"] || highlight["enum.n.have"] : undefined;
                    let highlight_value_obj = {};
                    if(highlight_value !== undefined){
                      highlight_value.forEach(val => {
                        let tmp = val.replace(/<b>/g, "").replace(/<\/b>/g, "");
                        if(highlight_value_obj[tmp] === undefined) highlight_value_obj[tmp] = val;
                      });
                    }
                    value_obj.value = highlight_value_obj[hits._source.n] !== undefined ? highlight_value_obj[hits._source.n] : hits._source.n;
                    value_obj.type = "value";
                    property_obj.hl_values.push(value_obj);
                  });
                }
                else if(enumData.highlight["cde.id"] && enumSource.enum !== undefined){
                  enumSource.enum.forEach(val => {
                    let value_obj = {};
                    value_obj.value = val.n;
                    value_obj.type = "value";
                    if(!_.some(property_obj.hl_values, value_obj)) property_obj.hl_values.push(value_obj);
                  });
                }
                if(enumSource.enum !== undefined){
                  enumSource.enum.forEach(val => {
                    if(property_obj.all_values.indexOf(val.n) === -1) property_obj.all_values.push(val.n);
                  });
                }
              }
            });
            property_obj.length += property_obj.hl_values.length;
            node_obj.length += property_obj.length;
            if(!_.some(node_obj.properties, property_obj)) node_obj.properties.push(property_obj);
          }
        });
        if(!_.some(main_obj.nodes,node_obj)) main_obj.length += node_obj.length;
        if(!_.some(main_obj.nodes,node_obj)) main_obj.nodes.push(node_obj); // Only push if it doesn't exists
      }
    });
    if(!_.some(trs,main_obj)) result.len += main_obj.length;
    if(!_.some(trs,main_obj)) trs.push(main_obj); // Only push if it doesn't exists
  });

  let offset = $('#root').offset().top;
  let h = window.innerHeight - offset - 313;
  options.height = (h < 430) ? 430 : h;
  let html = $.templates(tmpl).render({
    options: options,
    trs: trs
  });
  result.html = html;
  return result;
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
