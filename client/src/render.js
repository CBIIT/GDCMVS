import trs from './result-table/';
import ps from './props-table/';
import vs from './values-table/';
import tabs from './tabs/'

export default function render(keyword, option, items){
  let trsHtml = trs.render();
  let psHtml = ps.render();
  let vsHtml = vs.render(items);
  let html = tabs(trsHtml, psHtml, vsHtml);
  $("#root").html(html);
}
