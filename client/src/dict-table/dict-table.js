import template from './dict-table-view';
import { getHighlightObj } from '../shared';

const treeviewToggleHandle = (event) => {
  event.preventDefault();
  const $this = $(event.currentTarget);
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
};

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
};

const treeviewToggleAllHandle = (event) => {
  const $this = $(event.currentTarget);
  const $tviewUl = $('.treeview .treeview__ul');
  const $tviewLi = $('.treeview .treeview__parent');
  const $tviewTrigger = $('.treeview .treeview__toggle');
  if ($this.hasClass('active')) {
    $tviewUl.hide();
    $tviewLi.removeClass('treeview__parent--open');
    $tviewTrigger.attr('aria-label', 'expand');
    $tviewTrigger.html('<i class="fa fa-angle-down"></i>');
    $this.html('<i class="fa fa-angle-down"></i> Expand All');
  } else {
    $tviewUl.show();
    $tviewLi.addClass('treeview__parent--open');
    $tviewTrigger.attr('aria-label', 'collapse');
    $tviewTrigger.html('<i class="fa fa-angle-up"></i>');
    $this.html('<i class="fa fa-angle-up"></i>  Collapse All');
  }
};

export const dtRender = (items, keyword, searchOption) => {
  // Final data
  let dictionary = [];
  // final result
  let result = {};
  result.len = 0;
  // options render
  let options = {};
  // RegExp Keyword
  // keyword = keyword.trim().replace(/[\ ,:_-]+/g, " ");
  // let reg_key = new RegExp(keyword, "ig");
  let mainObj = {};
  items.forEach(item => {
    let source = item._source;
    let enumHits = item.inner_hits.enum.hits;
    let highlight = item.highlight ? item.highlight : undefined;

    if (mainObj[source.category] === undefined) { // category doesn't exists, add it
      let categoryObj = {
        category: source.category,
        type: 'category',
        length: 0,
        nodes_obj: {},
        nodes: []
      };

      let nodeObj = {
        node: source.node,
        node_desc: source.node_desc,
        type: 'node',
        length: 0,
        properties_obj: {},
        properties: []
      };

      let propertyObj = {
        type: 'property',
        length: 0,
        hl_values: [],
        all_values: []
      };

      let highlightCdeId;
      // Add highlight to property
      if (highlight !== undefined) {
        let highlightProp = ('property' in highlight) || ('property.have' in highlight) ? highlight['property'] || highlight['property.have'] : undefined;
        let highlightPropObj = getHighlightObj(highlightProp);

        highlightCdeId = ('cde.id' in highlight) ? highlight['cde.id'] : undefined;

        let highlightPropDesc = ('property_desc' in highlight) ? highlight['property_desc'] : undefined;
        let highlightPropDescObj = {};
        if (highlightPropDesc !== undefined) {
          highlightPropDesc.forEach(val => {
            if (highlightPropDescObj[source.property] === undefined) highlightPropDescObj[source.property] = val;
          });
        }
        propertyObj.property = highlightPropObj[source.property] ? highlightPropObj[source.property] : source.property;
        propertyObj.property_desc = highlightPropDescObj[source.property] ? highlightPropDescObj[source.property] : source.property_desc;
        propertyObj.length += highlightPropDesc !== undefined || highlightProp !== undefined || highlightCdeId !== undefined ? 1 : 0;
      } else {
        propertyObj.property = source.property;
        propertyObj.property_desc = source.property_desc;
      }
      let highlightValueObj = {};
      if (enumHits.total !== 0) highlightValueObj = getAllValueHighlight(enumHits);
      propertyObj.all_values = source.enum !== undefined ? source.enum.map(function (x) { return highlightValueObj[x.n] ? highlightValueObj[x.n] : x.n; }) : [];
      propertyObj.all_values.sort();

      if (enumHits.total !== 0 && highlightCdeId === undefined) {
        enumHits.hits.forEach(emHit => {
          let emSource = emHit._source;
          let emHighlight = emHit.highlight;
          let highlightValue = ('enum.n' in emHighlight) || ('enum.n.have' in emHighlight) ? emHighlight['enum.n'] || emHighlight['enum.n.have'] : undefined;
          let highlightValueObj = getHighlightObj(highlightValue);
          let valueObj = highlightValueObj[emSource.n] ? highlightValueObj[emSource.n] : emSource.n;
          if (propertyObj.hl_values.indexOf(valueObj) === -1) propertyObj.hl_values.push(valueObj);
          propertyObj.hl_values.sort();
        });
      } else if (enumHits.total !== 0 && highlightCdeId !== undefined) {
        let highlightValueObj = getAllValueHighlight(enumHits);
        propertyObj.hl_values = source.enum !== undefined ? source.enum.map(function (x) { return highlightValueObj[x.n] ? highlightValueObj[x.n] : x.n; }) : [];
        propertyObj.hl_values.sort();
      } else if (enumHits.total === 0 && highlightCdeId !== undefined) {
        propertyObj.hl_values = source.enum !== undefined ? source.enum.map(function (x) { return x.n; }) : [];
        propertyObj.hl_values.sort();
      }
      propertyObj.length += propertyObj.hl_values.length;
      if (nodeObj.properties_obj[source.property] === undefined) {
        nodeObj.properties_obj[source.property] = {};
        nodeObj.properties_obj[source.property] = propertyObj;
        nodeObj.length += propertyObj.length;
      }

      if (categoryObj.nodes_obj[source.node] === undefined) {
        categoryObj.nodes_obj[source.node] = {};
        categoryObj.nodes_obj[source.node] = nodeObj;
      }

      mainObj[source.category] = categoryObj;
    } else { // category already exists
      let nodeObj = {
        node: source.node,
        node_desc: source.node_desc,
        type: 'node',
        length: 0,
        properties_obj: {},
        properties: []
      };

      let propertyObj = {
        type: 'property',
        length: 0,
        hl_values: [],
        all_values: []
      };

      let highlightCdeId;
      // Add highlight to property
      if (highlight !== undefined) {
        let highlightProp = ('property' in highlight) || ('property.have' in highlight) ? highlight['property'] || highlight['property.have'] : undefined;
        let highlightPropObj = getHighlightObj(highlightProp);

        highlightCdeId = ('cde.id' in highlight) ? highlight['cde.id'] : undefined;

        let highlightPropDesc = ('property_desc' in highlight) ? highlight['property_desc'] : undefined;
        let highlightPropDescObj = {};
        if (highlightPropDesc !== undefined) {
          highlightPropDesc.forEach(val => {
            if (highlightPropDescObj[source.property] === undefined) highlightPropDescObj[source.property] = val;
          });
        }
        propertyObj.property = highlightPropObj[source.property] ? highlightPropObj[source.property] : source.property;
        propertyObj.property_desc = highlightPropDescObj[source.property] ? highlightPropDescObj[source.property] : source.property_desc;
        propertyObj.length += highlightPropDesc !== undefined || highlightProp !== undefined || highlightCdeId !== undefined ? 1 : 0;
      } else {
        propertyObj.property = source.property;
        propertyObj.property_desc = source.property_desc;
      }
      let highlightValueObj = {};
      if (enumHits.total !== 0) highlightValueObj = getAllValueHighlight(enumHits);
      propertyObj.all_values = source.enum !== undefined ? source.enum.map(function (x) { return highlightValueObj[x.n] ? highlightValueObj[x.n] : x.n; }) : [];
      propertyObj.all_values.sort();

      if (enumHits.total !== 0 && highlightCdeId === undefined) {
        enumHits.hits.forEach(emHit => {
          let emSource = emHit._source;
          let emHighlight = emHit.highlight;
          let highlightValue = ('enum.n' in emHighlight) || ('enum.n.have' in emHighlight) ? emHighlight['enum.n'] || emHighlight['enum.n.have'] : undefined;
          let highlightValueObj = getHighlightObj(highlightValue);
          let valueObj = highlightValueObj[emSource.n] ? highlightValueObj[emSource.n] : emSource.n;
          if (propertyObj.hl_values.indexOf(valueObj) === -1) propertyObj.hl_values.push(valueObj);
          propertyObj.hl_values.sort();
        });
      } else if (enumHits.total !== 0 && highlightCdeId !== undefined) {
        let highlightValueObj = getAllValueHighlight(enumHits);
        propertyObj.hl_values = source.enum !== undefined ? source.enum.map(function (x) { return highlightValueObj[x.n] ? highlightValueObj[x.n] : x.n; }) : [];
        propertyObj.hl_values.sort();
      } else if (enumHits.total === 0 && highlightCdeId !== undefined) {
        propertyObj.hl_values = source.enum !== undefined ? source.enum.map(function (x) { return x.n; }) : [];
        propertyObj.hl_values.sort();
      }
      propertyObj.length += propertyObj.hl_values.length;
      if (mainObj[source.category].nodes_obj[source.node] !== undefined) { // If node already exists add new properties_obj to it.
        if (mainObj[source.category].nodes_obj[source.node].properties_obj[source.property] === undefined) {
          mainObj[source.category].nodes_obj[source.node].properties_obj[source.property] = {};
          mainObj[source.category].nodes_obj[source.node].properties_obj[source.property] = propertyObj;
          mainObj[source.category].nodes_obj[source.node].length += propertyObj.length;
        }
      } else { // If node doesn't exists add new node and properties_obj.
        if (nodeObj.properties_obj[source.property] === undefined) {
          nodeObj.properties_obj[source.property] = {};
          nodeObj.properties_obj[source.property] = propertyObj;
          nodeObj.length += propertyObj.length;
        }
        mainObj[source.category].nodes_obj[source.node] = {};
        mainObj[source.category].nodes_obj[source.node] = nodeObj;
      }
    };
  });
  for (let category in mainObj) {
    let categoryObj = mainObj[category];
    for (let node in categoryObj.nodes_obj) {
      let nodeObj = categoryObj.nodes_obj[node];
      for (let property in nodeObj.properties_obj) {
        let propertyObj = nodeObj.properties_obj[property];
        nodeObj.properties.push(propertyObj);
      }
      categoryObj.nodes.push(nodeObj);
      categoryObj.length += nodeObj.length;
    }
    dictionary.push(categoryObj);
    result.len += categoryObj.length;
  }
  let offset = $('#root').offset().top;
  let h = window.innerHeight - offset - 313;
  options.height = (h < 430) ? 430 : h;
  let html = template(dictionary, options);
  result.html = html;
  return result;
};

const getAllValueHighlight = (enumHits) => {
  let highlightValueObj = {};
  enumHits.hits.forEach(emHit => {
    let emHighlight = emHit.highlight;
    let highlightValue = ('enum.n' in emHighlight) || ('enum.n.have' in emHighlight) ? emHighlight['enum.n'] || emHighlight['enum.n.have'] : undefined;
    if (highlightValue !== undefined) {
      highlightValue.forEach(val => {
        let tmp = val.replace(/<b>/g, '').replace(/<\/b>/g, '');
        if (highlightValueObj[tmp] === undefined) highlightValueObj[tmp] = val;
      });
    }
  });
  return highlightValueObj;
};

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
};
