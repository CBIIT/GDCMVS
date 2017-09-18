import vsRender from './values-table/view';

export default function render(keyword, option, items){
  let html = vsRender(items);
  $("#root").html(html);
}
