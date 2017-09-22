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
 			prop.local = source.enum == undefined ? false : true;
 			prop.syn = false;
 			if(source.enum !== undefined){
 				//check if synonyms exists
 				source.enum.forEach(function(em){
 					if(prop.syn) return;

 					if(em.n_c !== undefined){
 						prop.syn = true;
 					}
 				});	
 			}
 			prop.ref = source.name +"@" +source.node +"@" + source.category;
 			prop.cdeId = source.cde_id !== undefined ? source.cde_id : "";
 			prop.cdeLen = source.cde_pv == undefined || source.cde_pv.length == 0 ? false : true;
 			props.push(prop);
 		}
 	});
 	let html = "";
 	if(props.length == 0){
 		let keyword = $("#keywords").val();
 		html = '<div class="info">No result found for keyword: '+keyword+'</div>';
 	}
 	else{
 		let offset = $('#root').offset().top;
 		let h = window.innerHeight - offset - 110;

 		html = $.templates(tmpl).render({mh:h,props: props});
 	}
 	
    let result = {};
    result.len = props.length;
    result.html = html;
    return result;
    
  }
};

export default func;