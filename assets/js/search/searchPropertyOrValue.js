var tab_idx = "results";
var displayBoxIndex = -1;

function collapseAll(){
    $("#type_table").find('a[title="Collapse"]').each(function(){
        $(this).trigger("click");
    });
}

function expandAll(){
    $("#type_table").find('a[title="Expand"]').each(function(){
        $(this).trigger("click");
    });
    $("#type_table").find('a[title="Expand"]').each(function(){
        $(this).trigger("click");
    });
    $("#type_table").find('a[title="Expand"]').each(function(){
        $(this).trigger("click");
    });
}

function render(keyword,option, items){
    let c = document.getElementById('container');
    c.innerHTML = "";
    if(items.length ===0){
        let d = document.createElement("div");
        d.className = "info";
        d.innerHTML = "No result found for keyword: "+keyword;
        c.appendChild(d);
    }
    else{
        //for hierarchical tab
        let trs = [];
        //for perperty tab
        let ps = [];
        //for value tab
        let vs = [];
        let count = 0;
        let words = (keyword.trim() === "" ? [] : keyword.split("#"));
        let result_words = [];
        let current_category = "--";
        items.forEach(function(it){
            let item = it.doc;
            if(item.category ==="TBD" || item.id ==="metaschema"){
                return;
            }
            //add category if it's a new one
            if(item.category !== current_category){
                current_category = item.category;
                let c = {};
                c.id = current_category;
                c.title = current_category;
                c.description = "";
                // c.category = "--";
                c["data-tt-id"] = c.id;
                c["data-tt-parent-id"] = "--";
                c.type = "category";
                c.node = "branch";
                trs.push(c);
            }
            count++;
            let entry = {};
            let hl = it.highlight;
            let targetType = (hl === undefined? hl : hl["links.target_type"]);
            let targetTypes = [];
            let target_propNames = [];
            let target_pairs = {};
            let hl_str = JSON.stringify(hl);
            if(hl_str !== undefined){
                hl_str = hl_str.toLowerCase();
            }
            let newWords = [];
            words.forEach(function(w){
                if(hl_str.indexOf("<b>"+w.trim()+"</b>") <0){
                    newWords.push(w.trim());
                }
                else{
                    result_words.push(w.trim());
                }
            });
            words = newWords;
            if(targetType !== undefined){
                targetType.forEach(function(tt){
                    targetTypes.push(tt.replace(/<b>/g,"").replace(/<\/b>/g, ""));
                });
            }

            let links = item.links;
            if(targetTypes.length > 0){
                links.forEach(function(l){
                    if(targetTypes.indexOf(l.target_type) >=0){
                        target_propNames.push(l.name);
                        target_pairs[l.name] = l.target_type;
                    }
                });
            }

            let propName = [];
            if(hl !== undefined && (hl["properties.name"] !== undefined || hl["properties.name.have"] !== undefined)){
                propName = hl["properties.name"] || hl["properties.name.have"];
            }
            let propNames = [];
            propName.forEach(function(pn){
                //propNames.push(pn.replace(/<b>/g,"").replace(/<\/b>/g, ""));
                let e = {};
                e.v = pn.replace(/<b>/g,"").replace(/<\/b>/g, "");
                e.o = pn;
                propNames.push(e);
            });
            let desc = (hl === undefined || hl["properties.description"] === undefined ? [] : hl["properties.description"]);
            let tDesc = (hl === undefined || hl["properties.term.description"] === undefined ? [] : hl["properties.term.description"]);
            desc = tDesc.concat(desc);
            let desc_tmp = [];
            desc.forEach(function(ds){
                let e = {};
                e.v = ds.replace(/<b>/g,"").replace(/<\/b>/g, "");
                e.l = e.v.length;
                e.o = ds;
                desc_tmp.push(e);
            });
            let syn = [];
            if(hl !== undefined && (hl["properties.syns.syn"] !== undefined || hl["properties.syns.syn.have"] !== undefined)){
                syn = hl["properties.syns.syn"] || hl["properties.syns.syn.have"];
            }
            let syns = {};
            syn.forEach(function(sn){
                //syns.push(sn.replace(/<b>/g,"").replace(/<\/b>/g, ""));
                let e = sn.replace(/<b>/g,"").replace(/<\/b>/g, "");
                e = e.trim().toLowerCase();
                syns[e] = sn;
            });
            let syn_ss = [];
            if(hl !== undefined && (hl["properties.syns.ss.syn"] !== undefined || hl["properties.syns.ss.syn.have"] !== undefined)){
                syn_ss = hl["properties.syns.ss.syn"] || hl["properties.syns.ss.syn.have"];
            }
            let syns_ss = {};
            syn_ss.forEach(function(ss){
                let tmp = ss.replace(/<b>/g,"").replace(/<\/b>/g, "");
                if(tmp in syns_ss){
                    return;
                }
                tmp = tmp.trim().toLowerCase();
                syns_ss[tmp] = ss;
            });
            let p_enum = [];
            if(hl !== undefined && (hl["properties.enum"] !== undefined || hl["properties.enum.have"] !== undefined)){
                p_enum = hl["properties.enum"] || hl["properties.enum.have"];
            }
            let enums = [];
            p_enum.forEach(function(em){
                //enums.push(em.replace(/<b>/g,"").replace(/<\/b>/g, ""));
                let e = em.replace(/<b>/g,"").replace(/<\/b>/g, "");
                enums[e] = em;
            });
            let p_enum_oneof = [];
            if(hl !== undefined && (hl["properties.oneOf.enum"] !== undefined || hl["properties.oneOf.enum.have"] !== undefined)){
                p_enum_oneof = hl["properties.oneOf.enum"] || hl["properties.oneOf.enum.have"];
            }
            let enums_oneof = [];
            p_enum_oneof.forEach(function(eo){
                //enums_oneof.push(eo.replace(/<b>/g,"").replace(/<\/b>/g, ""));
                let e = eo.replace(/<b>/g,"").replace(/<\/b>/g, "");
                enums_oneof[e] = eo;
            });
            entry.oid = item.id;
            entry.id = count + "_" + item.id;
            //highlight
            if(hl !== undefined && hl.id !== undefined){
                entry.title = "<b>"+item.title+"</b>";
            }
            else{
                entry.title = item.title;
            }
            if(hl !== undefined && hl.description != undefined){
                entry.description = hl.description;
            }
            else{
                entry.description = item.description;
            }
            // entry.category = item.category;
            entry["data-tt-id"] = entry.id;
            entry["data-tt-parent-id"] = current_category;
            entry.type = "folder";
            if(item.properties.length === 0){
                entry.node = "leaf";
                trs.push(entry);
            }
            else{
                let prop_count = 0;
                entry.node = "branch";
                trs.push(entry);
                item.properties.forEach(function(prop){
                    count++;
                    let p = {};
                    p.id = count + "_" + prop.name;
                    p.title = prop.name;
                    p.description = (prop.description === undefined ? ((prop.term !== undefined && prop.term.description !== undefined) ? prop.term.description : "--") : prop.description);
                    if(target_propNames.length > 0 && target_propNames.indexOf(p.title) >=0){
                        p.highlight = true;
                        p.showInResult = true;
                        p.showInProp = true;
                        p.description = "link to <b>"+ target_pairs[p.title] +"</b>";
                    }
                    else if(propNames.length > 0){
                        propNames.forEach(function(pn){
                            if(p.title === pn.v){
                                p.highlight = true;
                                p.showInResult = true;
                                p.showInProp = true;
                                return;
                            }
                        });
                    }

                    if(p.description !== "--" && desc_tmp.length !== 0){
                        desc_tmp.forEach(function(d){
                            if(d.l === p.description.length && d.v === p.description){
                                p.description = d.o;
                                p.highlight = p.highlight === undefined ? false : p.highlight;
                                p.showInResult = true;
                                p.showInProp = true;
                                delete desc_tmp[d];
                                return;
                            }
                        });
                    }

                    if(p.showInResult === undefined){
                        if(prop.enum !== undefined){
                            for(var es in enums){
                                if(prop.enum.indexOf(es) >=0){
                                    p.showInResult = true;
                                    p.showInProp = false;
                                    break;
                                }
                            }
                            // enums.forEach(function(es){
                            //     if(prop.enum.indexOf(es) >=0){
                            //         p.showInResult = true;
                            //         p.showInProp = false;
                            //         return;
                            //     }
                            // });
                        }
                        else if(prop.oneOf !== undefined && $.isArray(prop.oneOf)){
                            let all_values = [];
                            prop.oneOf.forEach(function(em){
                                if(em.enum !== undefined){
                                    all_values = all_values.concat(em.enum);
                                }
                            });
                            for(var es_o in enums_oneof){
                                if(all_values.indexOf(es_o) >=0){
                                    p.showInResult = true;
                                    p.showInProp = false;
                                    break;
                                }
                            }
                            // enums_oneof.forEach(function(es){
                            //     if(all_values.indexOf(es) >=0){
                            //         p.showInResult = true;
                            //         p.showInProp = false;
                            //         return;
                            //     }
                            // });
                        }
                    }

                    //check synonyms for each property
                    if(p.showInResult === undefined && (Object.keys(syns).length > 0 || Object.keys(syns_ss).length > 0) && prop.syns !== undefined){
                        let exist = false;
                        prop.syns.forEach(function(s){
                            if(s.syn !== undefined){
                                s.syn.forEach(function(t){
                                    let lc = t.trim().toLowerCase();
                                    if(lc in syns){
                                        exist = true;
                                    }
                                });
                            }
                            else if(s.ss !== undefined){
                                s.ss.forEach(function(r){
                                    r.syn.forEach(function(t){
                                        let lc = t.trim().toLowerCase();
                                        if(lc in syns_ss){
                                            exist = true;
                                        }
                                    });
                                });
                            }
                        });
                        if(exist){
                            p.showInResult = true;
                            p.highlight = true;
                        }
                    }
                    if(keyword.trim() !== "" && (p.showInResult === undefined || !p.showInResult)){
                        return;
                    }
                    let matchedValue = "--";
                    let values = [];
                    prop_count++;
                    // p.category = "--";
                    p["data-tt-id"] = p.id;
                    p["data-tt-parent-id"] = entry.id;
                    p.type="property";
                    //check synonyms
                    let matched_cde = {};
                    if(prop.syns !== undefined){
                        prop.syns.forEach(function(v){
                            if(v.syn !== undefined){
                                let syn_str = "<table style=\"font-size:inherit;\"><tbody><tr class=\"\"><td><a class=\"table-td-link\" href=\"https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code="+v.pvc+"\" target=\"_blank\">"+v.pvc+"</a></td><td class=\"td-split\">";
                                let have = false;
                                let cache = {};
                                v.syn.forEach(function(sn){
                                    let sn_lc = sn.trim().toLowerCase();
                                    if(!(sn_lc in cache)){
                                        cache[sn_lc] = [];
                                    }
                                    cache[sn_lc].push(sn);

                                });
                                let result = [];
                                for(let idx in cache){
                                    let word = findWord(cache[idx]);
                                    result.push(word);
                                }
                                result.forEach(function(sn){
                                    let sn_lc = sn.trim().toLowerCase();
                                    if(sn_lc in syns){
                                        syn_str +=  syns[sn_lc]+"#";
                                        have  = true;
                                    }
                                    else{
                                        syn_str +=  sn+"#";
                                    }

                                });

                                if(have){
                                    //add synonym to value tab
                                    syn_str = syn_str.substr(0, syn_str.length-1);
                                    syn_str += "</td></tr></tbody></table>";
                                    matched_cde[v.pv.toLowerCase()] = syn_str;
                                }
                            }
                            if(v.ss !== undefined && Object.keys(syns_ss).length > 0){
                                let syn_str = "<table style=\"font-size:inherit;\"><tbody>";
                                let ctt = "", count = 0, have = false;
                                v.ss.forEach(function(r){
                                    count++;
                                    if(count !== v.ss.length){
                                        ctt += "<tr class=\"data-table-row\"><td><a class=\"table-td-link\" href=\"https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code="+r.code+"\" target=\"_blank\">"+r.code+"</a></td><td class=\"td-split\">";
                                    }
                                    else{
                                        ctt += "<tr class=\"\"><td><a class=\"table-td-link\" href=\"https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code="+r.code+"\" target=\"_blank\">"+r.code+"</a></td><td class=\"td-split\">";
                                    }
                                    let cache = {};
                                    r.syn.forEach(function(sn){
                                        let sn_lc = sn.trim().toLowerCase();
                                        if(!(sn_lc in cache)){
                                            cache[sn_lc] = [];
                                        }
                                        cache[sn_lc].push(sn);

                                    });
                                    let result = [];
                                    for(let idx in cache){
                                        let word = findWord(cache[idx]);
                                        result.push(word);
                                    }
                                    result.forEach(function(sn){
                                        let sn_lc = sn.trim().toLowerCase();
                                        if(sn_lc in syns_ss){
                                            ctt +=  syns_ss[sn_lc]+"<br>";
                                            have  = true;
                                        }
                                        else{
                                            ctt +=  sn+"<br>";
                                        }

                                    });
                                    ctt = ctt.substr(0, ctt.length -4);
                                    ctt += "</td></tr>";
                                });
                                syn_str += ctt;
                                syn_str += "</tbody></table>";

                                if(have){
                                    //add synonym to value tab
                                    matched_cde[v.pv.toLowerCase()] = syn_str;
                                }
                            }
                        });
                    }
                    if(prop.enum !== undefined){
                        p.node = "branch";
                        trs.push(p);
                        prop.enum.forEach(function(em){
                            count++;
                            let e = {};
                            e.id = count + "_v";
                            e.title = em;
                            if(em in enums){
                                p.highlight = true;
                                e.highlight = true;
                                let tmp = {};
                                tmp.nm = enums[em];
                                // debugger;
                                if(prop.ref !== undefined){
                                    prop.ref.forEach(function(r){
                                        if(r.pv === em){
                                            tmp.cd = r.code;
                                        }
                                    });
                                }
                                tmp.pn = p.title;
                                tmp.category = item.category;
                                tmp.nd = item.id;
                                tmp.vs = prop.enum;
                                tmp.lk = (prop.term !== undefined && prop.term.termDef !== undefined)  ? (prop.term.termDef.source !== null ? prop.term.termDef.source : "--") : "--";
                                if(tmp.lk === 'caDSR'){
                                    tmp.uid = prop.term.termDef.cde_id;
                                    //external values if exists
                                    tmp.evs = prop.syns;
                                }
                                else if(tmp.lk !== '--'){
                                    tmp.uid = prop.term.termDef.term_url;
                                }
                                else{
                                    tmp.uid = "--";
                                }
                                if(matched_cde.length !== 0){
                                    if(matched_cde[em.toLowerCase()] !== undefined){
                                        tmp.syns = matched_cde[em.toLowerCase()];
                                        delete matched_cde[em.toLowerCase()];
                                    }
                                }
                                if(prop.name =='biospecimen_anatomic_site' || prop.name == 'new_event_anatomic_site' || prop.name == 'treatment_anatomic_site' || prop.name == 'primary_diagnosis'){
                                    tmp.list_syns = prop.syns;
                                }
                                vs.push(tmp);
                                // matchedValue = em;
                            }
                            e.description = "--";
                            // e.category = "--";
                            e["data-tt-id"] = e.id;
                            e["data-tt-parent-id"] = p.id;
                            e.type = "value";
                            e.node = "leaf";
                            trs.push(e);
                        });

                        values = prop.enum;
                    }
                    else if(prop.oneOf !== undefined && $.isArray(prop.oneOf)){
                        p.node = "branch";

                        let all_values = [];
                        prop.oneOf.forEach(function(em){
                            if(em.enum !== undefined){
                                all_values = all_values.concat(em.enum);
                            }
                        });
                        trs.push(p);
                        all_values.forEach(function(em){
                            count++;
                            let e = {};
                            e.id = count + "_v";
                            e.title = em;
                            if(em in enums_oneof){
                                p.highlight = true;
                                e.highlight = true;
                                let tmp = {};
                                tmp.nm = enums_oneof[em];
                                if(prop.ref !== undefined){
                                    prop.ref.forEach(function(r){
                                        if(r.pv === em){
                                            tmp.cd = r.code;
                                        }
                                    });
                                }
                                tmp.pn = p.title;
                                tmp.category = item.category;
                                tmp.nd = item.id;
                                tmp.vs = all_values;
                                tmp.lk = (prop.term !== undefined && prop.term.termDef !== undefined)  ? (prop.term.termDef.source !== null ? prop.term.termDef.source : "--") : "--";
                                if(tmp.lk === 'caDSR'){
                                    tmp.uid = prop.term.termDef.cde_id;
                                    //external values if exists
                                    tmp.evs = prop.syns;
                                }
                                else if(tmp.lk !== '--'){
                                    tmp.uid = prop.term.termDef.term_url;
                                }
                                else{
                                    tmp.uid = "--";
                                }
                                if(prop.name =='biospecimen_anatomic_site' || prop.name == 'new_event_anatomic_site' || prop.name == 'treatment_anatomic_site' || prop.name == 'primary_diagnosis'){
                                    tmp.list_syns = prop.syns;
                                }
                                vs.push(tmp);
                                // matchedValue = em;
                            }
                            e.description = "--";
                            // e.category = "--";
                            e["data-tt-id"] = e.id;
                            e["data-tt-parent-id"] = p.id;
                            e.type = "value";
                            e.node = "leaf";
                            trs.push(e);
                        });
                        values = all_values;
                    }
                    else if(prop.term !== undefined && prop.term.termDef !== undefined && prop.term.termDef.source !== null){
                        p.node = "branch";
                        trs.push(p);
                        count++;
                        let e = {};
                        e.id = count + "_l";

                        e["data-tt-id"] = e.id;
                        e["data-tt-parent-id"] = p.id;
                        e.type = "link";
                        e.lk = prop.term.termDef.source;
                        if(e.lk ==='caDSR'){
                            e.title = "No values in GDC, reference values in ";
                            e.uid = prop.term.termDef.cde_id;
                        }
                        else{
                            e.title = "No values in GDC, concept referenced in ";
                            e.uid = prop.term.termDef.term_url;
                        }

                        e.node = "leaf";
                        trs.push(e);
                    }
                    else{
                        p.node = "leaf";
                        trs.push(p);
                    }
                    //add to value list if some matched_cde left
                    if(matched_cde.length !== 0){
                        let ems = {};
                        if(prop.enum !== undefined){

                            prop.enum.forEach(function(em){
                                let tmp = em.toString();

                                ems[tmp.trim().toLowerCase()] = em;
                            });
                        }
                        for(var nm in matched_cde){
                            let tmp = {};
                            let t_n = nm.trim().toLowerCase();
                            tmp.nm = ems[t_n] !== undefined ? ems[t_n] :'--';
                            if(prop.ref !== undefined){
                                prop.ref.forEach(function(r){
                                    if(r.pv === nm){
                                        tmp.cd = r.code;
                                    }
                                });
                            }
                            tmp.vs = prop.enum === undefined ? [] : prop.enum;
                            tmp.pn = p.title;
                            tmp.category = item.category;
                            tmp.nd = item.id;

                            tmp.lk = (prop.term !== undefined && prop.term.termDef !== undefined)  ? (prop.term.termDef.source !== null ? prop.term.termDef.source : "--") : "--";
                            if(tmp.lk === 'caDSR'){
                                tmp.uid = prop.term.termDef.cde_id;
                                //external values if exists
                                tmp.evs = prop.syns;
                            }
                            else if(tmp.lk !== '--'){
                                tmp.uid = prop.term.termDef.term_url;
                            }
                            else{
                                tmp.uid = "--";
                            }
                            tmp.hl = false;
                            tmp.syns = matched_cde[nm];
                            if(prop.name =='biospecimen_anatomic_site' || prop.name == 'new_event_anatomic_site' || prop.name == 'treatment_anatomic_site' || prop.name == 'primary_diagnosis'){
                                tmp.list_syns = prop.syns;
                            }
                            vs.push(tmp);
                        }
                    }
                    //add to property list if must showInProp
                    if(p.showInProp){
                        let tmp = {};
                        tmp.nm = p.highlight ? "<b>"+ p.title +"</b>" : p.title;
                        tmp.desc = p.description;
                        tmp.category = item.category;
                        tmp.nd = item.id;
                        tmp.lk = (prop.term !== undefined && prop.term.termDef !== undefined)  ? (prop.term.termDef.source !== null ? prop.term.termDef.source : "--") : "--";
                        if(tmp.lk === 'caDSR'){
                            tmp.uid = prop.term.termDef.cde_id;
                            //external values if exists
                            tmp.evs = prop.syns;
                        }
                        else if(tmp.lk !== '--'){
                            tmp.uid = prop.term.termDef.term_url;
                        }
                        else{
                            tmp.uid = "--";
                        }
                        // tmp.mv = matchedValue;
                        tmp.vs = values;
                        if(prop.name =='biospecimen_anatomic_site' || prop.name == 'new_event_anatomic_site' || prop.name == 'treatment_anatomic_site' || prop.name == 'primary_diagnosis'){
                            tmp.list_syns = prop.syns;
                        }
                        ps.push(tmp);
                    }

                });
                if(prop_count === 0){
                    entry.node = "leaf";
                }
            }
        });

        //check if the result for any word is empty, if so, then give a message
        if(words.length > 0){
            let d = document.createElement("div");
            d.className = "info";
            d.innerHTML = "No result found for keyword: "+words.toString();
            c.appendChild(d);
        }
        let d = document.createElement("div");
        d.id="centeredmenu";
        let u = document.createElement("ul");
        u.id = "tabs";
        let l = document.createElement("li");
        let a = document.createElement("a");
        a.href="#";
        a.id = "results";
        if(tab_idx === "results"){
            a.className = "active";
        }
        a.innerHTML = "Search Results";
        l.appendChild(a);
        u.appendChild(l);
        l = document.createElement("li");
        a = document.createElement("a");
        a.href = "#";
        a.id = "props";
        if(tab_idx === "props"){
            a.className = "active";
        }
        a.innerHTML = "Properties" + " (<span class=\"tab-num\">" + ps.length + "</span>)";
        l.appendChild(a);
        u.appendChild(l);
        l = document.createElement("li");
        a = document.createElement("a");
        a.href="#";
        a.id = "values";
        if(tab_idx === "values"){
            a.className = "active";
        }
        a.innerHTML = "Values"+ " (<span class=\"tab-num\">" + vs.length + "</span>)";
        l.appendChild(a);
        u.appendChild(l);
        d.appendChild(u);
        c.appendChild(d);
        d = document.createElement("div");
        d.id = "table_results";
        if(tab_idx === "results"){
            d.style.display = "block";
        }
        else{
            d.style.display = "none";
        }
        let sp = document.createElement("span");
        sp.id = "collapse";
        sp.className = "btn btn-list";
        sp.innerHTML = "Collapse all";
        sp.addEventListener("click",collapseAll);
        d.appendChild(sp);
        sp = document.createElement("span");
        sp.id = "expand";
        sp.className = "btn btn-list";
        sp.innerHTML = "Expand all";
        sp.addEventListener("click",expandAll);
        d.appendChild(sp);
        let t = document.createElement("table");
        t.id="type_table";
        t.border = "0";
        t.cellPadding = "0";
        t.cellSpacing = "0";
        t.width = "100%";
        t.style.display = "table";
        t.className = "data-table treetable";
        let tb = document.createElement("tbody");
        t.appendChild(tb);
        let thb = document.createElement("thead");
        let th = document.createElement("tr");
        th.className = "data-table-head";
        tb.appendChild(th);
        let td = document.createElement("td");
        td.width = "20%";
        td.innerHTML = "Name";
        th.appendChild(td);
        td = document.createElement("td");
        td.width = "60%";
        td.innerHTML = "Description";
        th.appendChild(td);
        //search result
        trs.forEach(function(r){
            let tr = document.createElement("tr");
            tr.key = r.id;
            tr.className = "data-table-row " + r.node;

            tr.setAttribute("data-tt-id",r["data-tt-id"]);
            tr.setAttribute("data-tt-parent-id", r["data-tt-parent-id"]);
            let td = document.createElement("td");
            let span = document.createElement("span");
            span.className = r.type +"";
            if(r.highlight === undefined){
                span.className = r.type +"";
            }
            else{
                span.className = r.type +" row-highlight";
            }
            if(r.type === "folder"){
                let a = document.createElement("a");
                a.href = "https://docs.gdc.cancer.gov/Data_Dictionary/viewer/#?view=table-definition-view&id="+r.oid;
                a.target = "_blank";
                a.innerHTML = r.title;
                span.appendChild(a);
            }
            else{
                span.innerHTML = r.title;
            }
            td.appendChild(span);
            tr.appendChild(td);
            if(r.type ==="link"){
                td.colSpan = "2";
                if(r.lk ==='caDSR'){
                    span.innerHTML = r.title +"<a href=\"javascript:getExternalData('"+r.lk+"','"+r.uid+"');\" class=\"table-td-link\">"+r.lk+"</a>";
                }
                else{
                    span.innerHTML = r.title +"<a target=\"_blank\" href=\""+r.uid+"\" class=\"table-td-link\">"+r.lk+"</a>";
                }

            }
            else{
                td = document.createElement("td");
                td.innerHTML = r.description;
                tr.appendChild(td);
            }

            // td = document.createElement("td");
            // td.innerHTML = r.category;
            // tr.appendChild(td);
            tb.appendChild(tr);
        });
        d.appendChild(t)
        c.appendChild(d);
        d = document.createElement("div");
        d.id = "table_props";
        if(tab_idx === "props"){
            d.style.display = "block";
        }
        else{
            d.style.display = "none";
        }
        if(keyword.trim() === ""){
            // too much values, need to be narrow down
            let s = document.createElement("span");
            s.innerHTML = "Too much properties to display, please narrow it down."
            s.className = "info_1";
            d.appendChild(s);
            c.appendChild(d);
        }
        else if(ps.length === 0){
            //no property matched
            let s = document.createElement("span");
            s.innerHTML = "No result found for keyword: "+ result_words.toString();
            s.className = "info_1";
            d.appendChild(s);
            c.appendChild(d);
        }
        else{
            t = document.createElement("table");

            t.border = "0";
            t.cellPadding = "0";
            t.cellSpacing = "0";
            t.width = "100%";
            t.style.display = "table";
            t.className = "data-table treetable";
            tb = document.createElement("tbody");
            t.appendChild(tb);
            th = document.createElement("tr");
            th.className = "data-table-head";
            tb.appendChild(th);
            // td = document.createElement("td");
            // td.width = "10%";
            // td.innerHTML = "Category";
            // th.appendChild(td);
            // td = document.createElement("td");
            // td.width = "10%";
            // td.innerHTML = "Node";
            // th.appendChild(td);
            td = document.createElement("td");
            td.width = "10%";
            td.innerHTML = "Category / Node";
            th.appendChild(td);

            td = document.createElement("td");
            td.width = "10%";
            td.innerHTML = "Property";
            th.appendChild(td);
            td = document.createElement("td");
            td.width = "35%";
            td.innerHTML = "Description";
            th.appendChild(td);
            td = document.createElement("td");
            td.width = "15%";
            td.innerHTML = "Matched GDC Value " +"<span class=\"tip-info\"></span>";
            th.appendChild(td);
            td = document.createElement("td");
            td.width = "15%";
            td.innerHTML = "CDE Reference " +"<span class=\"tip-info\"></span>";
            th.appendChild(td);
            //properties
            ps.forEach(function(r){
                let tr = document.createElement("tr");
                tr.className = "data-table-row ";

                // let td = document.createElement("td");
                // td.innerHTML = r.category;
                // tr.appendChild(td);
                // td = document.createElement("td");
                // td.innerHTML = r.nd;
                // tr.appendChild(td);
                let td = document.createElement("td");
                let div = document.createElement("div");
                div.innerHTML = r.category;
                div.className = "tree-l-head";
                td.appendChild(div);
                div = document.createElement("div");
                div.className = "tree-l-1";
                let subdiv = document.createElement("div");
                subdiv.className = "tree-l-link";
                div.appendChild(subdiv);
                subdiv = document.createElement("div");
                subdiv.className = "tree-l-content";
                subdiv.innerHTML = r.nd;
                div.appendChild(subdiv);
                td.appendChild(div);
                tr.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = r.nm;
                tr.appendChild(td);
                td = document.createElement("td");
                td.innerHTML = r.desc;
                tr.appendChild(td);
                td = document.createElement("td");
                let tostr = "";
                r.vs.forEach(function(v){
                    tostr += v + "#";
                });
                if(tostr !== ""){
                    tostr = tostr.substr(0, tostr.length-1);
                }
                if(r.vs.length !== 0){
                    let hf = document.createElement("a");
                    hf.className = "table-td-link";
                    hf.href = "javascript:getGDCData('"+tostr+"');";
                    hf.innerHTML = "See All Values";
                    td.appendChild(hf);
                    let br = document.createElement("BR");
                    td.appendChild(br);
                    br = document.createElement("BR");
                    td.appendChild(br);
                    hf = document.createElement("a");
                    hf.className = "table-td-link";
                    hf.href = "javascript:toCompare('"+tostr+"');";
                    hf.innerHTML = "Compare with User List";
                    td.appendChild(hf);
                    let tmp = r.nm;
                    if(tmp.indexOf("<b>") > -1){
                        tmp = tmp.substr(3);
                        tmp = tmp.substr(0, tmp.length - 4);
                    }
                    if(tmp =='biospecimen_anatomic_site' || tmp == 'new_event_anatomic_site' || tmp == 'treatment_anatomic_site' || tmp == 'primary_diagnosis'){
                        let synstostr = JSON.stringify(r.list_syns);
                        synstostr = synstostr.replace(/'/g, '#');
                        br = document.createElement("BR");
                        td.appendChild(br);
                        br = document.createElement("BR");
                        td.appendChild(br);
                        hf = document.createElement("a");
                        hf.className = "table-td-link";
                        hf.href = "javascript:getGDCSynonyms('"+synstostr+"');";
                        hf.innerHTML = "See All synonyms";
                        td.appendChild(hf);
                    }
                }
                else{
                    td.innerHTML = "No Values";
                }
                tr.appendChild(td);
                td = document.createElement("td");
                if(r.lk !== "--" && r.lk ==='caDSR' && r.uid !== "--"){
                    let txt = document.createTextNode("caDSR: ");
                    td.appendChild(txt);
                    let hf = document.createElement("a");
                    hf.className = "table-td-link";
                    hf.href = "https://cdebrowser.nci.nih.gov/cdebrowserClient/cdeBrowser.html#/search?publicId="+r.uid+"&version=1.0";
                    hf.target = "_blank";
                    hf.innerHTML = "CDE";
                    td.appendChild(hf);

                    if(tostr !== ""){
                        let br = document.createElement("BR");
                        td.appendChild(br);
                        br = document.createElement("BR");
                        td.appendChild(br);
                        hf = document.createElement("a");
                        hf.className = "table-td-link";
                        hf.href = "javascript:getExternalData('"+r.lk+"','"+r.uid+"');";
                        hf.innerHTML = "Values";
                        td.appendChild(hf);
                        txt = document.createTextNode(" , ");
                        td.appendChild(txt);
                        hf = document.createElement("a");
                        hf.className = "table-td-link";
                        let evs = "";
                        r.evs.forEach(function(ev){
                            evs += ev.pv +"#";
                        });
                        if(evs !== ""){
                            evs = evs.substr(0, evs.length -1);
                        }
                        hf.href = "javascript:compareGDC('"+tostr+"','"+evs+"');";
                        hf.innerHTML = "Compare with GDC";
                        td.appendChild(hf);
                    }
                    else{
                        txt = document.createTextNode(" , ");
                        td.appendChild(txt);
                        hf = document.createElement("a");
                        hf.className = "table-td-link";
                        hf.href = "javascript:getExternalData('"+r.lk+"','"+r.uid+"');";
                        hf.innerHTML = "Values";
                        td.appendChild(hf);
                    }


                }
                else if(r.lk !== "--"){
                    let hf = document.createElement("a");
                    hf.className = "table-td-link";
                    hf.href = r.uid;
                    hf.target = "_blank";
                    hf.innerHTML = r.lk;
                    td.appendChild(hf);
                }
                else{
                    td.innerHTML = r.lk;
                }
                tr.appendChild(td);
                tb.appendChild(tr);
            });
            d.appendChild(t);
            c.appendChild(d);
        }
        //generate values tab
        d = document.createElement("div");
        d.id = "table_values";
        if(tab_idx === "values"){
            d.style.display = "block";
        }
        else{
            d.style.display = "none";
        }
        if(keyword.trim() === ""){
            // too much values, need to be narrow down
            let s = document.createElement("span");
            s.innerHTML = "Too much values to display, please narrow it down."
            s.className = "info_1";
            d.appendChild(s);
            c.appendChild(d);
        }
        else if(vs.length === 0){
            //no values exist
            let s = document.createElement("span");
            s.innerHTML = "No result found for keyword: "+ result_words.toString();
            s.className = "info_1";
            d.appendChild(s);
            c.appendChild(d);
        }
        else{
            //has values

            //header table
            t = document.createElement("table");
            t.border = "0";
            t.cellPadding = "0";
            t.cellSpacing = "0";
            t.width = "100%";
            t.style.display = "table";
            t.className = "data-table treetable";
            thb = document.createElement("thead");
            t.appendChild(thb);
            d.appendChild(t);
            //body table
            t = document.createElement("table");
            t.border = "0";
            t.cellPadding = "0";
            t.cellSpacing = "0";
            t.width = "100%";
            t.style.display = "table";
            t.className = "data-table treetable";
            tb = document.createElement("tbody");
            tb.style.height = "600px";
            tb.style.overflowY = "auto";
            tb.style.cssFloat = "left";
            tb.style.width = "100%"
            t.appendChild(tb);
            th = document.createElement("tr");
            th.className = "data-table-head";
            thb.appendChild(th);

            td = document.createElement("td");
            td.width = "20%";
            td.rowSpan = "2";
            td.innerHTML = "Category / Node / Property";
            th.appendChild(td);

            td = document.createElement("td");
            td.width = "40%";
            td.colSpan = 2;
            td.className = "super-header";
            td.innerHTML = "GDC Values and Synonyms";
            th.appendChild(td);
            td = document.createElement("td");
            td.width = "40%";
            td.colSpan = 2;
            td.className = "super-header";
            td.innerHTML = "CDE references, permissible values and Synonyms";
            th.appendChild(td);
            th = document.createElement("tr");
            th.className = "data-table-head";
            thb.appendChild(th);

            td = document.createElement("td");
            td.width = "20%";
            td.innerHTML = "Matched GDC Value " +"<span class=\"tip-info\"></span>";
            td.style.borderLeft = "1px solid #cdcdcd";
            th.appendChild(td);
            td = document.createElement("td");
            td.width = "20%";
            td.innerHTML = "GDC Synonyms " +"<span class=\"tip-info\"></span>";
            td.style.borderLeft = "1px solid #cdcdcd";
            th.appendChild(td);
            td = document.createElement("td");
            td.width = "20%";
            td.style.borderLeft = "1px solid #cdcdcd";
            td.innerHTML = "NCIt Code and Synonyms " +"<span class=\"tip-info\"></span>";
            th.appendChild(td);
            td = document.createElement("td");
            td.width = "20%";
            td.innerHTML = "CDE Reference " +"<span class=\"tip-info\"></span>";
            td.style.borderLeft = "1px solid #cdcdcd";
            th.appendChild(td);
            //generate new vs from the current vs
            let current_p = "";
            //let inner_tb;
            let vs_new = [];
            let tmp1 = {};
            let tmp2 = {};
            vs.forEach(function(r){

              if(current_p =="" || current_p != r.category +"/" +r.nd+"/" + r.pn){

                if(current_p != "") {
                  vs_new.push(tmp1);
                  tmp1 = {};
                }

                current_p = r.category +"/" +r.nd+"/" + r.pn;

                tmp1.category = r.category;
                tmp1.nd = r.nd;
                tmp1.pn = r.pn;
                tmp1.lk = r.lk;
                tmp1.vs_list = r.vs;
                tmp1.vs = [];
                tmp1.uid = r.uid;
                tmp1.evs = r.evs;
                tmp1.list_syns = r.list_syns;
              }

              tmp2.nm = r.nm;
              tmp2.hl = r.hl;
              tmp2.syns = r.syns;
              tmp2.list_syns = r.list_syns;
              tmp1.vs.push(tmp2);
              tmp2 = {};

            });
            vs_new.push(tmp1);
            console.log(vs_new);
            // New Values
            vs_new.forEach(function(nr){
              tr = document.createElement("tr");
              tr.className = "data-table-row";
              tr.style.cssFloat = "left";
              tr.style.width = "100%";
              td = document.createElement("td");
              td.style.borderRight = "dashed 1px #BEBEBE";
              td.style.cssFloat = "left";
              td.style.width = "20%";
              td.style.paddingBottom = "500em";
              td.style.marginBottom  = "-500em";
              let div = document.createElement("div");
              div.innerHTML = nr.category;
              div.className = "tree-l-head";
              td.appendChild(div);
              div = document.createElement("div");
              div.className = "tree-l-1";
              let subdiv = document.createElement("div");
              subdiv.className = "tree-l-link";
              div.appendChild(subdiv);
              subdiv = document.createElement("div");
              subdiv.className = "tree-l-content";
              subdiv.innerHTML = nr.nd;
              div.appendChild(subdiv);
              td.appendChild(div);
              div = document.createElement("div");
              div.className = "tree-l-2";
              subdiv = document.createElement("div");
              subdiv.className = "tree-l-link";
              div.appendChild(subdiv);
              subdiv = document.createElement("div");
              subdiv.className = "tree-l-content";
              subdiv.innerHTML = nr.pn;
              div.appendChild(subdiv);
              td.appendChild(div);
              tr.appendChild(td);

              //tostr Variable
              let tostr = "";
              nr.vs_list.forEach(function(v){
                  tostr += v + "#";
              });

              //Matched GDC Value Content
              td = document.createElement("td");
              td.colSpan = 3;
              td.style.borderRight = "dashed 1px #BEBEBE";
              td.style.padding = "0em";
              td.style.cssFloat = "left";
              td.style.width = "60%";
              let inner_t = document.createElement("table");
              inner_t.border = "0";
              inner_t.cellPadding = "0";
              inner_t.cellSpacing = "0";
              inner_t.width = "100%";
              inner_t.style.display = "table";
              inner_t.className = "inner-data-table";
              let inner_tb = document.createElement("tbody");
              inner_t.appendChild(inner_tb);
              td.appendChild(inner_t);
              tr.appendChild(td);
              tb.appendChild(tr);

              //counter
              let cont = 0;
              //Matched GDC Value
              nr.vs.forEach(function(r){

                //Matched GDC Value
                let inner_tr = document.createElement("tr");
                inner_tr.className = "data-table-row";
                inner_td = document.createElement("td");
                inner_td.width = "25%";
                if(cont > 4) {
                  inner_tr.className += " data-table-toggle";
                }
                cont++;

                inner_tb.appendChild(inner_tr);
                inner_tr.appendChild(inner_td);

                if(tostr !== ""){
                  tostr = tostr.substr(0, tostr.length-1);
                  let hf = document.createElement("a");

                  if(r.hl === undefined || r.hl){
                     hf.className = "table-td-link ";
                     if(r.nm.indexOf("<b>") >= 0){
                          hf.innerHTML = r.nm;
                     }
                     else{
                          hf.className += "underline";
                          hf.innerHTML = "<b>"+r.nm+"</b>";
                     }

                     hf.href = "javascript:getGDCData('"+tostr+"', '"+r.nm+"');";
                  }
                  else{
                     hf.className = "table-td-link";
                     if(r.nm === '--'){
                          hf.innerHTML = 'See All Values';
                          hf.href = "javascript:getGDCData('"+tostr+"');";
                     }
                     else{
                          hf.innerHTML = r.nm;
                          hf.href = "javascript:getGDCData('"+tostr+"', '"+r.nm+"');";
                     }

                  }

                  inner_td.appendChild(hf);
                  if(r.cd !== undefined){
                      let txt = document.createTextNode(" ("+r.cd+")");
                      inner_td.appendChild(txt);
                  }
                  inner_tr.appendChild(inner_td);

              }
              else{
                  let text = document.createTextNode('No Values');
                  inner_td.appendChild(text);
                  inner_tr.appendChild(inner_td);
              }
              //Matched GDC Value

              //GDC Synonyms
              inner_td = document.createElement("td");
              inner_td.width = "25%";
              let gdc_syn_html = "";
              if(r.syns !==undefined && r.list_syns !== undefined){
                  if(r.syns.indexOf("<table>") === 0){
                      gdc_syn_html = r.syns;
                  }
                  else{
                      r.syns.split('#').forEach(function(syn){
                          gdc_syn_html += syn + "<br>";
                      });
                      gdc_syn_html = gdc_syn_html.substr(0, gdc_syn_html.length -4);
                  }

              }
              else{
                  gdc_syn_html = "--";
              }
              inner_td.innerHTML = gdc_syn_html;
              inner_tb.appendChild(inner_tr);
              inner_tr.appendChild(inner_td);
              //End GDC Synonyms

              //NCIt Code and Synonym
              inner_td = document.createElement("td");
              inner_td.width = "25%";
              gdc_syn_html = "";
              if(r.syns !==undefined && r.list_syns === undefined){
                  if(r.syns.indexOf("<table>") === 0){
                      gdc_syn_html = r.syns;
                  }
                  else{
                      r.syns.split('#').forEach(function(syn){
                          gdc_syn_html += syn + "<br>";
                      });
                      gdc_syn_html = gdc_syn_html.substr(0, gdc_syn_html.length -4);
                  }

              }
              else{
                  gdc_syn_html = "--";
              }
              inner_td.innerHTML = gdc_syn_html;
              inner_tb.appendChild(inner_tr);
              inner_tr.appendChild(inner_td);
              //End NCIt Code and Synonym

            }); // <-- End New Value forEach


            //Compare with User List
            let br = document.createElement("BR");
            td.appendChild(br);
            br = document.createElement("BR");
            td.appendChild(br);
            if(nr.vs.length > 4) {
              hf = document.createElement("a");
              hf.className = "table-td-link show-more-less";
              hf.style.marginLeft = "10px"
              hf.href = "javascript:void(0);";
              hf.innerHTML = "Show More";
              td.appendChild(hf)
            }
            br = document.createElement("BR");
            td.appendChild(br);
            br = document.createElement("BR");
            td.appendChild(br);
            hf = document.createElement("a");
            hf.className = "table-td-link";
            hf.style.marginLeft = "10px";
            hf.href = "javascript:toCompare('"+tostr+"');";
            hf.innerHTML = "Compare with User List";
            td.appendChild(hf);

            //See All synonyms
            let r = nr;
            if(r.pn =='biospecimen_anatomic_site' || r.pn == 'new_event_anatomic_site' || r.pn == 'treatment_anatomic_site' || r.pn == 'primary_diagnosis'){
                let synstostr = JSON.stringify(r.list_syns);
                synstostr = synstostr.replace(/'/g, '#');
                let txt = document.createTextNode(" , ");
                td.appendChild(txt);
                hf = document.createElement("a");
                hf.className = "table-td-link";
                hf.href = "javascript:getGDCSynonyms('"+synstostr+"');";
                hf.innerHTML = "See All synonyms";
                td.appendChild(hf);
            }

            //CDE Reference Table Content
            td = document.createElement("td");
            td.style.padding = "0em";
            td.style.cssFloat = "left";
            let inner_d = document.createElement("div");
            inner_d.className = "inner-data-div";
            td.appendChild(inner_d);
            tr.appendChild(td);
            tb.appendChild(tr);

            //CDE Reference
            if(r.lk !== "--" && r.lk ==='caDSR' && r.uid !== "--"){
                let txt = document.createTextNode("caDSR: ");
                inner_d.appendChild(txt);
                let hf = document.createElement("a");
                hf.className = "table-td-link";
                hf.href = "https://cdebrowser.nci.nih.gov/cdebrowserClient/cdeBrowser.html#/search?publicId="+r.uid+"&version=1.0";
                hf.target = "_blank";
                hf.innerHTML = "CDE";
                inner_d.appendChild(hf);
                if(tostr !== ""){
                    let br = document.createElement("BR");
                    inner_d.appendChild(br);
                    br = document.createElement("BR");
                    inner_d.appendChild(br);
                    hf = document.createElement("a");
                    hf.className = "table-td-link";
                    hf.href = "javascript:getExternalData('"+r.lk+"','"+r.uid+"');";
                    hf.innerHTML = "Values";
                    inner_d.appendChild(hf);
                    txt = document.createTextNode(" , ");
                    inner_d.appendChild(txt);
                    hf = document.createElement("a");
                    hf.className = "table-td-link";
                    let evs = "";
                    r.evs.forEach(function(ev){
                        evs += ev.pv +"#";
                    });
                    if(evs !== ""){
                        evs = evs.substr(0, evs.length -1);
                    }
                    hf.href = "javascript:compareGDC('"+tostr+"','"+evs+"');";
                    hf.innerHTML = "Compare with GDC";
                    inner_d.appendChild(hf);
                }
                else{
                    txt = document.createTextNode(" , ");
                    inner_d.appendChild(txt);
                    hf = document.createElement("a");
                    hf.className = "table-td-link";
                    hf.href = "javascript:getExternalData('"+r.lk+"','"+r.uid+"');";
                    hf.innerHTML = "Values";
                    inner_d.appendChild(hf);
                }

            }
            else if(r.lk !== "--"){
                let hf = document.createElement("a");
                hf.className = "table-td-link";
                hf.href = r.uid;
                hf.target = "_blank";
                hf.innerHTML = r.lk;
                inner_d.appendChild(hf);
            }
            else{
                inner_d.innerHTML = r.lk;
            }
            td.appendChild(inner_d);
            //End CDE Reference

            }); //<-- New Values End

            //Values
            // console.log(vs);
            // vs.forEach(function(r){
            //     if(current_p =="" || current_p != r.category +"/" +r.nd+"/" + r.pn){
            //         current_p = r.category +"/" +r.nd+"/" + r.pn;
            //         tr = document.createElement("tr");
            //         tr.className = "data-table-row ";
            //         td = document.createElement("td");
            //         td.style.borderRight = "dashed 1px #BEBEBE";
            //         let div = document.createElement("div");
            //         div.innerHTML = r.category;
            //         div.className = "tree-l-head";
            //         td.appendChild(div);
            //         div = document.createElement("div");
            //         div.className = "tree-l-1";
            //         let subdiv = document.createElement("div");
            //         subdiv.className = "tree-l-link";
            //         div.appendChild(subdiv);
            //         subdiv = document.createElement("div");
            //         subdiv.className = "tree-l-content";
            //         subdiv.innerHTML = r.nd;
            //         div.appendChild(subdiv);
            //         td.appendChild(div);
            //         div = document.createElement("div");
            //         div.className = "tree-l-2";
            //         subdiv = document.createElement("div");
            //         subdiv.className = "tree-l-link";
            //         div.appendChild(subdiv);
            //         subdiv = document.createElement("div");
            //         subdiv.className = "tree-l-content";
            //         subdiv.innerHTML = r.pn;
            //         div.appendChild(subdiv);
            //         td.appendChild(div);
            //         tr.appendChild(td);
            //         td = document.createElement("td");
            //         td.colSpan = 4;
            //         td.style.padding = "0em";
            //         let inner_t = document.createElement("table");
            //         inner_t.border = "0";
            //         inner_t.cellPadding = "0";
            //         inner_t.cellSpacing = "0";
            //         inner_t.width = "100%";
            //         inner_t.style.display = "table";
            //         inner_t.className = "inner-data-table";
            //         inner_tb = document.createElement("tbody");
            //         inner_t.appendChild(inner_tb);
            //         td.appendChild(inner_t);
            //         tr.appendChild(td);
            //         tb.appendChild(tr);
            //     }
            //     tr = document.createElement("tr");
            //     tr.className = "data-table-row ";
            //     td = document.createElement("td");
            //     td.width = "25%";
            //     let tostr = "";
            //     r.vs.forEach(function(v){
            //         tostr += v + "#";
            //     });
            //     if(tostr !== ""){
            //         tostr = tostr.substr(0, tostr.length-1);
            //         let hf = document.createElement("a");
            //
            //         if(r.hl === undefined || r.hl){
            //            hf.className = "table-td-link ";
            //            if(r.nm.indexOf("<b>") >= 0){
            //                 hf.innerHTML = r.nm;
            //            }
            //            else{
            //                 hf.className += "underline";
            //                 hf.innerHTML = "<b>"+r.nm+"</b>";
            //            }
            //
            //            hf.href = "javascript:getGDCData('"+tostr+"', '"+r.nm+"');";
            //         }
            //         else{
            //            hf.className = "table-td-link";
            //            if(r.nm === '--'){
            //                 hf.innerHTML = 'See All Values';
            //                 hf.href = "javascript:getGDCData('"+tostr+"');";
            //            }
            //            else{
            //                 hf.innerHTML = r.nm;
            //                 hf.href = "javascript:getGDCData('"+tostr+"', '"+r.nm+"');";
            //            }
            //
            //         }
            //
            //         td.appendChild(hf);
            //         if(r.cd !== undefined){
            //             let txt = document.createTextNode(" ("+r.cd+")");
            //             td.appendChild(txt);
            //         }
            //         let br = document.createElement("BR");
            //         td.appendChild(br);
            //         br = document.createElement("BR");
            //         td.appendChild(br);
            //         hf = document.createElement("a");
            //         hf.className = "table-td-link";
            //         hf.href = "javascript:toCompare('"+tostr+"');";
            //         hf.innerHTML = "Compare with User List";
            //         td.appendChild(hf);
            //         if(r.pn =='biospecimen_anatomic_site' || r.pn == 'new_event_anatomic_site' || r.pn == 'treatment_anatomic_site' || r.pn == 'primary_diagnosis'){
            //             let synstostr = JSON.stringify(r.list_syns);
            //             synstostr = synstostr.replace(/'/g, '#');
            //             br = document.createElement("BR");
            //             td.appendChild(br);
            //             br = document.createElement("BR");
            //             td.appendChild(br);
            //             hf = document.createElement("a");
            //             hf.className = "table-td-link";
            //             hf.href = "javascript:getGDCSynonyms('"+synstostr+"');";
            //             hf.innerHTML = "See All synonyms";
            //             td.appendChild(hf);
            //         }
            //         tr.appendChild(td);
            //
            //     }
            //     else{
            //         let text = document.createTextNode('No Values');
            //         td.appendChild(text);
            //         tr.appendChild(td);
            //     }
            //
            //     //show GDC synonyms if exists
            //     td = document.createElement("td");
            //     td.width = "25%";
            //     let gdc_syn_html = "";
            //     if(r.syns !==undefined && r.list_syns !== undefined){
            //         if(r.syns.indexOf("<table>") === 0){
            //             gdc_syn_html = r.syns;
            //         }
            //         else{
            //             r.syns.split('#').forEach(function(syn){
            //                 gdc_syn_html += syn + "<br>";
            //             });
            //             gdc_syn_html = gdc_syn_html.substr(0, gdc_syn_html.length -4);
            //         }
            //
            //     }
            //     else{
            //         gdc_syn_html = "--";
            //     }
            //     td.innerHTML = gdc_syn_html;
            //     tr.appendChild(td);
            //
            //
            //     //CDE Reference
            //     td = document.createElement("td");
            //     td.width = "25%";
            //     if(r.lk !== "--" && r.lk ==='caDSR' && r.uid !== "--"){
            //         let txt = document.createTextNode("caDSR: ");
            //         td.appendChild(txt);
            //         let hf = document.createElement("a");
            //         hf.className = "table-td-link";
            //         hf.href = "https://cdebrowser.nci.nih.gov/cdebrowserClient/cdeBrowser.html#/search?publicId="+r.uid+"&version=1.0";
            //         hf.target = "_blank";
            //         hf.innerHTML = "CDE";
            //         td.appendChild(hf);
            //         if(tostr !== ""){
            //             let br = document.createElement("BR");
            //             td.appendChild(br);
            //             br = document.createElement("BR");
            //             td.appendChild(br);
            //             hf = document.createElement("a");
            //             hf.className = "table-td-link";
            //             hf.href = "javascript:getExternalData('"+r.lk+"','"+r.uid+"');";
            //             hf.innerHTML = "Values";
            //             td.appendChild(hf);
            //             txt = document.createTextNode(" , ");
            //             td.appendChild(txt);
            //             hf = document.createElement("a");
            //             hf.className = "table-td-link";
            //             let evs = "";
            //             r.evs.forEach(function(ev){
            //                 evs += ev.pv +"#";
            //             });
            //             if(evs !== ""){
            //                 evs = evs.substr(0, evs.length -1);
            //             }
            //             hf.href = "javascript:compareGDC('"+tostr+"','"+evs+"');";
            //             hf.innerHTML = "Compare with GDC";
            //             td.appendChild(hf);
            //         }
            //         else{
            //             txt = document.createTextNode(" , ");
            //             td.appendChild(txt);
            //             hf = document.createElement("a");
            //             hf.className = "table-td-link";
            //             hf.href = "javascript:getExternalData('"+r.lk+"','"+r.uid+"');";
            //             hf.innerHTML = "Values";
            //             td.appendChild(hf);
            //         }
            //
            //     }
            //     else if(r.lk !== "--"){
            //         let hf = document.createElement("a");
            //         hf.className = "table-td-link";
            //         hf.href = r.uid;
            //         hf.target = "_blank";
            //         hf.innerHTML = r.lk;
            //         td.appendChild(hf);
            //     }
            //     else{
            //         td.innerHTML = r.lk;
            //     }
            //     tr.appendChild(td);
            //
            //     //NCIt Code and Synonyms
            //     td = document.createElement("td");
            //     td.width = "25%";
            //     let syn_html = "";
            //     if(r.syns !==undefined && r.list_syns === undefined){
            //         if(r.syns.indexOf("<table>") === 0){
            //             syn_html = r.syns;
            //         }
            //         else{
            //             r.syns.split('#').forEach(function(syn){
            //                 syn_html += syn + "<br>";
            //             });
            //             syn_html = syn_html.substr(0, syn_html.length -4);
            //         }
            //
            //     }
            //     else{
            //         syn_html = "--";
            //     }
            //     td.innerHTML = syn_html;
            //     tr.appendChild(td);
            //     inner_tb.appendChild(tr);
            // });

            d.appendChild(t);
            c.appendChild(d);
        }
        $('span.tip-info').each(function(idx){
            let target = $(this);
            target.bind("click",function(e){
                if($('#information').length){
                    $('#information').remove();
                }
                let popup = '<div id="information"><div id="info-content" class="form-area"></div></div>';
                $(document.body).append(popup);
                $("#information").dialog({
                        modal: false,
                        position: {
                                    my: 'center top+10',
                                    at: 'bottom',
                                    of: e
                        },
                        width:"20%",
                        title: target[0].parentNode.textContent.trim(),
                        open: function() {
                            $('#info-content').html("Text will be provided to inform users on how to interpret content of columns.");
                        },
                        close: function() {
                            $(this).remove();
                        }
                });
            });
        });

        console.log($(".show-more-less"));
        $(".show-more-less").click(function () {
          let target = $(this);
          target.parent().find('.data-table-toggle').removeClass('data-table-toggle');
        });
    }
}

function popup(){
    let popup = '<div id="newTerm"><div id="term-form" class="form-area"></div></div>';
    $(document.body).append(popup);
    let tp = window.innerHeight * 0.2;
    $("#newTerm").dialog({
            modal: true,
            position: { my: "center top+"+tp, at: "center top", of:window},
            width:"30%",
            title: "Suggest a new term",
            open: function() {
                //generate new term form
                let html = "<table><tr><td align=\"right\" width=\"15%\">Name</td><td><input class=\"input-box input-td\" type=\"input\" id=\"name\"/></td></tr>"
                        +"<tr><td align=\"right\">Description</td><td><input class=\"input-box input-td\" type=\"input\" id=\"name\"/></td></tr>"
                        +"<tr><td align=\"right\">Values</td><td><input class=\"input-box input-td\" type=\"input\" id=\"name\"/></td></tr>"
                        +"</table>"
                        +"<div><span id=\"suggestTerm\" class=\"btn btn-list btn-submit\">Submit</span><span id=\"cancelSuggestion\" class=\"btn btn-list btn-submit\">Cancel</span></div>";

                $('#term-form').html(html);
                $('#cancelSuggestion').bind('click', function(){
                    $("#newTerm").dialog('close');
                });
            },
            close: function() {
                $(this).remove();
            }
    });
}

$(document.body).ready(function(){
    $("#prop_s").bind("click", function(){
        window.location = "./ui?idx=1";
    });
    $("#pop_window_newTerm").bind("click", function(){
        popup();
    });
    $("#searchProperty").bind("click", search);
    $("#keywords").bind("keypress", function(e){
        if(e.keyCode == 13 && $("#suggestBox .selected").length !== 0){
            // let idx = $("#suggestBox .selected").html().indexOf("<label>");
            let t = $("#suggestBox .selected").text();
            $("#keywords").val(t.substr(0,t.length-1));
            $("#searchProperty").trigger("click");
        }
        else if (e.keyCode == 13) {
            search();
        }
    });
    $("#keywords").bind("keydown", function(e){
        if ((e.keyCode == 40 || e.keyCode == 38) && $(this).val().trim() !== "" && document.getElementById("suggestBox").style.display !== "none") {
            e.preventDefault();
            //focus to the first element

            displayBoxIndex += (e.keyCode == 40 ? 1 : -1);
            let oBoxCollection = $("#suggestBox").find("div");
            if (displayBoxIndex >= oBoxCollection.length)
                 displayBoxIndex = 0;
            if (displayBoxIndex < 0)
                 displayBoxIndex = oBoxCollection.length - 1;
            let cssClass = "selected";
            oBoxCollection.removeClass(cssClass).eq(displayBoxIndex).addClass(cssClass);
        }
    });
    $("#keywords").bind("input", function(){
        let area = document.getElementById("suggestBox");
        if($(this).val().trim() === ''){
            area.style.display = "none";
            displayBoxIndex = -1;
            area.innerHTML = "";
            return;
        }
        $.getJSON('./search/suggest', {keyword:$(this).val()}, function(result){
            if(result.length === 0){
                area.style.display = "none";
                displayBoxIndex = -1;
                area.innerHTML = "";
                return;
            }
            let html = "";
            area.style.display = "block";
            result.forEach(function(opt){

                html += "<div><span style=\"width:96%;float:left;\">"+opt.id+"</span><label>"+opt.type+"</label></div>";
                //html += "<div>"+opt.text+"</div>";
            });
            displayBoxIndex = -1;
            area.innerHTML = html;
            area.onclick = function(e){
                let t = $(e.target).text();
                $("#keywords").val(t);
                $("#keywords").focus();
            };
        });
    });
    $(document).on('click',function(e){
        if($(e.target) != $("#suggestBox")){
            $("#suggestBox").css("display","none");
            displayBoxIndex = -1;
        }
    });

    // $("#sm-table").treetable({expandable: true});

});

var getExternalData = function(source, uid){
    if($('#caDSR_data').length){
        $('#caDSR_data').remove();
    }
    if(source === "caDSR"){
        $.getJSON('./search/external/caDSR', {uid:uid}, function(result){

            let popup = '<div id="caDSR_data"><div class="data-option"><div class="option-right"><input type="checkbox" id="data-invariant"> Show Duplicates</div></div><div id="data-list" class="div-list"></div></div>';
            $(document.body).append(popup);
            let tp = window.innerHeight * 0.2;
            $("#caDSR_data").dialog({
                    modal: false,
                    position: { my: "center top+"+tp, at: "center top", of:window},
                    width:"60%",
                    title: "CaDSR Permissible Values ("+result.length+")",
                    open: function() {
                        //display result in a table
                        let html = "";
                        if(result.length === 0){
                            html = "No permissible values found."
                        }
                        else{
                            let count = 0;
                            //html = "<table><tbody><tr class=\"data-table-head\"><td width=\"5%\"></td><td width=\"15%\">PV</td><td width=\"40%\">Description</td><td width=\"15%\">NCIt</td><td width=\"25%\">Synonyms</td></tr>";
                            html = "<table><tbody><tr class=\"data-table-head\"><td width=\"5%\"></td><td width=\"15%\">PV</td><td width=\"40%\">Description</td><td width=\"40%\">NCIt Code and Synonyms</td></tr>";
                            result.forEach(function(emt){
                                //display pv information
                                let syn_html = "";
                                let syn_html_invariant = "";
                                if(emt.syn !==undefined){
                                    let cache = {};
                                    syn_html = "<table><tbody><tr class=\"\"><td><a class=\"table-td-link\" href=\"https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code="+emt.pvc+"\" target=\"_blank\">"+emt.pvc+"</a></td><td class=\"td-split\">";
                                    syn_html_invariant = "<table><tbody><tr class=\"\"><td><a class=\"table-td-link\" href=\"https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code="+emt.pvc+"\" target=\"_blank\">"+emt.pvc+"</a></td><td class=\"td-split\">";
                                    emt.syn.forEach(function(s){
                                        let lc = s.trim().toLowerCase();
                                        if(!(lc in cache)){
                                            cache[lc] = [];
                                        }
                                        cache[lc].push(s);
                                        syn_html += s + "<br>";
                                    });
                                    for(let idx in cache){
                                        //find the term with the first character capitalized
                                        let word = findWord(cache[idx]);
                                        syn_html_invariant += word + "<br>";
                                    }
                                    syn_html = syn_html.substr(0, syn_html.length -4);
                                    syn_html_invariant = syn_html_invariant.substr(0, syn_html_invariant.length -4);
                                    syn_html += "</td></tr></tbody></table>";
                                    syn_html_invariant += "</td></tr></tbody></table>";
                                }
                                else if(emt.ss !== undefined){
                                    syn_html = "<table><tbody>";
                                    syn_html_invariant = "<table><tbody>";
                                    let ctt = "", ctt_invariant = "", count = 0;
                                    emt.ss.forEach(function(r){
                                        count++;
                                        if(count !== emt.ss.length){
                                            ctt += "<tr class=\"data-table-row\"><td><a class=\"table-td-link\" href=\"https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code="+r.code+"\" target=\"_blank\">"+r.code+"</a></td><td class=\"td-split\">";
                                            ctt_invariant += "<tr class=\"data-table-row\"><td><a class=\"table-td-link\" href=\"https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code="+r.code+"\" target=\"_blank\">"+r.code+"</a></td><td class=\"td-split\">";
                                        }
                                        else{
                                            ctt += "<tr class=\"\"><td><a class=\"table-td-link\" href=\"https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code="+r.code+"\" target=\"_blank\">"+r.code+"</a></td><td class=\"td-split\">";
                                            ctt_invariant += "<tr class=\"\"><td><a class=\"table-td-link\" href=\"https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code="+r.code+"\" target=\"_blank\">"+r.code+"</a></td><td class=\"td-split\">";
                                        }
                                        let cache = {};
                                        r.syn.forEach(function(s){
                                            let lc = s.trim().toLowerCase();
                                            if(!(lc in cache)){
                                                cache[lc] = [];
                                            }
                                            cache[lc].push(s);
                                            ctt += s + "<br>";
                                        });
                                        for(let idx in cache){
                                            //find the term with the first character capitalized
                                            let word = findWord(cache[idx]);
                                            ctt_invariant += word + "<br>";
                                        }
                                        ctt = ctt.substr(0, ctt.length -4);
                                        ctt_invariant = ctt_invariant.substr(0, ctt_invariant.length -4);
                                        ctt += "</td></tr>";
                                        ctt_invariant += "</td></tr>";
                                    });
                                    syn_html += ctt;
                                    syn_html_invariant += ctt_invariant;
                                    syn_html += "</tbody></table>";
                                    syn_html_invariant += "</tbody></table>";
                                }
                                // let codes = emt.pvc !== null ? emt.pvc.split(":") : null;
                                // let code_html = "";
                                // if(codes !== null){
                                //     codes.forEach(function(c){
                                //         code_html += '<a class=\"table-td-link\" href="https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code='+c+'" target="_blank">'+c+'</a>' + ':<br>';
                                //     });
                                // }

                                // if(code_html !== ""){
                                //     code_html = code_html.substr(0, code_html.length-5);
                                // }
                                html += "<tr class=\"data-table-row\"><td><b>"+(++count)+".</b></td><td>"+emt.pv+"</td><td>"+emt.pvd+"</td><td name=\"syn_area\">"+syn_html_invariant+"</td><td name=\"syn_invariant\" style=\"display:none;\">"+syn_html+"</td></tr>";
                            });
                            html += "</tbody></table>";
                        }

                        $('#data-list').html(html);
                        $('#data-invariant').bind('click', function(){
                            $("#data-list").find('td[name="syn_area"]').each(function(){
                                let tmp = $(this).html();
                                let invariant = $(this).parent().children('td[name="syn_invariant"]');
                                $(this).html(invariant[0].innerHTML);
                                invariant[0].innerHTML = tmp;
                            });
                        });
                    },
                    close: function() {
                        $(this).remove();
                    }
            });
        });
    }
};

var compareGDC = function(fromV, toV){
    if($('#compareGDC_dialog').length){
        $('#compareGDC_dialog').remove();
    }
    let popup = '<div id="compareGDC_dialog">'
                    +'<div id="compareGDC_result"></div>'
                +'</div>';
    $(document.body).append(popup);
    let tp = window.innerHeight * 0.2;
    let opt = {};
    opt.sensitive = false;
    opt.unmatched = false;
    let table = generateCompareGDCResult(fromV, toV, opt);
    let html = '<div class="cp_result_title">Compare Result</div>'
                +'<div id="cpGDC_result_option"><div class="option-left"><input type="checkbox" id="compareGDC_filter"> Case Sensitive</div><div class="option-right"><input type="checkbox" id="compareGDC_unmatched"> Hide Unmatched Values</div></div>'
                +'<div id="cpGDC_result_table">'+table+'</div>'
                +'<div id="cpGDC_result_bottom"><span id="closeCompareGDC" class="btn-submit-large" style="margin-left: calc(50% - 2em - 10px);">Close</span></div>'
                +'</div>';


    $("#compareGDC_dialog").dialog({
            modal: false,
            position: { my: "center top+"+tp, at: "center top", of:window},
            width:"50%",
            title: "Compare GDC Values with caDSR Values ",
            open: function() {
                //display result in a table
                $('#compareGDC_result').html(html);
                let height = $('#cpGDC_result_table table:first-child').height() +1;
                if(height >= 30 * 12.8){
                    height = 384;
                }
                $('#cpGDC_result_table').height(height+'px');
                $('#closeCompareGDC').bind('click', function(){
                    $("#compareGDC_dialog").dialog('close');
                });
                $('#compareGDC_filter').bind('click', function(){
                    let options = {};
                    options.sensitive = $("#compareGDC_filter").prop('checked');
                    options.unmatched = $("#compareGDC_unmatched").prop('checked');
                    let table_new = generateCompareGDCResult(fromV, toV, options);
                    $('#cpGDC_result_table').html(table_new);
                    let h = $('#cpGDC_result_table table:first-child').height() +1;
                    if(h >= 30 * 12.8){
                        h = 384;
                    }
                    $('#cpGDC_result_table').height(h+'px');
                });
                $('#compareGDC_unmatched').bind('click', function(){
                    let options = {};
                    options.sensitive = $("#compareGDC_filter").prop('checked');
                    options.unmatched = $("#compareGDC_unmatched").prop('checked');
                    let table_new = generateCompareGDCResult(fromV, toV, options);
                    $('#cpGDC_result_table').html(table_new);
                    let h = $('#cpGDC_result_table table:first-child').height() +1;
                    if(h >= 30 * 12.8){
                        h = 384;
                    }
                    $('#cpGDC_result_table').height(h+'px');
                });
            },
            close: function() {
                $(this).remove();
            }
    });
};

var generateCompareGDCResult = function(fromV, toV, option){
    let from = fromV.split("#");
    let to = toV.split("#");
    let v_lowercase = [], v_matched = [];
    let from_num = 0;
    if(option.sensitive){
        to.forEach(function(v){
            v_lowercase.push(v.trim());
        });
    }
    else{
        to.forEach(function(v){
            v_lowercase.push(v.trim().toLowerCase());
        });
    }

    let table = '<table width="100%"><tbody><tr class="data-table-head center"><td width="50%" style="text-align:left;">GDC Values</td><td width="50%" style="text-align:left;">Matched caDSR Values</td></tr>';

    from.forEach(function(v){
        let tmp = $.trim(v);
        if(tmp ===''){
            return;
        }
        let text = '';
        let idx = option.sensitive ? v_lowercase.indexOf(tmp) : v_lowercase.indexOf(tmp.toLowerCase());
        if(idx >= 0){
            text = to[idx];
            v_matched.push(idx);
        }
        if(text ===''){
            text = '<div style="color:red;">--</div>';
            table += '<tr class="data-table-row"><td align="left"><b>'+(++from_num)+'.</b>'+v+'</td><td align="left">'+text+'</td></tr>';
        }
        else{
            table += '<tr class="data-table-row"><td align="left"><b>'+(++from_num)+'.</b>'+v+'</td><td align="left"><b>'+(idx+1)+'.</b>'+text+'</td></tr>';
        }
    });
    for(var i = 0; i< to.length; i++){
        if(v_matched.indexOf(i) >= 0){
            continue;
        }
        table += '<tr class="data-table-row '+(option.unmatched ? 'row-undisplay' : '')+'"><td align="left"><div style="color:red;">--</div></td><td align="left"><b>'+(i+1)+'.</b>'+to[i]+'</td></tr>';
    }
    table += "</tbody></table>";

    return table;
};

var getGDCSynonyms = function(values){
    if($('#gdc_syn_data').length){
        $('#gdc_syn_data').remove();
    }
    let popup = '<div id="gdc_syn_data"><div id="gdc-syn-data-list" class="div-list"></div></div>';
    $(document.body).append(popup);
    let tp = window.innerHeight * 0.2;
    let data = values.replace(/#/g,"'");
    let result = JSON.parse(data);
    $("#gdc_syn_data").dialog({
            modal: false,
            position: { my: "center top+"+tp, at: "center top", of:window},
            width:"30%",
            title: "GDC Synonyms ("+result.length+")",
            open: function() {
                //display result in a table
                let html = "<table><tbody><tr class=\"data-table-head\"><td width=\"5%\"></td><td width=\"25%\">PV</td><td width=\"25%\">NCIt</td><td width=\"45%\">Synonyms</td></tr>";
                let count = 0;
                result.forEach(function(emt){
                    let syn_html = "";
                    emt.syn.forEach(function(s){
                            syn_html += s + "<br>";
                    });
                    syn_html = syn_html.substr(0, syn_html.length -4);
                    html += "<tr class=\"data-table-row\"><td><b>"+(++count)+".</b></td><td>"+emt.pv+"</td><td>"+emt.pvc+"</td><td>"+syn_html+"</td></tr>";
                });
                html += "</tbody></table>";

                $('#gdc-syn-data-list').html(html);
            },
            close: function() {
                $(this).remove();
            }
    });
};

var getGDCData = function(values, item){
        if($('#gdc_data').length){
            $('#gdc_data').remove();
        }
        let target = item == undefined ? item : item.replace(/<b>/g,"").replace(/<\/b>/g, "");
        let popup = '<div id="gdc_data">'+(target !== undefined ? '<div class="option-right"><input type="checkbox" id="show_all"> Show all GDC values</div>': '')+'<div id="gdc-data-list" class="div-list"></div></div>';
        $(document.body).append(popup);
        let tp = window.innerHeight * 0.2;
        let result = values.split("#");
        $("#gdc_data").dialog({
                modal: false,
                position: { my: "center top+"+tp, at: "center top", of:window},
                width:"30%",
                title: "GDC Permissible Values ("+result.length+")",
                open: function() {
                    //display result in a table
                    let html = "";
                    let count = 0;
                    if(target !== undefined){
                        result.forEach(function(emt){
                            if(emt == target){
                                html += "<div><b>"+(++count)+".</b> "+emt+"</div>";
                            }
                            else{
                                html += "<div style=\"display: none;\"><b>"+(++count)+".</b> "+emt+"</div>";
                            }
                        });
                    }
                    else{
                        result.forEach(function(emt){
                            html += "<div><b>"+(++count)+".</b> "+emt+"</div>";
                        });
                    }

                    $('#gdc-data-list').html(html);
                    if(target !== undefined){
                        $('#show_all').bind('click', function(){
                            let v = $(this).prop("checked");
                            if(v){
                                $('#gdc-data-list div[style="display: none;"]').each(function(){
                                    $(this).css("display","block");
                                });
                            }
                            else{
                                $('#gdc-data-list div[style="display: block;"]').each(function(){
                                    $(this).css("display","none");
                                });
                            }
                        });
                    }
                },
                close: function() {
                    $(this).remove();
                }
        });
};

var toCompare = function(values){
    if($('#compare_dialog').length){
        $('#compare_dialog').remove();
    }
    let popup = '<div id="compare_dialog">'
                    +'<div id="compare_form">'
                        +'<div id="cp_top">'
                            +'<label class="left_label">User Defined Values:</label>'
                            +'<label class="right_label">GDC Values:</label>'
                            +'<div id="cp_left">'
                            +'<textarea id="cp_input" rows="10" cols="20" placeholder="Input values line by line" autocomplete="off"></textarea></div>'
                            +'<div id="cp_middle"></div>'
                            +'<div id="cp_right"></div>'
                        +'</div>'
                        +'<div id="cp_massage">'
                        +'</div>'
                        +'<div id="cp_bottom">'
                            +'<span id="compare" class="btn-submit-large">Compare</span>'
                            +'<span id="cancelCompare" class="btn-submit-large">Cancel</span>'
                        +'</div>'
                    +'</div>'
                    +'<div id="compare_result"></div>'
                +'</div>';
    $(document.body).append(popup);
    let tp = window.innerHeight * 0.2;
    let result = values.split("#");
    $("#compare_dialog").dialog({
            modal: false,
            position: { my: "center top+"+tp, at: "center top", of:window},
            width:"50%",
            title: "Compare Your Values with GDC Permissible Values ",
            open: function() {
                //display result in a table
                let html = "";
                let count = 0;
                result.forEach(function(emt){
                    html += "<div><b>"+(++count)+".</b> "+emt+"</div>"
                });

                $('#cp_right').html(html);
                $('#cp_result').css("display", "none");
                $('#compare').bind('click', function(){
                    compare(result);
                });
                $('#cancelCompare').bind('click', function(){
                    $("#compare_dialog").dialog('close');
                });
            },
            close: function() {
                $(this).remove();
            }
    });
};

var compare = function(gv){
    if($('#cp_input').val().trim() === ''){
        $('#cp_massage').css("display", "block");
        $("#cp_massage").removeClass();
        $('#cp_massage').addClass("div-message");
        $('#cp_massage').html("Please type in user defined values.");
        return;
    }
    else{
        //compare and render
        $('#cp_massage').css("display", "none");
        $("#cp_massage").removeClass();
        $('#cp_massage').html("");
        $('#compare_form').css("display", "none");
        $('#compare_result').css("display", "block");
        let vs = $('#cp_input').val().split(/\n/);

        let opt = {};
        opt.sensitive = false;
        opt.unmatched = false;
        let table = generateCompareResult(vs, gv, opt);
        let html = '<div class="cp_result_title">Compare Result</div>'
                    +'<div id="cp_result_option"><div class="option-left"><input type="checkbox" id="compare_filter"> Case Sensitive</div><div class="option-right"><input type="checkbox" id="compare_unmatched"> Hide Unmatched Values</div></div>'
                    +'<div id="cp_result_table">'+table+'</div>'
                    +'<div id="cp_result_bottom"><span id="back2Compare" class="btn-submit-large">Back</span></div>'
                    +'</div>';
        $('#compare_result').html(html);

        let h = $('#cp_result_table table:first-child').height() +1;
        if(h >= 30 * 12.8){
            h = 384;
        }
        $('#cp_result_table').height(h+'px');
        $('#compare_filter').bind('click', function(){
            let options = {};
            options.sensitive = $("#compare_filter").prop('checked');
            options.unmatched = $("#compare_unmatched").prop('checked');
            let table_new = generateCompareResult(vs, gv, options);
            $('#cp_result_table').html(table_new);
            let h = $('#cp_result_table table:first-child').height() +1;
            if(h >= 30 * 12.8){
                h = 384;
            }
            $('#cp_result_table').height(h+'px');
        });
        $('#compare_unmatched').bind('click', function(){
            let options = {};
            options.sensitive = $("#compare_filter").prop('checked');
            options.unmatched = $("#compare_unmatched").prop('checked');
            let table_new = generateCompareResult(vs, gv, options);
            $('#cp_result_table').html(table_new);
            let h = $('#cp_result_table table:first-child').height() +1;
            if(h >= 30 * 12.8){
                h = 384;
            }
            $('#cp_result_table').height(h+'px');
        });
        $('#back2Compare').bind('click', function(){
            $('#compare_result').html("");
            $('#compare_result').css("display", "none");
            $('#compare_form').css("display", "block");
        });

    }
};

var generateCompareResult = function(fromV, toV, option){
    let v_lowercase = [], v_matched = [];
    if(option.sensitive){
        toV.forEach(function(v){
            v_lowercase.push(v.trim());
        });
    }
    else{
        toV.forEach(function(v){
            v_lowercase.push(v.trim().toLowerCase());
        });
    }

    let table = '<table width="100%"><tbody><tr class="data-table-head center"><td width="50%" style="text-align:left;">User Defined Values</td><td width="50%" style="text-align:left;">Matched GDC Values</td></tr>';

    fromV.forEach(function(v){
        let tmp = $.trim(v);
        if(tmp ===''){
            return;
        }
        let text = '';
        let idx = option.sensitive ? v_lowercase.indexOf(tmp) : v_lowercase.indexOf(tmp.toLowerCase());
        if(idx >= 0){
            text = toV[idx];
            v_matched.push(idx);
        }
        if(text ===''){
            text = '<div style="color:red;">--</div>';
            table += '<tr class="data-table-row"><td align="left">'+v+'</td><td align="left">'+text+'</td></tr>';
        }
        else{
            table += '<tr class="data-table-row"><td align="left">'+v+'</td><td align="left"><b>'+(idx+1)+'.</b>'+text+'</td></tr>';
        }
    });
    for(var i = 0; i< toV.length; i++){
        if(v_matched.indexOf(i) >= 0){
            continue;
        }
        table += '<tr class="data-table-row '+(option.unmatched ? 'row-undisplay' : '')+'"><td align="left"><div style="color:red;">--</div></td><td align="left"><b>'+(i+1)+'.</b>'+toV[i]+'</td></tr>';
    }
    table += "</tbody></table>";
    return table;
};

var search = function(){
    let keyword = $("#keywords").val();
    keyword = keyword.toLowerCase();
    let option = {};
    option.desc = $("#i_desc").prop('checked');
    option.syn = $("#i_syn").prop('checked');
    option.match = $("input[name=i_match]:checked").val();
    $("#suggestBox").css("display","none");
    displayBoxIndex = -1;
    $.getJSON('./search/all', {keyword:keyword, option: JSON.stringify(option)}, function(result){
        let items = [];
        if(result.length !== 0){
            result.forEach(function(hit){
                let it = {};
                it.doc = hit._source;
                it.highlight = hit.highlight;
                items.push(it);
            });
        }
        render(keyword, option, items);
        $("#centeredmenu ul a").bind("click", function(){
            $("#centeredmenu ul a").removeClass("active");
            $(this).addClass("active");
            tab_idx = $(this)[0].id;
            let t = "table_"+tab_idx;
            $("#table_results").css("display","none");
            $("#table_props").css("display","none");
            $("#table_values").css("display","none");
            $("#"+t).css("display","block");
        });
        $("#type_table").treetable({expandable: true});

    });

};

//find the word with the first character capitalized
var findWord = function(words){
    let word = "";
    words.forEach(function(w){
        if(word !== ""){
            return;
        }
        if(/^[A-Z]/.test(w)){
            word = w;
        }
    });
    if(word == ""){
        word = words[0];
    }
    return word;
}
