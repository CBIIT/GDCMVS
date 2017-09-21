
let tmpl = '<div class="container table-container"><div class="table-row-thead row">' +
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
  '<div class="table-td col-xs-3">'
  +'{{if local}}'
  +'<a href="javascript:getGDCData(\'{{:ref}}\',null);">See All Values</a>'
  +'<br><a href="javascript:toCompare(\'{{:ref}}\');"> Compare with User List</a>'
    +'{{if syn}}'
    +'<br><a href="javascript:getGDCSynonyms(\'{{:ref}}\');">See All Synonyms</a>'
    +'{{else}}'
    +'{{/if}}'
  +'{{else}}'
  +'no values'
  +'{{/if}}'
  +'</div>' 
  +'<div class="table-td col-xs-3">'
  +'{{if cdeId == ""}}'
  +''
  +'{{else}}'
  +'caDSR: <a class="table-td-link" href="https://cdebrowser.nci.nih.gov/cdebrowserClient/cdeBrowser.html#/search?publicId={{:cdeId}}&version=1.0" target="_blank">CDE</a>'
    +'{{if local && cdeLen}}'
    +'<br><a class="table-td-link" href="javascript:getCDEData(\'{{:cdeId}}\');">Values</a> , <a class="table-td-link" href="javascript:compareGDC(\'{{:ref}}\',\'{{:cdeId}}\');"> Compare with GDC</a>'
    +'{{else cdeLen}}'
    +' , <a class="table-td-link" href="javascript:getCDEData(\'{{:cdeId}}\');">Values</a>'
    +'{{else}}'
    +''
    +'{{/if}}'
  +'{{/if}}'
  +'</div>' +
'</div>'+
'{{/for}}</div>';

export default tmpl;