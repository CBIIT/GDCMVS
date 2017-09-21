import tmpl from './view';
import api from '../api';

const func = {
  getGDCData(prop, item) {
 	api.getGDCDataById(prop, function(id, items) {
 		if($('#gdc_data').length){
            $('#gdc_data').remove();
        }
        let target = item == undefined ? item : item.replace(/<b>/g,"").replace(/<\/b>/g, "");
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
                width:"30%",
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
                width:"50%",
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
            width:"50%",
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
  compare(){

  },
  compareGDC(){

  }
};

export default func;