var tableObj;

class MessageComponent extends React.Component{
    render(){
        return React.createElement("div", {className:"info"}, this.props.message);
    }
};

function render(keyword, items){
    let c = document.getElementById('container');
    c.innerHTML = "";
    if(items.length ===0){
        let d = document.createElement("div");
        d.className = "info";
        d.innerHTML = "No result found for keyword: "+keyword;
        c.appendChild(d);
    }
    else{
        let trs = [];
        let count = 0;
        
        let words = (keyword.trim() === "" ? [] : keyword.split(","));
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
            let hl_str = JSON.stringify(hl);
            let newWords = [];
            words.forEach(function(w){
                if(hl_str.indexOf("<b>"+w.trim()+"</b>") <0){
                    newWords.push(w.trim());
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
                    }
                });
            }
            
            let propName = (hl === undefined || hl["properties.name"] === undefined? [] : hl["properties.name"]);
            let propNames = [];
            propName.forEach(function(pn){
                propNames.push(pn.replace(/<b>/g,"").replace(/<\/b>/g, ""));
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
                    if(target_propNames.length > 0 && target_propNames.indexOf(p.title) >=0){
                        p.highlight = true;
                    }
                    else if(propNames.length > 0){
                        propNames.forEach(function(pn){
                            if(p.title === pn){
                                p.highlight = true;
                                return;
                            }
                        });
                    }
                    p.description = (prop.description === undefined ? ((prop.term !== undefined && prop.term.description !== undefined) ? prop.term.description : "--") : prop.description);
                    if(p.description !== "--" && desc_tmp.length !== 0){
                        desc_tmp.forEach(function(d){
                            if(d.l === p.description.length && d.v === p.description){
                                p.description = d.o;
                                p.highlight = true;
                                delete desc_tmp[d];
                                return;
                            }
                        });
                    }
                    if(keyword.trim() !== "" && (p.highlight === undefined || !p.highlight)){
                        return;
                    }
                    prop_count++;
                    // p.category = "--";
                    p["data-tt-id"] = p.id;
                    p["data-tt-parent-id"] = entry.id;
                    p.type="property";
                    if(prop.enum !== undefined){
                        p.node = "branch";
                        trs.push(p);
                        prop.enum.forEach(function(em){
                            count++;
                            let e = {};
                            e.id = count + "_v";
                            e.title = em;
                            e.description = "--";
                            // e.category = "--";
                            e["data-tt-id"] = e.id;
                            e["data-tt-parent-id"] = p.id;
                            e.type = "value";
                            e.node = "leaf";
                            trs.push(e);
                        });
                    }
                    else if(prop.oneOf !== undefined && $.isArray(prop.oneOf)){
                        p.node = "branch";
                        trs.push(p);
                        prop.oneOf.forEach(function(em){
                            if(em.enum !== undefined){
                                em.enum.forEach(function(v){
                                    count++;
                                    let e = {};
                                    e.id = count + "_v";
                                    e.title = v;
                                    e.description = "--";
                                    // e.category = "--";
                                    e["data-tt-id"] = e.id;
                                    e["data-tt-parent-id"] = p.id;
                                    e.type = "value";
                                    e.node = "leaf";
                                    trs.push(e);
                                });
                            }
                            
                        });
                    }
                    else{
                        p.node = "leaf";
                        trs.push(p);
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
        let t = document.createElement("table");
        t.border = "0";
        t.cellPadding = "0";
        t.cellSpacing = "0";
        t.width = "100%";
        t.className = "data-table treetable";
        t.id = "type-table";
        let tb = document.createElement("tbody");
        t.appendChild(tb);
        let th = document.createElement("tr");
        th.className = "data-table-head";
        tb.appendChild(th);
        let td = document.createElement("td");
        td.width = "20%";
        td.innerHTML = "name";
        th.appendChild(td);
        td = document.createElement("td");
        td.width = "60%";
        td.innerHTML = "description";
        th.appendChild(td);
        // td = document.createElement("td");
        // td.width = "20%";
        // td.innerHTML = "category";
        // th.appendChild(td);
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
            td = document.createElement("td");
            td.innerHTML = r.description;
            tr.appendChild(td);
            // td = document.createElement("td");
            // td.innerHTML = r.category;
            // tr.appendChild(td);
            tb.appendChild(tr);
        });
        c.appendChild(t);
    }
}

$(document.body).ready(function(){
    $("#prop_s").bind("click", function(){
        window.location = "./ui?idx=1";
    });
    $("#prop_value_s").bind("click", function(){
        window.location = "./ui?idx=2";
    });
    let msg = "please enter a single property term or multiple terms separated by comma.";
    ReactDOM.render(React.createElement(MessageComponent,{message: msg}),document.getElementById('container'));
    $("#searchProperty").bind("click", search);
    $("#keywords").bind("keypress", function(e){
        if (e.keyCode == 13) {
            //e.preventDefault();
            search();
        }
    });
    $("#sm-table").treetable({expandable: true});
});

var search = function(){
    let keyword = $("#keywords").val();
    $.getJSON('./search/all', {keyword:keyword}, function(result){
        let items = [];
        if(result.length !== 0){
            result.forEach(function(hit){
                let it = {};
                it.doc = hit._source;
                it.highlight = hit.highlight;
                items.push(it);
            }); 
        }
        render(keyword, items);
        $("#type-table").treetable({expandable: true});
        
    });
    
}
