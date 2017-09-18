export default function vsRender(items) {
  console.log(items);

let tmpl = '<div class="table-row-thead row">' +
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
'</div> {{for items}}' +
'<div class="table-row row">' +
  '<div class="table-td col-xs-4">{{:doc.id}}</div>' +
  '<div class="table-td col-xs-4">Content</div>' +
  '<div class="table-td col-xs-4">Content</div>' +
'</div> {{/for}}';

let html = $.templates(tmpl).render({items: items });

return html;

}
