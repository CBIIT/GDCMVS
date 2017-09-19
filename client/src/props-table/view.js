
let tmpl = '<div class="container"><div class="table-row-thead row">' +
  '<div class="table-th col-xs-1">Category / Node</div>' +
  '<div class="table-th col-xs-2">Property</div>' +
  '<div class="table-th col-xs-3">Description</div>' +
  '<div class="table-th col-xs-3">GDC Property Values</div>' +
  '<div class="table-th col-xs-3">CDE Reference</div>' +
'</div>' +
'{{for props}}'+
'<div class="table-row row">' +
  '<div class="table-td col-xs-1">{{:ct}} -- {{:nd}}</div>' +
  '<div class="table-td col-xs-2">{{:nm}}</div>' +
  '<div class="table-td col-xs-3">{{:desc}}</div>' +
  '<div class="table-td col-xs-3">{{:ref}}</div>' +
  '<div class="table-td col-xs-3">{{:cdeId}}</div>' +
'</div>'+
'{{/for}}</div>';

export default tmpl;