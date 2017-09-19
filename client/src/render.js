import trs from './result-table/';
import ps from './props-table/';
import vs from './values-table/';
import tabs from './tabs/'

export default function render(keyword, option, items){
  let html = "";
  if(items.length !== 0){
  	let trsHtml = trs.render(items);
	let psHtml = ps.render(items);
	let vsHtml = vs.render(items);
	html = tabs(trsHtml, psHtml, vsHtml);
  }
  else{
  	html = '<div class="info">No result found for keyword: '+keyword+'</div>';
  }
  
  $("#root").html(html);
}
