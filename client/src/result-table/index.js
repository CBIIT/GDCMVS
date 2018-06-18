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

    //category row
    let c = {};
    //node row
    let n = {};
    //final result
    let result = {};
    result.len = 0;

 	items.forEach(function(item){
 		let hl = item.highlight;
        let source = item._source;
        let enum_s = ("enum.s" in hl) || ("enum.s.have" in hl) ? hl['enum.s'] || hl["enum.s.have"] : [];
        let enum_n = ("enum.n" in hl) || ("enum.n.have" in hl) ? hl["enum.n"] || hl["enum.n.have"] : [];
        let cde_n = ("cde_pv.n" in hl) || ("cde_pv.n.have" in hl) ? hl["cde_pv.n"] || hl["cde_pv.n.have"] : [];
        let cde_s = ("cde_pv.ss.s" in hl) || ("cde_pv.ss.s.have" in hl) ? hl["cde_pv.ss.s"] || hl["cde_pv.ss.s.have"] : [];
        let arr_enum_s = [];
        let arr_enum_n = [];
        let arr_cde_n = [];
        let arr_cde_s = [];
        let matched_pv = [];
        enum_s.forEach(function(s){
            let tmp = s.replace(/<b>/g,"").replace(/<\/b>/g, "");
            arr_enum_s.push(tmp);
        });
        enum_n.forEach(function(n){
            let tmp = n.replace(/<b>/g,"").replace(/<\/b>/g, "");
            arr_enum_n.push(tmp);
        });
        cde_n.forEach(function(pn){
            let tmp = pn.replace(/<b>/g,"").replace(/<\/b>/g, "");
            arr_cde_n.push(tmp);
        });
        cde_s.forEach(function(ps){
            let tmp = ps.replace(/<b>/g,"").replace(/<\/b>/g, "");
            arr_cde_s.push(tmp);
        });

 		if(source.cde_pv !== undefined && source.cde_pv.length > 0){
            source.cde_pv.forEach(function(pv){
                let exist = false;
                if(pv.ss !== undefined && pv.ss.length > 0){
                    pv.ss.forEach(function(ss){
                        ss.s.forEach(function(s){
                            if(arr_cde_s.indexOf(s) !== -1) {
                                exist = true;
                            }
                        })
                    });
                }
                exist = exist || (arr_cde_n.indexOf(pv.n) >= 0);
                if(exist){
                    matched_pv.push(pv.n.toLowerCase());
                }
            });
        }

 		if(source.category != c_c){
 			//put category to tree table
            count++;
 			c_c = source.category;
	        c = {};
	        c.id = c_c;
	        c.title = c_c;
	        c.desc = "";
	        c.data_tt_id = count + "_" +c.id;
	        c.data_tt_parent_id = "--";
	        c.type = "category";
	        c.node = "branch";
            c.exist = true;
            c.len = 0;
	        trs.push(c);
 		}
 		if(source.node != c_n){
 			//put node to tree table
            count++;
 			c_n = source.node;
 			n = {};
 			//link id
 			n.l_id = source.node;
            n.id = source.node;
            n.title = source.n_title;
            n.desc = source.n_desc;
            n.data_tt_id = count + "_" + n.id;
            n.data_tt_parent_id = c.data_tt_id;
            n.type = "folder";
            n.node = "branch";
            n.exist = true;
            n.len = 0;
            trs.push(n);
 		}
 		//put property to tree table
 		let p = {};
        //calculate if property itself got matched;
        let count_p = 0;
        //calculate how many values got matched in this property;
        let count_v = 0;
        //calculate how many synonyms got matched in this property
        let count_s = 0;
 		count++;
 		p.id = count + "_" + source.name;
    //link id
    p.l_id = source.name;
    p.parent_l_id = n.l_id;
 		//may have highlighted terms in p.title and p.desc
        p.title = ("name" in hl) || ("name.have" in hl) ? (hl["name"] || hl["name.have"]) : source.name;
        p.desc = ("desc" in hl) ? hl["desc"] : source.desc;
 		p.data_tt_id = p.id;
        p.data_tt_parent_id = n.data_tt_id;
        p.type="property";
        p.exist = true;
        if(("name" in hl) || ("name.have" in hl) || ("desc" in hl)){
            count_p = 1;
        }
        //put value to tree table
        if(source.enum != undefined){
            if(enum_n.length == 0 && enum_s.length == 0 && matched_pv.length == 0){
                //if no values show in the values tab
                p.node = "";
                trs.push(p);
            }
            else{
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
                let tmp_trs = [];
                values.forEach(function(v){
                    count++;
                    let e = {};
                    e.id = count + "_"+ v.n;
                    e.exist = false;

                    let idx = matched_pv.indexOf(v.n.toLowerCase());
                    if( idx !== -1){
                        count_s --;
                        e.exist = true;
                    }
                    else{
                        if(arr_enum_n.indexOf(v.n) !== -1) {
                            e.exist = true;
                        }

                        if(v.s !== undefined && e.exist != true){
                            v.s.forEach(function(syn){
                                if(arr_enum_s.indexOf(syn) !== -1) {
                                    e.exist = true;
                                }
                            });
                        }
                    }

                    if(e.exist){
                        count_v ++;
                    }
                    //may be highlighted
                    e.title = (v.n in enums) ? enums[v.n] : v.n;
                    e.desc = "";
                    e.data_tt_id = e.id;
                    e.data_tt_parent_id = p.id;
                    e.type = "value";
                    e.node = "leaf";
                    tmp_trs.push(e);

                });
                if(count_v == 0){
                    p.node = "";
                }
                else{
                    tmp_trs.forEach(function(tt){
                        trs.push(tt);
                    });
                }

                count_s += matched_pv.length;
            }
        }
        else{
            if(matched_pv.length > 0){
                //matched on cde
                p.node = "branch";
                trs.push(p);
                //show caDSR reference
                count++;
                let l = {};
                l.id = count + "_l";
                l.l_id = source.cde.id;
                l.l_type = "cde";
                l.url = source.cde.url;
                l.desc = "";
                l.data_tt_id = l.id;
                l.data_tt_parent_id = p.id;
                l.type = "link";
                l.node = "leaf";
                trs.push(l);

                count_s = matched_pv.length;
            }
            else{
                //matched on property name or description
                p.node = "";
                trs.push(p);
            }
        }

        //save and calculate the count of matched element in this property
        p.len = count_v + count_s;
        c.len += p.len + count_p;
        n.len += p.len + count_p;
        result.len += p.len + count_p;
     });
     
     let newtrs = [
        {title: "administrative", type: "category", desc:"", len: 3, children: [
           {title: "Case", type: "folder", desc:"The collection of all data related to a specific subject in the context of a specific project.", len: 3, children: [
               {title: "disease_type", type: "property", desc:"The text term used to describe the type of malignant disease, as categorized by the World Health Organization's (WHO) International Classification of Diseases for Oncology (ICD-O).", len: 3, children: [
                   {title: "Blood Vessel Tumors", type: "value"},
                   {title: "Leukemias, NOS", type: "value"}
               ]},
               {title: "primary_site", type: "property", desc:"The text term used to describe the general location of the malignant disease, as categorized by the World Health Organization's (WHO) International Classification of Diseases for Oncology (ICD-O).", len: 1, children: [
                   {title: "Blood", type: "value"}
               ]}
           ]}
        ]},
        {title: "biospecimen", type: "category", desc:"", len: 17, children: [
           {title: "Sample", type: "folder", desc:"Any material sample taken from a biological entity for testing, diagnostic, propagation, treatment or research purposes, including a sample obtained from a living organism or taken from the biological object after halting of all its life functions. Biospecimen can contain one or more components including but not limited to cellular molecules, cells, tissues, organs, body fluids, embryos, and body excretory products.", len: 17, children: [
               {title: "composition", type: "property", desc:"Text term that represents the cellular composition of the sample.", len: 2, children: [
                   {title: "Peripheral Blood Components NOS", type: "value"},
                   {title: "Peripheral Whole Blood", type: "value"}
               ]},
               {title: "sample_type", type: "property", desc:"Text term to describe the source of a biospecimen used for a laboratory test.", len: 11, children: [
                   {title: "Blood Derived Cancer - Bone Marrow, Post-treatment", type: "value"},
                   {title: "Blood Derived Cancer - Peripheral Blood, Post-treatment", type: "value"},
                   {title: "Blood Derived Normal", type: "value"},
                   {title: "Primary Blood Derived Cancer - Peripheral Blood", type: "value"},
                   {title: "Recurrent Blood Derived Cancer - Peripheral Blood", type: "value"}
               ]},
               {title: "sample_type", type: "property", desc:"Text term to describe the source of a biospecimen used for a laboratory test.", len: 0, children: []}
           ]}
        ]},
    ]

 	let offset = $('#root').offset().top;
    let h = window.innerHeight - offset - 305;
    h = (h < 430) ? 430 : h;
    let html = $.templates(tmpl).render({mh: h,trs: trs, newtrs: newtrs});

    result.html = html;
    return result;

  }
};

export default func;
