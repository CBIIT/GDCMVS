
let tmpl = '<div class="results">' +
  '<div class="tab-nav">' +
    '<div class="tab-nav__text">Results for <span class="tab-nav__term">\'{{:keyword}}\'</span> in:</div>' +
    '<div id="tab" class="btn-group tab-nav__group" data-toggle="buttons">' +
      // '<a href="#" class="btn tab-nav__btn {{if vs_active}}active{{else}}{{/if}}" data-toggle="tab">' +
      //   '<label for="values" class="hide">values</label><input id="values" type="radio" data-target="#values" />Values' +
      //   '<span class="tab-nav__notification">{{:vs_len}}</span>' +
      // '</a>' +
      // '<a href="#" class="btn tab-nav__btn {{if ps_active}}active{{else}}{{/if}}" data-toggle="tab">' +
      //   '<label for="properties" class="hide">properties</label><input id="properties" type="radio" data-target="#properties" />Properties' +
      //   '<span class="tab-nav__notification">{{:ps_len}}</span>' +
      // '</a>' +
      // '<a href="#" class="btn tab-nav__btn {{if trs_active}}active{{else}}{{/if}}" data-toggle="tab">' +
      //   '<label for="dictionary" class="hide">dictionary</label><input id="dictionary" type="radio" data-target="#dictionary" />GDC Dictionary' +
      //   '<span class="tab-nav__notification">{{:trs_len}}</span>' +
      // '</a>' +
      '<ul class="tab-nav__ul"role="tablist">'+
      '<li role="presentation" class="tab-nav__li{{if vs_active}} active{{else}}{{/if}}">'+
        '<a href="#values" class="tab-nav__btn" aria-controls="values" role="tab" data-toggle="tab" aria-expanded="true">Values</a>'+
        '<span class="tab-nav__notification">{{:vs_len}}</span>'+
      '</li>'+
      '<li role="presentation" class="tab-nav__li{{if ps_active}} active{{else}}{{/if}}">'+
        '<a href="#properties" class="tab-nav__btn" aria-controls="properties" role="tab" data-toggle="tab" aria-expanded="true">Properties</a>'+
        '<span class="tab-nav__notification">{{:ps_len}}</span>'+
      '</li>'+
      '<li role="presentation" class="tab-nav__li{{if trs_active}} active{{else}}{{/if}}">'+
        '<a href="#dictionary" class="tab-nav__btn" aria-controls="dictionary" role="tab" data-toggle="tab" aria-expanded="true">GDC Dictionary</a>'+
        '<span class="tab-nav__notification">{{:trs_len}}</span>'+
      '</li>'+
      '</ul>'+
  '</div></div>' +
  '<div class="tab-content"><div role="tabpanel" class="tab-pane {{if vs_active}}active{{else}}{{/if}}" id="values">{{:vsHtml}}</div>' +
  '<div role="tabpanel" class="tab-pane {{if ps_active}}active{{else}}{{/if}}" id="properties">{{:psHtml}}</div>' +
  '<div role="tabpanel" class="tab-pane {{if trs_active}}active{{else}}{{/if}}" id="dictionary">{{:trsHtml}}</div></div></div>';

export default tmpl;
