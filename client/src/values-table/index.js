import tmpl from './view';

const func = {
  render(items) {
 	//data preprocessing

	let values = [];
	let len = 0;
	items.forEach(function (item){
	  	let hl = item.highlight;
	  	if(hl["enum.n"] == undefined && hl["enum.n.have"] == undefined && hl["enum.s"] == undefined && hl["enum.s.have"] == undefined 
	  		&& hl["cde_pv.n"] == undefined && hl["cde_pv.n.have"] == undefined 
	  		&& hl["cde_pv.ss.s"] == undefined && hl["cde_pv.ss.s.have"] == undefined 
	  		&& hl["enum.i_c.c"] == undefined && hl["enum.i_c.have"] == undefined){
	  		return;
		}
	  	let source = item._source;
	  	let dict_enum_n = {};
		let dict_enum_s = {};
		let dict_cde_n = {};
		let dict_cde_s = {};
		let arr_enum_c = [];
		let arr_enum_c_have = [];
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
		row.cdeId = source.cde !== undefined ? source.cde.id : "";
		row.cdeUrl = source.cde !== undefined ? source.cde.url : "";
		row.cdeLen = source.cde_pv == undefined || source.cde_pv.length == 0 ? false : true;
		//value informations in the subtable
		row.vs = [];
		row.tgts_enum_n = ""; //added
		row.tgts_cde_n = "";
	  	let enum_n = ("enum.n" in hl) || ("enum.n.have" in hl) ? hl["enum.n"] || hl["enum.n.have"] : [];
		let enum_s = ("enum.s" in hl) || ("enum.s.have" in hl) ? hl['enum.s'] || hl["enum.s.have"] : [];
		let cde_n = ("cde_pv.n" in hl) || ("cde_pv.n.have" in hl) ? hl["cde_pv.n"] || hl["cde_pv.n.have"] : [];
		let cde_s = ("cde_pv.ss.s" in hl) || ("cde_pv.ss.s.have" in hl) ? hl["cde_pv.ss.s"] || hl["cde_pv.ss.s.have"] : [];
		let enum_c = ("enum.i_c.c" in hl) ? hl["enum.i_c.c"] : [];
		let enum_c_have = ("enum.i_c.have" in hl) ? hl["enum.i_c.have"] : [];
		enum_n.forEach(function(n){
			let tmp = n.replace(/<b>/g,"").replace(/<\/b>/g, "");
			dict_enum_n[tmp] = n;
		});
		enum_s.forEach(function(s){
			let tmp = s.replace(/<b>/g,"").replace(/<\/b>/g, "");
			dict_enum_s[tmp] = s;
		});
		cde_n.forEach(function(pn){
			let tmp = pn.replace(/<b>/g,"").replace(/<\/b>/g, "");
			dict_cde_n[tmp] = pn;
		});
		cde_s.forEach(function(ps){
			let tmp = ps.replace(/<b>/g,"").replace(/<\/b>/g, "");
			dict_cde_s[tmp] = ps;
		});
		enum_c.forEach(function(c){
			let tmp = c.replace(/<b>/g,"").replace(/<\/b>/g, "");
			if(arr_enum_c.indexOf(tmp) == -1){
				arr_enum_c.push(tmp);
			}
		});
		enum_c_have.forEach(function(ch){
			let tmp = ch.replace(/<b>/g,"").replace(/<\/b>/g, "");
			if(arr_enum_c_have.indexOf(tmp) == -1){
				arr_enum_c_have.push(tmp);
			}
		});

		//check if there are any matches in the cde synonyms
		let matched_pv = {};
		if(source.cde_pv !== undefined && source.cde_pv.length > 0){
			source.cde_pv.forEach(function(pv){
				let exist = false;
				let tmp_ss = [];
				if(pv.ss !== undefined && pv.ss.length > 0){
					pv.ss.forEach(function(ss){
						let tmp_s = [];
						let tmp_s_h = [];   
		                //remove duplicate
		                let cache = {};
						ss.s.forEach(function(s){
							let lc = s.trim().toLowerCase();
	                        if(!(lc in cache)){
	                            cache[lc] = [];
	                        }
	                        cache[lc].push(s);
						});
						for(let idx in cache){
	                        //find the term with the first character capitalized
	                        let word = findWord(cache[idx]);
	                        tmp_s.push(word);
	                    }
	                    tmp_s.forEach(function(s){
	                    	if(s in dict_cde_s){
								exist = true;
								tmp_s_h.push(dict_cde_s[s]);
							}
							else{
								tmp_s_h.push(s);
							}
	                    });
						tmp_ss.push({c: ss.c, s: tmp_s_h});
					});
				}
				exist = exist || (pv.n in dict_cde_n);
				if(exist){
					//matched_pv[pv.n.toLowerCase()] = tmp_ss;
					matched_pv[pv.n.toLowerCase()] = {"pv":(pv.n in dict_cde_n ? dict_cde_n[pv.n] : pv.n),"pvm":pv.m,"ss":tmp_ss};
					pv.n = pv.n.replace(/\'/g, '^');
					row.tgts_cde_n += pv.n + "#";
				}
			});
		}
		
		if(source.enum){
			source.enum.forEach(function(em){
				//check if there are any matches in local synonyms
				let exist = false;
				let tmp_s = [];
				let t_s = [];
				if(em.s){
					//remove depulicates in local synonyms
					let cache = {};
					em.s.forEach(function(s){
						let lc = s.trim().toLowerCase();
                        if(!(lc in cache)){
                            cache[lc] = [];
                        }
                        cache[lc].push(s);
					});
					for(let idx in cache){
                        //find the term with the first character capitalized
                        let word = findWord(cache[idx]);
                        t_s.push(word);
                    }
					t_s.forEach(function(s){
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
					//check if there is a match to the value name
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
						//v.s = em.s;
						v.s = tmp_s;
					}
					
				}

				//check if it contains icd-0-3 codes.
				if(em.i_c !== undefined){
					if(arr_enum_c.indexOf(em.i_c.c) >= 0){
						v.i_c = "<b>"+em.i_c.c+"</b>";
						if(v.n == undefined){
							v.n = em.n;
							v.ref = row.ref;
							v.n_c = em.n_c;
							//v.s = em.s;
							v.s = tmp_s;
						}
					}
					else{
						let has = false;
						em.i_c.have.forEach(function(ch){
							if(has) return;
							if(arr_enum_c_have.indexOf(ch) >= 0){
								has = true;
							}
						});
						if(has){
							v.i_c = "<b>"+em.i_c.c+"</b>";
							if(v.n == undefined){
								v.n = em.n;
								v.ref = row.ref;
								v.n_c = em.n_c;
								//v.s = em.s;
								v.s = tmp_s;
							}
						}
						else{
							v.i_c = em.i_c.c;
						}
					}

				}

				if(v.n !== undefined){
					let tmp = v.n.replace(/<b>/g,"").replace(/<\/b>/g, "");
					row.tgts_enum_n += tmp + "#";
				}

				let lc = em.n.toLowerCase();
				if(lc in matched_pv){
					if(v.n == undefined){
						v.n = em.n;
						v.ref = row.ref;
						v.n_c = em.n_c;
						//v.s = em.s;
						v.s = tmp_s;
					}
					
					v.cde_s = matched_pv[lc].ss;
					if(v.cde_s.length){
						v.cde_pv = matched_pv[lc].pv;
						v.cde_pvm = matched_pv[lc].pvm;
					}
					delete matched_pv[lc];

				}
				else{
					v.cde_s = [];
				}

				if(v.n !== undefined){
					row.vs.push(v);
				}
				
			});
		}

		//add the rest of the matched cde_pvs to the subtables
		for(let idx in matched_pv){
			let v = {};
			v.n = "no match";
			v.ref = row.ref;
			v.n_c = "";
			v.s = [];
			v.cde_s = matched_pv[idx].ss;
			if(v.cde_s.length){
				v.cde_pv = matched_pv[idx].pv;
				v.cde_pvm = matched_pv[idx].pvm;
			}
			row.vs.push(v);
		}
		len += row.vs.length;
		values.push(row);
	});
	let html = "";
	if(values.length == 0){
 		let keyword = $("#keywords").val();
 		html = '<div class="info">No result found for keyword: '+keyword+'</div>';
 	}
 	else{
 		let offset = $('#root').offset().top;
 		let h = window.innerHeight - offset - 240;
 		h = (h < 550) ? 550 : h;
 		html = $.templates({markup: tmpl, allowCode: true}).render({mh:h, values:values});
 	}
    let result = {};
    result.len = len;
    result.html = html;
    return result;

  }
};

export default func;