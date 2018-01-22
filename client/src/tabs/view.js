
let tmpl = '<div class="results">' +
  '<div class="tab-nav">' +
    '<div class="tab-nav__text">Results for <span class="tab-nav__term">\'{{:keyword}}\'</span> in:</div>' +
    '<div id="tab" class="btn-group tab-nav__group" data-toggle="buttons">' +
      '<ul class="tab-nav__ul"role="tablist">'+
      '<li role="presentation" class="tab-nav__li{{if vs_active}} active{{else}}{{/if}}">'+
        '<div class="tab-nav__tooltip tooltip-target" data-toggle="tooltip" data-placement="bottom" data-delay=\'{"show":"1000"}\' data-trigger="hover" title="Text will be provided to inform users on how to interpret content of tabs.">'+
          '<a href="#values" class="tab-nav__btn" aria-controls="values" role="tab" data-toggle="tab" aria-expanded="true">Values</a>'+
          '<span class="tab-nav__notification">{{:vs_len}}</span>'+
        '</div>'+
      '</li>'+
      '<li role="presentation" class="tab-nav__li{{if ps_active}} active{{else}}{{/if}}">'+
        '<div class="tab-nav__tooltip tooltip-target" data-toggle="tooltip" data-placement="bottom" data-delay=\'{"show":"1000"}\' data-trigger="hover" title="Text will be provided to inform users on how to interpret content of tabs.">'+
          '<a href="#properties" class="tab-nav__btn" aria-controls="properties" role="tab" data-toggle="tab" aria-expanded="true">Properties</a>'+
          '<span class="tab-nav__notification">{{:ps_len}}</span>'+
        '</div>'+
      '</li>'+
      '<li role="presentation" class="tab-nav__li{{if trs_active}} active{{else}}{{/if}}">'+
        '<div class="tab-nav__tooltip tooltip-target" data-toggle="tooltip" data-placement="bottom" data-delay=\'{"show":"1000"}\' data-trigger="hover" title="Text will be provided to inform users on how to interpret content of tabs.">'+
          '<a href="#dictionary" class="tab-nav__btn" aria-controls="dictionary" role="tab" data-toggle="tab" aria-expanded="true">Dictionary</a>'+
          '<span class="tab-nav__notification">{{:trs_len}}</span>'+
        '</div>'+
      '</li>'+
      '</ul>'+
  '</div></div>' +
  '<div class="tab-content"><div role="tabpanel" class="tab-pane {{if vs_active}}active{{else}}{{/if}}" id="values">{{:vsHtml}}</div>' +
  '<div role="tabpanel" class="tab-pane {{if ps_active}}active{{else}}{{/if}}" id="properties">{{:psHtml}}</div>' +
  '<div role="tabpanel" class="tab-pane {{if trs_active}}active{{else}}{{/if}}" id="dictionary">{{:trsHtml}}</div></div></div>';

export default tmpl;
