import vs from './values-table/';
import navTabs from './tabs'

export default function render(keyword, option, items){
  let vsHtml = vs.render(items);
  let html = navTabs();
  $("#root").html(html);
}
