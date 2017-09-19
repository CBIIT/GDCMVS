import tmpl from './view';

const func = {
  render(items) {
 	//data preprocessing
 	let props = [];
 	items.forEach(function(item){
 		let hl = item.highlight;
 		let source = item._source;
 		if(("name" in hl) || ("desc") in hl){
 			let prop = {};
 			prop.nm = ("name" in hl) ? hl["name"] : source.name;
 			prop.nd = source.node;
 			prop.ct = source.category;
 			prop.desc = ("desc" in hl) ? hl["desc"] : source.desc;
 			prop.ref = source.name;
 			prop.cdeId = source.cde_id == undefined ? "" : source.cde_id;
 			props.push(prop);
 		}
 	});
    let html = $.templates(tmpl).render({props: props});

    return html;

  }
};

export default func;