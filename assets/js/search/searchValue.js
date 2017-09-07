var tableObj;

class MessageComponent extends React.Component{
    render(){
        return React.createElement("div", {className:"info"}, this.props.message);
    }
};

class TableComponent extends React.Component {
    constructor(props){
        super(props);
        this.state = {value: props.keyword, items: props.items};
    }
    updateState(stateChange){
        this.setState(stateChange);
    }
    render(){
        let result;
        if(this.state.items.length ===0){
            result = React.createElement("div", {className:"info"}, "No result found for keyword:"+this.state.value);
        }
        else{
            let trs = [];
            let count = 0;
            this.state.items.forEach(function(item){
                count++;
                let entry = {};
                entry.id = count + "_" + item.id;
                entry.title = item.title;
                entry.description = item.description;
                entry.category = item.category;
                entry["data-tt-id"] = entry.id;
                entry["data-tt-parent-id"] = "--";
                entry.type = "folder";
                if(item.properties.length === 0){
                    entry.node = "leaf";
                    trs.push(entry);
                }
                else{
                    entry.node = "branch";
                    trs.push(entry);
                    item.properties.forEach(function(prop){
                        count++;
                        let p = {};
                        p.id = count + "_" + prop.name;
                        p.title = prop.name;
                        p.description = (prop.description === undefined ? ((prop.term !== undefined && prop.term.description !== undefined) ? prop.term.description : "--") : prop.description);
                        p.category = "--";
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
                                e.category = "--";
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
                                        e.category = "--";
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
                }
            });
            result = React.createElement(
                                            "table",
                                            {border:"0", cellPadding: "0", cellSpacing: "0" , width:"100%", className: "data-table treetable" ,id: "type-table"},
                                            React.createElement("tbody", null,
                                                React.createElement("tr",{className:"data-table-head"}, 
                                                    React.createElement("td", {width:"25%"},"type"),
                                                    React.createElement("td", {width:"60%"}, "description"),
                                                    React.createElement("td", {width:"15%"}, "category")),
                                                trs.map(r => React.createElement("tr", {key:r.id,className: "data-table-row " + r.node, "data-tt-id": r["data-tt-id"], "data-tt-parent-id": r["data-tt-parent-id"]}, 
                                                    React.createElement("td",null,
                                                        React.createElement("span",{className:r.type},r.title)),
                                                    React.createElement("td", null, r.description),
                                                    React.createElement("td", null, r.category)))
                                            )
                                        );
        }
        return  result;
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

        let values = (keyword.trim() === "" ? [] : keyword.split(","));
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
            let hl_str = JSON.stringify(hl);
            let newValues = [];
            values.forEach(function(v){
                if(hl_str.indexOf("<b>"+v.trim()+"</b>") <0){
                    newValues.push(v.trim());
                }
            });
            values = newValues;
            let p_enum = (hl === undefined || hl["properties.enum"] === undefined? [] : hl["properties.enum"]);
            let enums = [];
            p_enum.forEach(function(em){
                enums.push(em.replace(/<b>/g,"").replace(/<\/b>/g, ""));
            });
            let p_enum_oneof = (hl === undefined || hl["properties.oneOf.enum"] === undefined ? [] : hl["properties.oneOf.enum"]);
            let enums_oneof = [];
            p_enum_oneof.forEach(function(eo){
                enums_oneof.push(eo.replace(/<b>/g,"").replace(/<\/b>/g, ""));
            });
            entry.oid = item.id;
            entry.id = count + "_" + item.id;
            //highlight
            entry.title = item.title;
            entry.description = item.description;
            // entry.category = item.category;
            entry["data-tt-id"] = entry.id;
            entry["data-tt-parent-id"] = current_category;
            entry.type = "folder";
            if(item.properties.length === 0){
                entry.node = "leaf";
                trs.push(entry);
            }
            else{
                entry.node = "branch";
                trs.push(entry);
                item.properties.forEach(function(prop){
                    count++;
                    let p = {};
                    p.id = count + "_" + prop.name;
                    p.title = prop.name;
                    p.description = (prop.description === undefined ? ((prop.term !== undefined && prop.term.description !== undefined) ? prop.term.description : "--") : prop.description);
                    // p.category = "--";
                    p["data-tt-id"] = p.id;
                    p["data-tt-parent-id"] = entry.id;
                    p.type="property";
                    if(prop.enum !== undefined){
                        p.node = "branch";
                        
                        let flag = false;
                        enums.forEach(function(es){
                            if(prop.enum.indexOf(es) >=0){
                                flag = true;
                                return;
                            }
                        });
                        if(keyword.trim() !=="" && !flag){
                            return;
                        }
                        trs.push(p);
                        prop.enum.forEach(function(em){
                            count++;
                            let e = {};
                            e.id = count + "_v";
                            e.title = em;
                            if(enums.indexOf(em) >= 0){
                                p.highlight = true;
                                e.highlight = true;
                            }
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

                        let flag = false;
                        let all_values = [];
                        prop.oneOf.forEach(function(em){
                            if(em.enum !== undefined){
                                all_values = all_values.concat(em.enum);
                            }
                        });
                        enums_oneof.forEach(function(es){
                            if(all_values.indexOf(es) >=0){
                                flag = true;
                                return;
                            }
                        });
                        if(keyword.trim() !=="" && !flag){
                            return;
                        }
                        trs.push(p);
                        all_values.forEach(function(em){
                            count++;
                            let e = {};
                            e.id = count + "_v";
                            e.title = em;
                            if(enums_oneof.indexOf(em) >= 0){
                                p.highlight = true;
                                e.highlight = true;
                            }
                            e.description = "--";
                            // e.category = "--";
                            e["data-tt-id"] = e.id;
                            e["data-tt-parent-id"] = p.id;
                            e.type = "value";
                            e.node = "leaf";
                            trs.push(e);
                        });
                    }
                    else if(keyword.trim() ===""){
                        p.node = "leaf";
                        trs.push(p);
                    }
                });
            }
        });

        //check if the result for any word is empty, if so, then give a message
        if(values.length > 0){
            let d = document.createElement("div");
            d.className = "info";
            d.innerHTML = "No result found for keyword: "+values.toString();
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
    let msg = "please enter a single property value or multiple values separated by comma.";
    ReactDOM.render(React.createElement(MessageComponent,{message: msg}),document.getElementById('container'));
    $("#searchValue").bind("click", search);
    $("#values").bind("keypress", function(e){
        if (e.keyCode == 13) {
            //e.preventDefault();
            search();
        }
    });
});

var search = function(){
    let keyword = $("#values").val();
    $.getJSON('./search/value', {val:keyword}, function(result){
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
