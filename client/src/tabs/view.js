let tmpl = '<div><ul class="nav nav-tabs" role="tablist">' +
      '<li role="presentation" class="active"><a href="#trsTab" aria-controls="trsTab" role="tab" data-toggle="tab">Search Results</a></li>' +
      '<li role="presentation"><a href="#psTab" aria-controls="psTab" role="tab" data-toggle="tab">Properties ({{:ps_len}})</a></li>' +
      '<li role="presentation"><a href="#vsTab" aria-controls="vsTab" role="tab" data-toggle="tab">Values ({{:vs_len}})</a></li></ul>' +
      '<div class="tab-content"><div role="tabpanel" class="tab-pane active" id="trsTab">{{:trsHtml}}</div>' +
      '<div role="tabpanel" class="tab-pane" id="psTab">{{:psHtml}}</div>' +
      '<div role="tabpanel" class="tab-pane" id="vsTab">{{:vsHtml}}</div></div></div>';

export default tmpl;