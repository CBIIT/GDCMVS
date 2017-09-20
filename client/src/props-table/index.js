import tmpl from './view';

const func = {
  render(items) {
 	//data preprocessing
 	let props = [];
 	items.forEach(function(item){
 		let hl = item.highlight;
 		let source = item._source;
 		if(("name" in hl) || ("name.have" in hl) || ("desc" in hl)){
 			let prop = {};
 			prop.nm = ("name" in hl) || ("name.have" in hl) ? (hl["name"] || hl["name.have"]) : source.name;
 			prop.nd = source.node;
 			prop.ct = source.category;
 			prop.desc = ("desc" in hl) ? hl["desc"] : source.desc;
 			prop.ref = source.name;
 			prop.cdeId = source.cde_id == undefined ? "" : source.cde_id;
 			props.push(prop);
 		}
 	});
 	let html = "";
 	if(props.length == 0){
 		let keyword = $("#keywords").val();
 		html = '<div class="info">No result found for keyword: '+keyword+'</div>';
 	}
 	else{
 		html = $.templates(tmpl).render({props: props});
 	}
    
    return html;

  }
};

export default func;