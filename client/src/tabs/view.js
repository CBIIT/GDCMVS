// let tmpl = '<div><ul class="nav nav-tabs" role="tablist">' +
//       '<li role="presentation" class="{{if vs_active}}active{{else}}{{/if}}"><a href="#vsTab" aria-controls="vsTab" role="tab" data-toggle="tab">Values ({{:vs_len}})</a></li>' +
//       '<li role="presentation" class="{{if ps_active}}active{{else}}{{/if}}"><a href="#psTab" aria-controls="psTab" role="tab" data-toggle="tab">Properties ({{:ps_len}})</a></li>' +
//       '<li role="presentation" class="{{if trs_active}}active{{else}}{{/if}}"><a href="#trsTab" aria-controls="trsTab" role="tab" data-toggle="tab">Summary ({{:trs_len}})</a></li></ul>' +
//       '<div class="tab-content"><div role="tabpanel" class="tab-pane {{if vs_active}}active{{else}}{{/if}}" id="vsTab">{{:vsHtml}}</div>' +
//       '<div role="tabpanel" class="tab-pane {{if ps_active}}active{{else}}{{/if}}" id="psTab">{{:psHtml}}</div>' +
//       '<div role="tabpanel" class="tab-pane {{if trs_active}}active{{else}}{{/if}}" id="trsTab">{{:trsHtml}}</div></div></div>';

let tmpl = '<div class="results">' +
  '<div class="tab-nav">' +
    '<div class="tab-nav__text">Results for <span class="tab-nav__term">\'Abdomen\'</span> in:</div>' +
    '<div id="tab" class="btn-group tab-nav__group" data-toggle="buttons">' +
      '<a href="#values" class="btn tab-nav__btn {{if vs_active}}active{{else}}{{/if}}" data-toggle="tab">' +
        '<input type="radio" />Values' +
        '<span class="tab-nav__notification">{{:vs_len}}</span>' +
      '</a>' +
      '<a href="#properties" class="btn tab-nav__btn {{if ps_active}}active{{else}}{{/if}}" data-toggle="tab">' +
        '<input type="radio" />Properties' +
        '<span class="tab-nav__notification">{{:ps_len}}</span>' +
      '</a>' +
      '<a href="#dictionary" class="btn tab-nav__btn {{if trs_active}}active{{else}}{{/if}}" data-toggle="tab">' +
        '<input type="radio" />GDC Dictionary' +
        '<span class="tab-nav__notification">{{:trs_len}}</span>' +
      '</a>' +
  '</div></div>' +
  '<div class="tab-content"><div role="tabpanel" class="tab-pane {{if vs_active}}active{{else}}{{/if}}" id="values">{{:vsHtml}}</div>' +
  '<div role="tabpanel" class="tab-pane {{if ps_active}}active{{else}}{{/if}}" id="properties">{{:psHtml}}</div>' +
  '<div role="tabpanel" class="tab-pane {{if trs_active}}active{{else}}{{/if}}" id="dictionary">{{:trsHtml}}</div></div></div>';

              //     <div class="results">
              // <div class="tab-nav">
              //   <div class="tab-nav__text">Results for <span class="tab-nav__term">'Abdomen'</span> in:</div>
              //   <div id="tab" class="btn-group tab-nav__group" data-toggle="buttons">
              //     <a href="#values" class="btn tab-nav__btn active" data-toggle="tab">
              //       <input type="radio" />Values
              //     </a>
              //     <a href="#properties" class="btn tab-nav__btn" data-toggle="tab">
              //       <input type="radio" />Properties
              //       <span class="tab-nav__notification">7</span>
              //     </a>
              //     <a href="#dictionary" class="btn tab-nav__btn" data-toggle="tab">
              //       <input type="radio" />GDC Dictionary
              //       <span class="tab-nav__notification">49</span>
              //     </a>
              //   </div>
              // </div>
              // <div class="tab-content">

export default tmpl;
