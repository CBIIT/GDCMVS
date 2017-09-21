
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
      '<div class="table-th col-xs-4">Matched GDC Value</div>' +
      '<div class="table-th col-xs-3">GDC Synonyms</div>' +
      '<div class="table-th col-xs-3">NCIt Code and Synonyms</div>' +
      '<div class="table-th col-xs-2">CDE Reference</div>' +
    '</div>' +
  '</div>' +
'</div> {{for values}}' +
'<div class="table-row row">' +
  '<div class="col-xs-3">'+
    '<div class="table-td">'+
      '{{:category}}<ul><li>{{:node}}<ul><li>{{:name}}</li></ul></li></ul>'+
    '</div>' +
  '</div>'+
  '<div class="col-xs-7"> {{for vs}}' +
    '<div class="row">' +
      '<div class="table-td col-xs-5">{{if n == "See All Values"}}<a href="javascript:getGDCData(\'{{:ref}}\',null);">See All Values</a>{{else}}<a href="javascript:getGDCData(\'{{:ref}}\',\'{{:n}}\');">{{:n}}</a>{{/if}}</div>' +
      '<div class="table-td col-xs-4"><div class="row"><div class="col-xs-3">{{:n_c}}</div><div class="col-xs-9">{{for s}}{{:}}</br>{{/for}}</div></div></div>' +
      '<div class="table-td col-xs-3">'
        +'{{for cde_s}}'
        +'<div class="row">'
          +'<div class="col-xs-3">{{:c}}</div>'
          +'<div class="col-xs-9">{{for s}}{{:}}</br>{{/for}}</div>'
        +'</div>' 
        +'{{/for}}'
      +'</div>'
    +'</div> {{/for}}' 
    +'<div class="show-more"></div>'
    +'<div class="links">'
      +'{{if local}}'
      +'<a href="javascript:toCompare(\'{{:ref}}\');"> Compare with User List</a>'
        +'{{if syn}}'
        +' , <a href="javascript:getGDCSynonyms(\'{{:ref}}\');">See All Synonyms</a>'
        +'{{else}}'
        +'{{/if}}'
      +'{{else}}'
      +''
      +'{{/if}}'
    +'</div>' +
  '</div>' +
  '<div class="table-td col-xs-2">'
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
'</div> {{/for}} </div>';


export default tmpl;

