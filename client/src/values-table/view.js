
let tmpl = '<div class="container table-container"><div class="table-thead row">' +
  '<div class="col-xs-3">' +
    '<div class="table-th">Category / Node / Property</div>' +
  '</div>' +
  '<div class="col-xs-9">' +
    '<div class="row">' +
      '<div class="table-th table-header col-xs-6">GDC Values and Synonyms</div>' +
      '<div class="table-th table-header col-xs-6">CDE references, permissible values and Synonyms</div>' +
    '</div>' +
    '<div class="row thead-row">' +
      '<div class="table-th col-xs-3">Matched GDC Value</div>' +
      '<div class="table-th col-xs-3">GDC Values: NCIt Synonyms</div>' +
      '<div class="table-th table-header col-xs-6">CDE Values: NCIt Code and Synonyms</div>' +
    '</div>' +
  '</div>' +
'</div>'+
'<div class="row table-body" style="max-height: {{:mh}}px;"><div class="col-xs-12">{{for values}}' +
'<div class="table-row row">' +
  '<div class="table-td col-xs-3">'+
      '{{:category}}<ul><li>{{:node}}<ul><li>{{:name}}</li></ul></li></ul>'+
  '</div>'+
  '<div class="col-xs-9 border-l"> {{for vs}}' +
    '<div class="row {{if #getIndex() > 4}}row-toggle row-flex{{else}}row-flex{{/if}}" style="">' +
      '<div class="table-td col-xs-3 border-r border-b">{{if n == "See All Values"}}<a href="javascript:getGDCData(\'{{:ref}}\',null);">See All Values</a>{{else}}<a href="javascript:getGDCData(\'{{:ref}}\',\'{{:n}}\');">{{if i_c !== undefined }}({{:i_c}}) {{else}}{{/if}}{{:n}}</a>{{/if}}</div>' +
      '<div class="table-td col-xs-3 border-r border-b"><div class="row"><div class="col-xs-3">{{:n_c}}</div><div class="col-xs-9">{{for s}}{{:}}</br>{{/for}}</div></div></div>' +
      '<div class="table-td col-xs-6 border-b">'
        +'{{for cde_s}}'
        +'<div class="row">'
          +'<div class="col-xs-3">{{:c}}</div>'
          +'<div class="col-xs-9">{{for s}}{{:}}</br>{{/for}}</div>'
        +'</div>' 
        +'{{/for}}'
      +'</div>'
    +'</div> {{/for}}' 
      +'{{if vs.length > 5}}'
        +'<div class="row row-flex"><div class="col-xs-3 border-r">'
         +'<a class="table-td-link show-more-less" href="javascript:void(0);"><i class="fa fa-angle-down"></i> Show More ({{:vs.length - 5}})</a>'
        +'</div><div class="col-xs-3 border-r"></div><div class="col-xs-6"></div></div>'
      +'{{/if}}'
      +'<div class="row row-flex" style="">'

        +'{{if local}}'
          +'<div class="table-td col-xs-3 border-r"><a href="javascript:toCompare(\'{{:ref}}\');"> Compare with User List</a></div>'
        +'{{else}}'
          +'<div class="table-td col-xs-3 border-r"></div>'
        +'{{/if}}'

        +'{{if syn}}'
          +'<div class="table-td col-xs-3 border-r"><a href="javascript:getGDCSynonyms(\'{{:ref}}\', \'{{:tgts_enum_n}}\');">See All Synonyms</a></div>'
        +'{{else}}'
          +'<div class="table-td col-xs-3 border-r"></div>'
        +'{{/if}}'

        +'{{if cdeId == ""}}'
          +'<div class="table-td col-xs-6"></div>'
        +'{{else}}'
          +'<div class="table-td col-xs-6">caDSR: <a class="table-td-link" href="https://cdebrowser.nci.nih.gov/cdebrowserClient/cdeBrowser.html#/search?publicId={{:cdeId}}&version=1.0" target="_blank">CDE</a>'
            +'{{if local && cdeLen}}'
            +' , <a class="table-td-link" href="javascript:getCDEData(\'{{:cdeId}}\', \'{{:tgts_cde_n}}\');">Values</a> , <a class="table-td-link" href="javascript:compareGDC(\'{{:ref}}\',\'{{:cdeId}}\');"> Compare with GDC</a>'
            +'{{else cdeLen}}'
            +' , <a class="table-td-link" href="javascript:getCDEData(\'{{:cdeId}}\', \'{{:tgts_cde_n}}\');">Values</a>'
            +'{{else}}'
            +''
            +'{{/if}}'
          +'</div>'
        +'{{/if}}'

      +'</div>'
  +'</div>'

+'</div> {{/for}} </div></div></div>';


export default tmpl;

