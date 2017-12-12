import tmpl from './view';
import api from '../api';
import shared from '../shared'

const func = {
  getGDCData(prop, item) {
 	api.getGDCDataById(prop, function(id, items) {
 		if($('#gdc_data').length){
            $('#gdc_data').remove();
        }
        let windowEl = $(window);
        let icdo = false;
        items.forEach(function(item){
            if(item.i_c !== undefined){
                icdo = true;
            }
        });
        
        let target = item == undefined ? item : item.replace(/<b>/g,"").replace(/<\/b>/g, "");
        let html = $.templates(tmpl.gdc_data).render({target:target, icdo: icdo, items: items });
        let tp = (window.innerHeight * 0.2 < shared.headerOffset() )? 0 : window.innerHeight * 0.2;

        //display result in a table
        $(document.body).append(html);
        if(target !== undefined){
            $('#show_all_gdc_data').bind('click', function(){
                let v = $(this).prop("checked");
                if(v){
                    $('#gdc-data-list div[style="display: none;"]').each(function(){
                        $(this).css("display","block");
                    });
                    var setScroll = $('#gdc_data_match').offset().top - $('#gdc-data-list').offset().top;
                    $('#gdc-data-list').scrollTop(setScroll - 120);
                }
                else{
                    $('#gdc-data-list div[style="display: block;"]').each(function(){
                        $(this).css("display","none");
                    });
                }
            });
        }

        $('#gdc_data').dialog({
            modal: false,
            position: { my: 'center top+'+tp, at: 'center top', of:$('#docs-container')},
            width: '45%',
            minWidht: '385px',
            title: 'GDC Values ('+items.length+')',
            open: function() {
                var target = $(this).parent();
                if((target.offset().top - windowEl.scrollTop()) < shared.headerOffset()){
                    target.css('top', (windowEl.scrollTop() + shared.headerOffset() + 20)+'px');
                }
            },
            close: function() {
                $(this).remove();
            }
        }).parent().draggable({
            containment: '#docs-container'
        });
      	
    });
    
  },
  getGDCSynonyms(uid, tgts){
  	api.getGDCDataById(uid, function(id, items) {
 		if($('#gdc_syn_data').length){
            $('#gdc_syn_data').remove();
        }
        let targets = null;
        let icdo = false;
        let windowEl = $(window);
        if(tgts !== null && tgts !== undefined){
            targets = tgts.split("#"); 

            items.forEach(function(item){
                if(item.i_c !== undefined){
                    icdo = true;
                }
                if (targets.indexOf(item.n) > -1){
                    item.e = true;
                }
            });
        }
        else{
            items.forEach(function(item){
                if(item.i_c !== undefined){
                    icdo = true;
                }
            });
        }
        items.forEach(function(it){
            if(it.s == undefined) return;
            let cache = {};
            let tmp_s = [];
            it.s.forEach(function(s){
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
            it.s_r = tmp_s;
        }); 
        let html = $.templates({markup: tmpl.gdc_synonyms, allowCode: true}).render({targets: targets, icdo: icdo, items: items });
        let tp = (window.innerHeight * 0.2 < shared.headerOffset() )? shared.headerOffset() + 20 : window.innerHeight * 0.2;
        //display result in a table
        $(document.body).append(html);

        if(tgts !== null && tgts !== undefined && tgts !== ""){
            $('#show_all_gdc_syn').bind('click', function(){
                let v = $(this).prop("checked");
                if(v){
                    $('#gdc-syn-data-list div.table-row[style="display: none;"]').each(function(){
                        $(this).css("display","block");
                    });
                } else {
                    $('#gdc-syn-data-list div.table-row[style="display: block;"]').each(function(){
                        $(this).css("display","none");
                    });
                }
            });
        }


        $("#gdc_syn_data").dialog({
                modal: false,
                position: { my: "center top+"+tp, at: "center top", of:$('#docs-container')},
                width:"55%",
                title: "GDC Terms ("+items.length+")",
                open: function() {
                    var target = $(this).parent();
                    if((target.offset().top - windowEl.scrollTop()) < shared.headerOffset()){
                        target.css('top', (windowEl.scrollTop() + shared.headerOffset() + 20)+'px');
                    }

                    $('#gdc-data-invariant').bind('click', function(){
                            $("#gdc-syn-data-list").find('div[name="syn_area"]').each(function(){
                                let rp = $(this).html();
                                let invariant = $(this).parent().children('div[name="syn_invariant"]');
                                $(this).html(invariant[0].innerHTML);
                                invariant[0].innerHTML = rp;
                            });
                        });
                },
                close: function() {
                    $(this).remove();
                }
        }).parent().draggable({
            containment: '#docs-container'
        });
      	
    });
  },
  toCompare(uid){
  	api.getGDCDataById(uid, function(id, items) {
 		if($('#compare_dialog').length){
            $('#compare_dialog').remove();
        }
        let windowEl = $(window);
        let html = $.templates(tmpl.toCompare).render({items: items });
        let tp = (window.innerHeight * 0.2 < shared.headerOffset() )? shared.headerOffset() + 20 : window.innerHeight * 0.2;
        //display result in a table
        $(document.body).append(html);
        $("#compare_dialog").dialog({
            modal: false,
            position: { my: "center top+"+tp, at: "center top", of:$('#docs-container')},
            width:"60%",
            title: "Compare Your Values with GDC Values ",
            open: function() {

                var target = $(this).parent();
                if((target.offset().top - windowEl.scrollTop()) < shared.headerOffset()){
                    target.css('top', (windowEl.scrollTop() + shared.headerOffset() + 20)+'px');
                }

            	$('#cp_result').css("display", "none");
                $('#compare').bind('click', function(){
                    let gv = [];
                    items.forEach(function(item){
                    	gv.push(item.n);
                    });
                    compare(gv);
                });
                $('#cancelCompare').bind('click', function(){
                    $("#compare_dialog").dialog('close');
                });
            },
            close: function() {
                $(this).remove();
            }
        }).parent().draggable({
            containment: '#docs-container'
        });
      	
    });
  },
  getCDEData(uid, tgts){

        api.getCDEDataById(uid, function(id, items) {
            //data precessing
            let tmp = [];
            items.forEach(function(item){
                let t = {};
                t.pv = item.n;
                t.pvm = item.m;
                t.pvd = item.d;
                t.i_rows = [];
                t.rows = [];
                item.ss.forEach(function(s){
                    let i_r = {};
                    let r = {};
                    i_r.pvc = s.c;
                    r.pvc = s.c;
                    r.s = s.s;
                    i_r.s = [];
                    //remove duplicate
                    let cache = {};
                    s.s.forEach(function(w){
                        let lc = w.trim().toLowerCase();
                        if(!(lc in cache)){
                            cache[lc] = [];
                        }
                        cache[lc].push(w);
                    });
                    for(let idx in cache){
                        //find the term with the first character capitalized
                        let word = findWord(cache[idx]);
                        i_r.s.push(word);
                    }
                    t.i_rows.push(i_r);
                    t.rows.push(r);
                });
                tmp.push(t);
            });

            let targets = null;
            let windowEl = $(window);
            
            if(tgts !== null && tgts !== undefined && tgts !== ""){
                tgts = tgts.replace(/\^/g,'\'');
                targets = tgts.split("#"); 

                tmp.forEach(function(item){
                if (targets.indexOf(item.pv) > -1){
                    item.e = true;
                }
                });
            }

            if($('#caDSR_data').length){
                $('#caDSR_data').remove();
            }

            let html = $.templates({markup: tmpl.cde_data, allowCode: true}).render({targets: targets, items: tmp });
            let tp = (window.innerHeight * 0.2 < shared.headerOffset() )? shared.headerOffset() + 20 : window.innerHeight * 0.2;
            //display result in a table
            $(document.body).append(html);
            
            if(targets !== undefined){
                $('#show_all_cde_syn').bind('click', function(){
                    let v = $(this).prop("checked");
                    if(v){
                        $('#cde-syn-data-list div.table-row[style="display: none;"]').each(function(){
                            $(this).css("display","block");
                        });
                    }
                    else{
                        $('#cde-syn-data-list div.table-row[style="display: block;"]').each(function(){
                            $(this).css("display","none");
                        });
                    }
                });
            }


            $("#caDSR_data").dialog({
                    modal: false,
                    position: { my: "center top+"+tp, at: "center top", of:$('#docs-container')},
                    width:"60%",
                    title: "caDSR Values ("+tmp.length+")",
                    open: function() {
                        var target = $(this).parent();
                        if((target.offset().top - windowEl.scrollTop()) < shared.headerOffset()){
                            target.css('top', (windowEl.scrollTop() + shared.headerOffset() + 20)+'px');
                        }

                        $('#cde-data-invariant').bind('click', function(){
                            $("#cde-syn-data-list").find('div[name="syn_area"]').each(function(){
                                let rp = $(this).html();
                                let invariant = $(this).parent().children('div[name="syn_invariant"]');
                                $(this).html(invariant[0].innerHTML);
                                invariant[0].innerHTML = rp;
                            });
                        });
                    },
                    close: function() {
                        $(this).remove();
                    }
            }).parent().draggable({
              containment: '#docs-container'
            });
            
        });
  },
  compareGDC(prop, uid){
    let ids = {};
    ids.local = prop;
    ids.cde = uid;
    api.getGDCandCDEDataById(ids, function(ids, items) {
        if($('#compareGDC_dialog').length){
            $('#compareGDC_dialog').remove();
        }
        let windowEl = $(window);
        let popup = '<div id="compareGDC_dialog">'
                        +'<div id="compareGDC_result"></div>'
                    +'</div>';
        $(document.body).append(popup);
        let tp = (window.innerHeight * 0.2 < shared.headerOffset() )? shared.headerOffset() + 20 : window.innerHeight * 0.2;
        let toV = [];
        let fromV = [];
        let opt = {};
        opt.sensitive = false;
        opt.unmatched = false;
        items.to.forEach(function(t){
            toV.push(t.n);
        });
        items.from.forEach(function(f){
            fromV.push(f.n);
        });
        let table = generateCompareGDCResult(fromV, toV, opt);
        let html = '<div class="cp_result_title">Compare Result</div>'
                    +'<div id="cpGDC_result_option">'
                        +'<div class="option-left"><input type="checkbox" id="compareGDC_filter"> Case Sensitive</div><div class="option-right"><input type="checkbox" id="compareGDC_unmatched"> Hide Unmatched Values</div></div><div class="clearfix"></div>'
                    +'<div id="cpGDC_result_table" class="table-container">'+table+'</div>'
                    +'</div>';

        $('#compareGDC_result').html(html);
        
        $("#compareGDC_dialog").dialog({
                modal: false,
                position: { my: "center top+"+tp, at: "center top", of:$('#docs-container')},
                width:"50%",
                title: "Compare GDC Values with caDSR Values ",
                open: function() {

                    var target = $(this).parent();
                    if((target.offset().top - windowEl.scrollTop()) < shared.headerOffset()){
                        target.css('top', (windowEl.scrollTop() + shared.headerOffset() + 20)+'px');
                    }

                    $('#compareGDC_filter').bind('click', function(){
                        let options = {};
                        options.sensitive = $("#compareGDC_filter").prop('checked');
                        options.unmatched = $("#compareGDC_unmatched").prop('checked');
                        let table_new = generateCompareGDCResult(fromV, toV, options);
                        $('#cpGDC_result_table').html(table_new);
                    });
                    $('#compareGDC_unmatched').bind('click', function(){
                        let options = {};
                        options.sensitive = $("#compareGDC_filter").prop('checked');
                        options.unmatched = $("#compareGDC_unmatched").prop('checked');
                        let table_new = generateCompareGDCResult(fromV, toV, options);
                        $('#cpGDC_result_table').html(table_new);
                    });
                },
                close: function() {
                    $(this).remove();
                }
        }).parent().draggable({
            containment: '#docs-container'
        });
    });
  },
  ncitDetails(uid){
    api.evsRestApi(uid, function(id, item) {
        
        let tmp = {};
        tmp.code = item.code;
        tmp.name = item.preferredName
        tmp.definition = item.definitions.length ? item.definitions.find(function(defs){ return defs.defSource === 'NCI' }).description : undefined;
        let tmp_s = item.synonyms.map(function(syns){ return syns.termName });
        tmp.synonyms = [];
        //remove the duplicate

        let cache = {};
        if(tmp_s.length > 0){
            tmp_s.forEach(function(s){
                let lc = s.trim().toLowerCase();
                if(!(lc in cache)){
                    cache[lc] = [];
                }
                cache[lc].push(s);
            });
            for(let idx in cache){
                //find the term with the first character capitalized
                let word = findWord(cache[idx]);
                tmp.synonyms.push(word);
            }
        }
        

        if($('#ncit_details').length){
            $('#ncit_details').remove();
        }

        let windowEl = $(window);
        let tp = (window.innerHeight * 0.2 < shared.headerOffset() )? shared.headerOffset() + 20 : window.innerHeight * 0.2;
        let html = $.templates(tmpl.ncit_details).render({item: tmp});

        $(document.body).append(html);

        $('#ncit_details').dialog({
            modal: false,
            position: { my: "center top+"+tp, at: "center top", of:$('#docs-container')},
            width: '45%',
            title: 'NCIt Terms & Properties',
            open: function() {

                var target = $(this).parent();
                if((target.offset().top - windowEl.scrollTop()) < shared.headerOffset()){
                    target.css('top', (windowEl.scrollTop() + shared.headerOffset() + 20)+'px');
                }
            },
            close: function() {
                $(this).remove();
            }
        }).parent().draggable({
            containment: '#docs-container'
        });
    });
  }
};

export default func;