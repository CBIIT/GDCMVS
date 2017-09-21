import tmpl from './view';

const func = {
  render(items) {
 	//data preprocessing

	let values = [];
	items.forEach(function (item){
	  	let hl = item.highlight;
	  	let source = item._source;
	  	let dict_enum_n = {};
		let dict_enum_s = {};
		let dict_cde_s = {};
		//each row in the values tab will be put into values
		let row = {};
		row.category = source.category;
		row.node =  source.node;
		row.name = source.name;
		row.local = source.enum == undefined ? false : true;
		row.syn = false;
		if(source.enum !== undefined){
			//check if synonyms exists
			source.enum.forEach(function(em){
				if(row.syn) return;

				if(em.n_c !== undefined){
					row.syn = true;
				}
			});	
		}
		row.ref = source.name +"@" +source.node +"@" + source.category;
		row.cdeId = source.cde_id !== undefined ? source.cde_id : "";
		row.cdeLen = source.cde_pv == undefined || source.cde_pv.length == 0 ? false : true;
		//value informations in the subtable
		row.vs = [];
	  	let enum_n = ("enum.n" in hl) || ("enum.n.have" in hl) ? hl["enum.n"] || hl["enum.n.have"] : [];
		let enum_s = ("enum.s" in hl) || ("enum.s.have" in hl) ? hl['enum.s'] || hl["enum.s.have"] : [];
		let cde_s = ("cde_pv.ss.s" in hl) || ("cde_pv.ss.s.have" in hl) ? hl["cde_pv.ss.s"] || hl["cde_pv.ss.s.have"] : [];
		enum_n.forEach(function(n){
			let tmp = n.replace(/<b>/g,"").replace(/<\/b>/g, "");
			dict_enum_n[tmp] = n;
		});
		enum_s.forEach(function(s){
			let tmp = s.replace(/<b>/g,"").replace(/<\/b>/g, "");
			dict_enum_s[tmp] = s;
		});
		cde_s.forEach(function(ps){
			let tmp = ps.replace(/<b>/g,"").replace(/<\/b>/g, "");
			dict_cde_s[tmp] = ps;
		});

		//check if there are any matches in the cde synonyms
		let matched_pv = {};
		if(source.cde_pv !== undefined && source.cde_pv.length > 0){
			source.cde_pv.forEach(function(pv){
				let exist = false;
				let tmp_ss = [];
				if(pv.ss !== undefined && pv.ss.length > 0){
					pv.ss.forEach(function(ss){
						let tmp_s = []
						ss.s.forEach(function(s){
							if(s in dict_cde_s){
								exist = true;
								tmp_s.push(dict_cde_s[s])
							}
							else{
								tmp_s.push(s);
							}
						});
						tmp_ss.push({c: ss.c, s: tmp_s});
					});
				}
				if(exist){
					matched_pv[pv.n.toLowerCase()] = tmp_ss;
				}
			});
		}
		
		if(source.enum){
			source.enum.forEach(function(em){
				//check if there are any matches in local synonyms
				let exist = false;
				let tmp_s = [];
				if(em.s){
					em.s.forEach(function(s){
						if(s in dict_enum_s){
							exist = true;
							tmp_s.push(dict_enum_s[s])
						}
						else{
							tmp_s.push(s);
						}
					});
				}
				//value to be put into the subtable
				let v = {};
				if(exist){
					//check if there is a match with the value name
					if(em.n in dict_enum_n){
						v.n = dict_enum_n[em.n];
					}
					else{
						v.n = em.n;
					}
					v.ref = row.ref;
					v.n_c = em.n_c;
					v.s = tmp_s;
				}
				else{
					if(em.n in dict_enum_n){
						v.n = dict_enum_n[em.n];
						v.ref = row.ref;
						v.n_c = em.n_c;
						v.s = em.s;
					}
					
				}
				//check if there are any matched cde_pvs can connect to this value
				if(v.n !== undefined){
					let lc = em.n.toLowerCase();
					if(lc in matched_pv){
						v.cde_s = matched_pv[lc];
						delete matched_pv[lc];
					}
					else{
						v.cde_s = [];
					}
					row.vs.push(v);
				}
				
			});
		}

		//add the rest of the matched cde_pvs to the subtables
		for(let idx in matched_pv){
			let v = {};
			v.n = "See All Values";
			v.ref = row.ref;
			v.n_c = "";
			v.s = [];
			v.cde_s = matched_pv[idx];
			row.vs.push(v);
		}

		values.push(row);
	});
	console.log(values);
    let html = $.templates(tmpl).render({values: values});

    return html;

  }
};

export default func;