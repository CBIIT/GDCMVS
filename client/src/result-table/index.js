import tmpl from './view';

const func = {
  render(items) {
 	//data preprocessing
 	//current category
 	let c_c = "";
 	//current node
 	let c_n = "";
 	//prefix for property and value id
 	let count = 0;
 	//data generated
 	let trs = [];
 	items.forEach(function(item){
 		let hl = item.highlight;
 		let source = item._source;
 		if(source.category != c_c){
 			//put category to tree table
 			c_c = source.category;
	        let c = {};
	        c.id = c_c;
	        c.title = c_c;
	        c.desc = "";
	        c.data_tt_id = c.id;
	        c.data_tt_parent_id = "--";
	        c.type = "category";
	        c.node = "branch";
	        trs.push(c);
 		}
 		if(source.node != c_n){
 			//put node to tree table
 			c_n = source.node;
 			let n = {};
 			//link id
 			n.l_id = source.node;
            n.id = source.node;
            n.title = source.n_title;
            n.desc = source.n_desc;
            n.data_tt_id = n.id;
            n.data_tt_parent_id = c_c;
            n.type = "folder";
            n.node = "branch";
            trs.push(n);
 		}
 		//put property to tree table
 		let p = {};
 		count++;
 		p.id = count + "_" + source.name;
 		//may have highlighted terms in p.title and p.desc
        p.title = ("name" in hl) || ("name.have" in hl) ? (hl["name"] || hl["name.have"]) : source.name;
        p.desc = ("desc" in hl) ? hl["desc"] : source.desc;
 		p.data_tt_id = p.id;
        p.data_tt_parent_id = c_n;
        p.type="property";
        //put value to tree table
        if(source.enum !== undefined){
        	p.node = "branch";
        	trs.push(p);
        	//show values, need to highlight if necessary
        	let list = [];
            if(("enum.n" in hl) || ("enum.n.have" in hl)){
                list = hl["enum.n"] || hl["enum.n.have"];
            }
            let enums = {};
            list.forEach(function(em){
                let e = em.replace(/<b>/g,"").replace(/<\/b>/g, "");
                enums[e] = em;
            });
            let values = source.enum;
            values.forEach(function(v){
            	count++;
            	let e = {}; 
            	e.id = count + "_"+ v.n;
            	//may be highlighted
            	e.title = (v.n in enums) ? enums[v.n] : v.n;
            	e.desc = "";
            	e.data_tt_id = e.id;
            	e.data_tt_parent_id = p.id;
            	e.type = "value";
            	e.node = "leaf";
            	trs.push(e);
            });
        }
        else if(source.cde_id !== undefined){
        	p.node = "branch";
        	trs.push(p);
        	//show caDSR reference
        	count++;
            let l = {};
            l.id = count + "_l";
            l.l_id = source.cde_id;
            l.l_type = "cde";
            l.desc = "";
            l.data_tt_id = l.id;
            l.data_tt_parent_id = p.id;
            l.type = "link";
            l.node = "leaf";
            trs.push(l);
        }
        else if(source.ncit !== undefined){
        	p.node = "branch";
        	trs.push(p);
        	//show NCIt reference
        	count++;
            let l = {};
            l.id = count + "_l";
            l.l_id = source.ncit;
            l.l_type = "ncit";
            l.desc = "";
            l.data_tt_id = l.id;
            l.data_tt_parent_id = p.id;
            l.type = "link";
            l.node = "leaf";
            trs.push(l);
        }
        else{
        	p.node = "leaf";
        	trs.push(p);
        }
 	});

    let html = $.templates(tmpl).render({mh:400,trs: trs});

    return html;

  }
};

export default func;