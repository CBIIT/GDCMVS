import vsRender from './values-table/view';
import navTabs from './tabs'

export default function render(keyword, option, items){
  let vsHtml = vsRender(items);
  let html = navTabs();
  $("#root").html(html);
}
