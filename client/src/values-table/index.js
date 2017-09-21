import tmpl from './view';

const func = {
  render(items) {
 	//data preprocessing

	let values = [];
	items.forEach(function (item){
	  	let hl = item.highlight;
	  	let source = item._source;
	  	let dict_enum_n = {};
		let dict_enum_s ={};
		let value = {};
		value._id = item._id;
		value.category = source.category;
		value.node =  source.node;
		value.name = source.name;
	  	if(("enum.n" in hl || "enum.n.have" in hl || "enum.s" in hl || "enum.s.have" in hl || "cde_pv.ss.s" in hl )){
			let enum_n = ("enum.n" in hl) || ("enum.n.have" in hl) ? hl["enum.n"] || hl["enum.n.have"] : [];
			let enum_s = ("enum.s" in hl) || ("enum.s.have" in hl) ? hl['enum.s'] || hl["enum.s.have"] : [];
			let cde_pv_s = ("cde_pv.ss.s" in hl) ? hl['cde_pv.ss.s'] : 'No Value';
			enum_n.forEach(function(n){
				let tmp = n.replace(/<b>/g,"").replace(/<\/b>/g, "");
				dict_enum_n[tmp] = n;
			});
			enum_s.forEach(function(s){
				let tmp = s.replace(/<b>/g,"").replace(/<\/b>/g, "");
				dict_enum_s[tmp] = s;
			});
		}
		value.vs = [];

		if(source.enum){

			source.enum.forEach(function(em){
				//check if em.n exists in the dict_enum_n
				let vs = {}
				if(em.n in dict_enum_n){

					vs.n = dict_enum_n[em.n];
					vs.n_c = em.n_c;
					vs.syn = true;
					vs.s = [];

					if(em.s){
						
						em.s.forEach(function(s){
							if(s in dict_enum_s){
								vs.s.push(dict_enum_s[s])
							}
							else{
								vs.s.push(s);
							}
						});				
					}

					value.vs.push(vs);

				}
				else{
					if(em.s){
						let tmp = [];
						let exist = false;
						em.s.forEach(function(s){
							if(s in dict_enum_s){
								exist = true;
								tmp.push(dict_enum_s[s]);
							}
							else{
								tmp.push(s);
							}
						});
						if(exist){
							value.vs.push({n:em.n, n_c: em.n_c, syn: true,s:tmp});
						}					
					}
				}

			});
		}

		values.push(value);

		
	});
	console.log(values);

    let html = $.templates(tmpl).render({values: values});

    return html;

  }
};

export default func;