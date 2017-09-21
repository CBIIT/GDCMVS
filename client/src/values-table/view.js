
let tmpl = '<div class="container table-container"><div class="table-row-thead row">' +
  '<div class="col-xs-3">' +
    '<div class="table-th">Category / Node / Property</div>' +
  '</div>' +
  '<div class="col-xs-9">' +
    '<div class="row">' +
      '<div class="table-th col-xs-6">GDC Values and Synonyms</div>' +
      '<div class="table-th col-xs-6">CDE references, permissible values and Synonyms</div>' +
    '</div>' +
    '<div class="row">' +
      '<div class="table-th col-xs-3">Matched GDC Value</div>' +
      '<div class="table-th col-xs-3">GDC Synonyms</div>' +
      '<div class="table-th col-xs-3">NCIt Code and Synonyms</div>' +
      '<div class="table-th col-xs-3">CDE Reference</div>' +
    '</div>' +
  '</div>' +
'</div> {{for values}}' +
'<div class="table-row row">' +
  '<div class="table-td col-xs-3">{{:_id}}</div>' +


  '<div class="col-xs-7"> {{for vs}}' +
    '<div class="row">' +
      '<div class="table-td col-xs-4">{{:n}}</div>' +
      '<div class="table-td col-xs-4"><b>{{:n_c}}</b></br>{{for s}}{{:}}</br>{{/for}}</div>' +
      '<div class="table-td col-xs-4">Content</div>' +
    '</div> {{/for}}' +
  '</div>' +
  '<div class="table-td col-xs-2">Content</div>' +
'</div> {{/for}} </div>';


export default tmpl;

