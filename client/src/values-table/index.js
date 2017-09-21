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

					vs["n"] = dict_enum_n[em.n];
					vs["n_c"] = em.n_c;

					vs["s"] = [];
					em.s.forEach(function(s){
						if(s in dict_enum_s){
							vs["s"].push(dict_enum_s[s])
							//value.vs.push({n:em.n, n_c: em.n_c ,s: em.s});
						}
						else{
							vs["s"].push(s);
						}
					});				
					//check if there are any matches in the synonyms
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
								// value.vs.push({n:em.n, n_c: em.n_c ,s: em.s});
								// break
							}
							else{
								tmp.push(s);
							}
						});
						if(exist){
							value.vs.push({n:em.n, n_c: em.n_c ,s:tmp});
						}					
					}

					
					//ceck synonyms
				}

			});
		}

		// for (var key_enum_n in dict_enum_n) {
		//     // skip loop if the property is from prototype
		//     if (!dict_enum_n.hasOwnProperty(key_enum_n)) continue;
		//     //let nm = [];

		// 	if(source.enum){
		// 		source.enum.forEach(function(e){
		// 			if(e.n == key_enum_n){
		// 				//nm['nm'] = dict_enum_n[key_enum_n];
		// 				value.nm.push({n:dict_enum_n[key_enum_n], n_c: e.n_c ,s: e.s});
		// 			}//else{

		// 			// 	for(var key_enum_s in dict_enum_s)
		// 			// 		e.s.forEach(function(s){
		// 			// 			if(s = key_enum_s){
		// 			// 				nm[''] = e.s
		// 			// 			}
		// 			// 		})
		// 			// }
		// 			// nm['n'] = dict_enum_n[key_enum_n];
		// 			// nm['s'] = [];

		// 			// for(var key_enum_s in dict_enum_s){
		// 			// 	e.s.forEach(function(s){
		// 			// 		if(e.n == key_enum_n){
		// 			// 			nm['n'] = dict_enum_n[key_enum_n];

		// 			// 			if()

		// 			// 			nm['s'].push(e)

		// 			// 		}

		// 			// 	});
		// 			// }
		// 		});
		// 	}
		// }


		// for (var key_enum_s in dict_enum_s) {
		//     // skip loop if the property is from prototype
		//     if (!dict_enum_s.hasOwnProperty(key_enum_s)) continue;

		// 	if(source.enum){
		// 		source.enum.forEach(function(e){
		// 			e.s.forEach(function(s){
		// 				if(s == key_enum_s){
		// 					console.log(s);
		// 				}
		// 			});
					
		// 		});
		// 	}
		// }

		values.push(value);

		
	});
	console.log(values);

    let html = $.templates(tmpl).render({values: values});

    return html;

  }
};

export default func;