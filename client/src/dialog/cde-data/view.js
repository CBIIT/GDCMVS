let tmpl = {
  header: '<div class="dialog__header">'
    +'<div class="dialog__titlebar">'
      +'<span id="ui-id-4" class="ui-dialog-title">caDSR Values</span>'
      +'<button type="button" id="close_caDSR_data" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"></button>'
      +'<span class="ui-label">{{:items_length}}</span>'
      +'<div class="checkbox ui-checkbox">'
        +'<label class="checkbox__label checkbox__label--height">'
          +'<input id="cde-data-invariant" class="checkbox__input" type="checkbox" value="">'
          +'<span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Show Duplicates'
        +'</label>'
        +'{{if targets !== null}}'
        +'<label class="checkbox__label checkbox__label--height">'
          +'<input id="show_all_cde_syn" class="checkbox__input" type="checkbox" value="">'
          +'<span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Show all CDE values'
        +'</label>'
        +'{{/if}}'
      +'</div>'
    +'</div>'
    +'<div class="table__container">'
      +'<div class="table__thead row">'
        +'<div class="table__th col-xs-2">PV</div>'
        +'<div class="table__th col-xs-2">PV Meaning</div>'
        +'<div class="table__th col-xs-4">Description</div>'
        +'<div class="table__th col-xs-4">NCIt Code and Synonyms</div>'
      +'</div>'
    +'</div>'
  +'</div>',
  body: '<div id="caDSR_data">'
    +'<div id="cde-syn-data-list" class="table__container">'
      +'<div class="table__body row">'
        +'<div class="col-xs-12">'
        +'{{for items}}'
          +'{{if e == true || ~root.targets == null}}'
          +'<div class="table__row row">'
            +'<div class="table__td col-xs-2">{{:pv}}</div>'
            +'<div class="table__td col-xs-2">{{:pvm}}</div>'
            +'<div class="table__td col-xs-4">{{:pvd}}</div>'
            +'<div name="syn_area" class="table__td col-xs-4">'
            +'{{for i_rows}}'
              +'<div class="row">'
                +'<div class="col-lg-3">'
                  +'{{* if((/^C[1-9]/g).test(data.pvc)) { }}<a class="table-td-link" href="javascript:getNCITDetails(\'{{:pvc}}\');">{{:pvc}}</a> (NCIt)'
                  +'{{* } else { }} {{:pvc}} {{*: (/^[E]/g).test(data.pvc) ? "(CTCAE)" : "(NCIt)" }} {{* } }}'
                +'</div>'
                +'<div class="col-lg-9 col-xs-12">{{for s}}{{>#data}}<br>{{/for}}</div>'
              +'</div>'
            +'{{/for}}'
            +'</div>'
            +'<div name="syn_invariant" class="table__td col-xs-4" style="display: none;">'
            +'{{for rows}}'
              +'<div class="row">'
                +'<div class="col-lg-3">'
                  +'{{* if((/^C[1-9]/g).test(data.pvc)) { }}<a class="table-td-link" href="javascript:getNCITDetails(\'{{:pvc}}\');">{{:pvc}}</a> (NCIt)'
                  +'{{* } else { }} {{:pvc}} {{*: (/^[E]/g).test(data.pvc) ? "(CTCAE)" : "(NCIt)" }} {{* } }}'
                +'</div>'
                +'<div class="col-lg-9 col-xs-12">{{for s}}{{>#data}}<br>{{/for}}</div>'
              +'</div>'
            +'{{/for}}'
            +'</div>'
          +'</div>'
          +'{{else}}'
          +'<div class="table__row row" style="display: none;">'
            +'<div class="table__td col-xs-2">{{:pv}}</div>'
            +'<div class="table__td col-xs-2">{{:pvm}}</div>'
            +'<div class="table__td col-xs-4">{{:pvd}}</div>'
            +'<div name="syn_area" class="table__td col-xs-4">'
            +'{{for i_rows}}'
              +'<div class="row">'
                +'<div class="col-lg-3 col-xs-12">'
                  +'{{* if((/^C[1-9]/g).test(data.pvc)) { }}<a class="table-td-link" href="javascript:getNCITDetails(\'{{:pvc}}\');">{{:pvc}}</a> (NCIt)'
                  +'{{* } else { }} {{:pvc}} {{*: (/^[E]/g).test(data.pvc) ? "(CTCAE)" : "(NCIt)" }} {{* } }}'
                +'</div>'
                +'<div class="col-lg-9 col-xs-12">{{for s}}{{>#data}}<br>{{/for}}</div>'
              +'</div>'
            +'{{/for}}'
            +'</div>'
            +'<div name="syn_invariant" class="table__td col-xs-4" style="display: none;">'
            +'{{for rows}}'
              +'<div class="row">'
                +'<div class="col-lg-3 col-xs-12">'
                  +'{{* if((/^C[1-9]/g).test(data.pvc)) { }}<a class="table-td-link" href="javascript:getNCITDetails(\'{{:pvc}}\');">{{:pvc}}</a> (NCIt)'
                  +'{{* } else { }} {{:pvc}} {{*: (/^[E]/g).test(data.pvc) ? "(CTCAE)" : "(NCIt)" }} {{* } }}'
                +'</div>'
                +'<div class="col-lg-9 col-xs-12">{{for s}}{{>#data}}<br>{{/for}}</div>'
              +'</div>'
            +'{{/for}}'
            +'</div>'
          +'</div>'
          +'{{/if}}'
        +'{{/for}}'
        +'</div>'
      +'</div>'
    +'</div>'
  +'</div>',
  footer:'',
}

export default tmpl;