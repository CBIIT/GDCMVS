import tmpl from './view';
import api from '../api';

const func = {
  getGDCData(prop, item) {
 	api.getGDCDataById(prop, function(id, items) {
 		if($('#gdc_data').length){
            $('#gdc_data').remove();
        }
        let target = item == undefined ? item : item.replace(/<b>/g,"").replace(/<\/b>/g, "");
        console.log(target + "       done!");
        let html = $.templates(tmpl.gdc_data).render({target:target,items: items });
        let tp = window.innerHeight * 0.2;
        //display result in a table
        $(document.body).append(html);
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
        $("#gdc_data").dialog({
                modal: false,
                position: { my: "center top+"+tp, at: "center top", of:window},
                width:"35%",
                title: "GDC Permissible Values ("+items.length+")",
                open: function() {

                },
                close: function() {
                    $(this).remove();
                }
        });
      	
    });
    
  },
  getGDCSynonyms(uid){
  	api.getGDCDataById(uid, function(id, items) {
 		if($('#gdc_syn_data').length){
            $('#gdc_syn_data').remove();
        }
        let html = $.templates(tmpl.gdc_synonyms).render({items: items });
        let tp = window.innerHeight * 0.2;
        //display result in a table
        $(document.body).append(html);
        $("#gdc_syn_data").dialog({
                modal: false,
                position: { my: "center top+"+tp, at: "center top", of:window},
                width:"55%",
                title: "GDC Synonyms ("+items.length+")",
                open: function() {

                },
                close: function() {
                    $(this).remove();
                }
        });
      	
    });
  },
  toCompare(uid){
  	api.getGDCDataById(uid, function(id, items) {
 		if($('#compare_dialog').length){
            $('#compare_dialog').remove();
        }
        let html = $.templates(tmpl.toCompare).render({items: items });
        let tp = window.innerHeight * 0.2;
        //display result in a table
        $(document.body).append(html);
        $("#compare_dialog").dialog({
            modal: false,
            position: { my: "center top+"+tp, at: "center top", of:window},
            width:"60%",
            title: "Compare Your Values with GDC Permissible Values ",
            open: function() {
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
        });
      	
    });
  },
  getCDEData(uid){
        api.getCDEDataById(uid, function(id, items) {
            //data precessing
            let tmp = [];
            items.forEach(function(item){
                let t = {};
                t.pv = item.n;
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
            if($('#caDSR_data').length){
                $('#caDSR_data').remove();
            }

            let html = $.templates(tmpl.cde_data).render({items: tmp });
            let tp = window.innerHeight * 0.2;
            //display result in a table
            $(document.body).append(html);
            $("#caDSR_data").dialog({
                    modal: false,
                    position: { my: "center top+"+tp, at: "center top", of:window},
                    width:"60%",
                    title: "CaDSR Permissible Values ("+tmp.length+")",
                    open: function() {
                        $('#data-invariant').bind('click', function(){
                            $("#data-list").find('td[name="syn_area"]').each(function(){
                                let rp = $(this).html();
                                let invariant = $(this).parent().children('td[name="syn_invariant"]');
                                $(this).html(invariant[0].innerHTML);
                                invariant[0].innerHTML = rp;
                            });
                        });
                    },
                    close: function() {
                        $(this).remove();
                    }
            });
            
        });
  },
  compareGDC(prop, uid){
    let ids = {};
    ids.local = prop;
    ids.cde = uid;
    api.getGDCandCDEDataById(ids, function(ids, items) {
        console.log
        if($('#compareGDC_dialog').length){
            $('#compareGDC_dialog').remove();
        }
        let popup = '<div id="compareGDC_dialog">'
                        +'<div id="compareGDC_result"></div>'
                    +'</div>';
        $(document.body).append(popup);
        let tp = window.innerHeight * 0.2;
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
    });
  }
};

export default func;