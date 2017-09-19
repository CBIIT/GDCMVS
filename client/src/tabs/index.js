export default function (trsRender, psRender, vsRender) {

  let tmpl = '<div><ul class="nav nav-tabs" role="tablist">' +
      '<li role="presentation" class="active"><a href="#trsTab" aria-controls="trsTab" role="tab" data-toggle="tab">Search Results</a></li>' +
      '<li role="presentation"><a href="#psTab" aria-controls="psTab" role="tab" data-toggle="tab">Properties</a></li>' +
      '<li role="presentation"><a href="#vsTab" aria-controls="vsTab" role="tab" data-toggle="tab">Values</a></li></ul>' +
      '<div class="tab-content"><div role="tabpanel" class="tab-pane active" id="trsTab"><p>tbs results</p></div>' +
      '<div role="tabpanel" class="tab-pane" id="psTab"><p>ps results</p></div>' +
      '<div role="tabpanel" class="tab-pane" id="vsTab"><p>vs results</p></div></div></div>';

  let html = $.templates(tmpl).render();

  return html;
}
